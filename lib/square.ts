const SQUARE_BASE = 'https://connect.squareup.com/v2'

export const LOCATION_ID = process.env.SQUARE_LOCATION_ID!

/** Thin fetch wrapper — adds auth headers, returns raw Response */
export function squareFetch(path: string, options: RequestInit = {}): Promise<Response> {
  return fetch(`${SQUARE_BASE}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${process.env.SQUARE_ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
      'Square-Version': '2025-01-23',
      ...((options.headers ?? {}) as Record<string, string>),
    },
  })
}

// ── Transform helpers (REST snake_case → camelCase shape BookingFlow expects) ──

export interface WebsiteDescription {
  descriptionText: string
  includes: string[]
}

export interface WebsiteCustomAttributes {
  name?: string
  display?: boolean
  emphasis?: boolean
  merch?: boolean
  description?: WebsiteDescription
}

type CatalogItem = ReturnType<typeof transformItem>

const WEBSITE_DISPLAY_CUSTOM_ATTRIBUTE_DEFINITION_ID = '6HHNPNJ4LVXOSD5SI4FKPGTM'
const WEBSITE_MERCH_CUSTOM_ATTRIBUTE_DEFINITION_ID = 'FDEKYIIVAIBTD23ZKIZOYUBN'
const CATALOG_CACHE_TTL_MS = 5 * 60 * 1000

interface CatalogCache {
  expiresAt: number
  items?: CatalogItem[]
  promise?: Promise<CatalogItem[]>
}

const globalCatalogCache = globalThis as typeof globalThis & {
  __theLabCatalogCacheV4?: CatalogCache
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function getCustomAttribute(obj: Record<string, unknown>, key: string) {
  const values = obj.custom_attribute_values
  if (!isRecord(values)) return undefined

  return Object.entries(values).find(([attributeKey, attribute]) => {
    if (attributeKey === key) return true
    if (!isRecord(attribute)) return false

    return attribute.key === key || attribute.name === key
  })?.[1]
}

function getCustomAttributeByDefinitionId(obj: Record<string, unknown>, definitionId: string) {
  const values = obj.custom_attribute_values
  if (!isRecord(values)) return undefined

  return Object.values(values).find((attribute) => {
    if (!isRecord(attribute)) return false
    return attribute.custom_attribute_definition_id === definitionId
  })
}

function getCustomAttributeRawValue(attribute: unknown): unknown {
  if (!isRecord(attribute)) return attribute

  for (const valueKey of [
    'string_value',
    'stringValue',
    'boolean_value',
    'booleanValue',
    'number_value',
    'numberValue',
    'json_value',
    'jsonValue',
    'value',
  ]) {
    if (valueKey in attribute) return attribute[valueKey]
  }

  return attribute
}

function parseStringAttribute(value: unknown) {
  const raw = getCustomAttributeRawValue(value)
  return typeof raw === 'string' && raw.trim() ? raw : undefined
}

function parseBooleanAttribute(value: unknown) {
  const raw = getCustomAttributeRawValue(value)
  if (typeof raw === 'boolean') return raw
  if (typeof raw !== 'string') return undefined

  if (raw.toLowerCase() === 'true') return true
  if (raw.toLowerCase() === 'false') return false

  return undefined
}

function parseDescriptionAttribute(value: unknown): WebsiteDescription | undefined {
  const raw = getCustomAttributeRawValue(value)
  const parsed = typeof raw === 'string' ? tryParseJson(raw) : raw

  if (typeof raw === 'string' && raw.trim() && !isRecord(parsed)) {
    return {
      descriptionText: raw.trim(),
      includes: [],
    }
  }

  if (!isRecord(parsed)) return undefined

  const descriptionText = parsed.description_text ?? parsed.descriptionText
  const includes = parsed.includes

  if (typeof descriptionText !== 'string' || !Array.isArray(includes)) return undefined

  return {
    descriptionText,
    includes: includes.filter((include): include is string => typeof include === 'string' && include.trim().length > 0),
  }
}

function parseIncludes(value: unknown) {
  if (typeof value !== 'string') return []

  return value
    .split('\n')
    .map((item) => item.trim())
    .filter((item) => item.length > 0)
}

function tryParseJson(value: string) {
  try {
    return JSON.parse(value) as unknown
  } catch {
    return undefined
  }
}

function extractWebsiteCustomAttributes(obj: Record<string, unknown>): WebsiteCustomAttributes {
  const attrs: WebsiteCustomAttributes = {}
  const name = parseStringAttribute(getCustomAttribute(obj, 'website_name'))
  const display = parseBooleanAttribute(
    getCustomAttribute(obj, 'website_display') ?? getCustomAttributeByDefinitionId(obj, WEBSITE_DISPLAY_CUSTOM_ATTRIBUTE_DEFINITION_ID)
  )
  const emphasis = parseBooleanAttribute(getCustomAttribute(obj, 'website_emphasis'))
  const merch = parseBooleanAttribute(
    getCustomAttribute(obj, 'website_merch') ?? getCustomAttributeByDefinitionId(obj, WEBSITE_MERCH_CUSTOM_ATTRIBUTE_DEFINITION_ID)
  )
  const description = parseDescriptionAttribute(getCustomAttribute(obj, 'website_description'))

  if (name) attrs.name = name
  if (display !== undefined) attrs.display = display
  if (emphasis !== undefined) attrs.emphasis = emphasis
  if (merch !== undefined) attrs.merch = merch
  if (description) attrs.description = description

  return attrs
}

export function transformItem(obj: Record<string, unknown>) {
  const d = (obj.item_data ?? {}) as Record<string, unknown>
  const rawVars = (d.variations ?? []) as Record<string, unknown>[]
  const websiteCustomAttributes = extractWebsiteCustomAttributes(obj)
  const includes = parseIncludes(d.description_plaintext ?? d.description)

  if (websiteCustomAttributes.description && websiteCustomAttributes.description.includes.length === 0) {
    websiteCustomAttributes.description.includes = includes
  }

  const variations = rawVars.map((v) => {
    const vd = (v.item_variation_data ?? {}) as Record<string, unknown>
    const pm = vd.price_money as Record<string, unknown> | undefined
    return {
      id: v.id as string,
      type: v.type as string,
      version: String(v.version ?? ''),
      itemVariationData: {
        name: vd.name as string | undefined,
        priceMoney: pm
          ? { amount: String(pm.amount), currency: pm.currency as string }
          : undefined,
        serviceDuration: vd.service_duration != null ? String(vd.service_duration) : undefined,
        teamMemberIds: vd.team_member_ids as string[] | undefined,
      },
    }
  })

  return {
    id: obj.id as string,
    type: obj.type as string,
    version: String(obj.version ?? ''),
    itemData: {
      name: websiteCustomAttributes.name ?? (d.name as string | undefined),
      description: websiteCustomAttributes.description?.descriptionText ?? (d.description as string | undefined),
      productType: d.product_type as string | undefined,
      websiteCustomAttributes,
      variations,
    },
  }
}

export function hasWebsiteName(item: CatalogItem) {
  return Boolean(item.itemData.websiteCustomAttributes.name)
}

export function isWebsiteMerchItem(item: CatalogItem) {
  const attrs = item.itemData.websiteCustomAttributes
  return attrs.display === true && attrs.merch === true
}

export function isWebsiteMembershipItem(item: CatalogItem) {
  const attrs = item.itemData.websiteCustomAttributes
  return Boolean(
    attrs.merch !== true &&
    attrs.name &&
    Object.hasOwn(attrs, 'emphasis') &&
    attrs.description?.descriptionText
  )
}

export async function fetchCatalogItems() {
  const now = Date.now()
  const cached = globalCatalogCache.__theLabCatalogCacheV4

  if (cached?.items && cached.expiresAt > now) {
    return cached.items
  }

  if (cached?.promise && cached.expiresAt > now) {
    return cached.promise
  }

  const promise = fetchFreshCatalogItems()
  globalCatalogCache.__theLabCatalogCacheV4 = {
    expiresAt: now + CATALOG_CACHE_TTL_MS,
    promise,
  }

  try {
    const items = await promise
    globalCatalogCache.__theLabCatalogCacheV4 = {
      expiresAt: Date.now() + CATALOG_CACHE_TTL_MS,
      items,
    }
    return items
  } catch (err) {
    globalCatalogCache.__theLabCatalogCacheV4 = undefined
    throw err
  }
}

export function clearCatalogItemsCache() {
  globalCatalogCache.__theLabCatalogCacheV4 = undefined
}

async function searchCatalogItems(body: Record<string, unknown>) {
  const items: CatalogItem[] = []
  let cursor: string | undefined

  do {
    const res = await squareFetch('/catalog/search-catalog-items', {
      method: 'POST',
      body: JSON.stringify({
        ...body,
        limit: 100,
        ...(cursor ? { cursor } : {}),
      }),
    })

    if (!res.ok) throw new Error(`Square catalog ${res.status}: ${await res.text()}`)

    const data = (await res.json()) as {
      items?: Record<string, unknown>[]
      cursor?: string
    }

    for (const obj of data.items ?? []) {
      if (obj.type === 'ITEM' && obj.item_data) {
        items.push(transformItem(obj))
      }
    }

    cursor = data.cursor
  } while (cursor)

  return items
}

async function fetchFreshCatalogItems() {
  const [displayItems, appointmentServices] = await Promise.all([
    searchCatalogItems({
      custom_attribute_filters: [
        {
          custom_attribute_definition_id: WEBSITE_DISPLAY_CUSTOM_ATTRIBUTE_DEFINITION_ID,
          bool_filter: true,
        },
      ],
    }),
    searchCatalogItems({
      product_types: ['APPOINTMENTS_SERVICE'],
    }),
  ])

  return Array.from(
    [...displayItems, ...appointmentServices]
      .reduce((itemsById, item) => itemsById.set(item.id, item), new Map<string, CatalogItem>())
      .values()
  )
}

export function transformAvailability(a: Record<string, unknown>) {
  const segs = (a.appointment_segments ?? []) as Record<string, unknown>[]
  return {
    startAt: a.start_at as string,
    appointmentSegments: segs.map((s) => ({
      teamMemberId: s.team_member_id as string | undefined,
      serviceVariationId: s.service_variation_id as string | undefined,
      serviceVariationVersion:
        s.service_variation_version != null ? String(s.service_variation_version) : undefined,
    })),
  }
}

export function transformBooking(b: Record<string, unknown>) {
  return {
    id: b.id as string,
    startAt: b.start_at as string | undefined,
  }
}

/** Shared helper — find existing Square customer or create a new one */
export async function findOrCreateCustomer(
  email: string,
  name: string,
  phone: string
): Promise<string | undefined> {
  const searchRes = await squareFetch('/customers/search', {
    method: 'POST',
    body: JSON.stringify({
      query: { filter: { email_address: { exact: email } } },
    }),
  })

  if (searchRes.ok) {
    const data = (await searchRes.json()) as { customers?: { id: string }[] }
    if (data.customers && data.customers.length > 0) return data.customers[0].id
  }

  const [firstName, ...rest] = name.split(' ')
  const createRes = await squareFetch('/customers', {
    method: 'POST',
    body: JSON.stringify({
      idempotency_key: crypto.randomUUID(),
      given_name: firstName,
      family_name: rest.join(' ') || '',
      email_address: email,
      phone_number: phone,
    }),
  })

  if (createRes.ok) {
    const data = (await createRes.json()) as { customer?: { id: string } }
    return data.customer?.id
  }

  return undefined
}
