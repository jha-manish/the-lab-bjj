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
export type AvailabilitySlot = ReturnType<typeof transformAvailability>

export interface CatalogDiscount {
  id: string
  name: string
  percentage?: number
  amountCents?: number
  currency?: string
}

export interface CatalogSubscriptionPlanVariation {
  id: string
  name?: string
  phases: {
    uid?: string
    cadence?: string
    ordinal?: number
    pricingType?: string
  }[]
}

export interface MembershipCheckout {
  membershipName: string
  variationId: string
  quantity: number
  quantityString: string
  regularAmountCents: number
  totalAmountCents: number
  currency: string
  discount?: CatalogDiscount
  duration: {
    quantity: number
    unit: DurationUnit
  }
}

type DurationUnit = 'day' | 'week' | 'month' | 'year'

const WEBSITE_DISPLAY_CUSTOM_ATTRIBUTE_DEFINITION_ID = '6HHNPNJ4LVXOSD5SI4FKPGTM'
const WEBSITE_MERCH_CUSTOM_ATTRIBUTE_DEFINITION_ID = 'FDEKYIIVAIBTD23ZKIZOYUBN'
const CATALOG_CACHE_TTL_MS = 5 * 60 * 1000
const AVAILABILITY_CACHE_TTL_MS = 6 * 60 * 60 * 1000
const PREPAID_MEMBERSHIP_DISCOUNT_RE = /^(\d+)\s+(day|week|month|year)s?\s+pre-paid membership$/i
const DAYS_PER_MONTH = 365.2425 / 12

interface CatalogCache {
  expiresAt: number
  items?: CatalogItem[]
  promise?: Promise<CatalogItem[]>
}

interface DiscountCache {
  expiresAt: number
  discounts?: CatalogDiscount[]
  promise?: Promise<CatalogDiscount[]>
}

interface SubscriptionPlanVariationCache {
  expiresAt: number
  variations?: CatalogSubscriptionPlanVariation[]
  promise?: Promise<CatalogSubscriptionPlanVariation[]>
}

interface AvailabilityCacheEntry {
  expiresAt: number
  slots?: AvailabilitySlot[]
  promise?: Promise<AvailabilitySlot[]>
}

const globalCatalogCache = globalThis as typeof globalThis & {
  __theLabCatalogCacheV5?: CatalogCache
  __theLabDiscountCacheV1?: DiscountCache
  __theLabSubscriptionPlanVariationCacheV1?: SubscriptionPlanVariationCache
  __theLabAvailabilityCacheV1?: Record<string, AvailabilityCacheEntry>
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
  const imageIds = Array.isArray(d.image_ids)
    ? d.image_ids.filter((imageId): imageId is string => typeof imageId === 'string')
    : []
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
      imageIds,
      imageUrl: undefined as string | undefined,
      imageUrls: [] as string[],
      websiteCustomAttributes,
      variations,
    },
  }
}

function parseNumericValue(value: unknown) {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string' && value.trim()) {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : undefined
  }

  return undefined
}

export function parsePrepaidMembershipDiscountName(name: string) {
  const match = name.match(PREPAID_MEMBERSHIP_DISCOUNT_RE)
  if (!match) return undefined

  return {
    quantity: parseInt(match[1], 10),
    unit: match[2].toLowerCase() as DurationUnit,
  }
}

function durationMonths(quantity: number, unit: DurationUnit) {
  if (unit === 'day') return quantity / DAYS_PER_MONTH
  if (unit === 'week') return (quantity * 7) / DAYS_PER_MONTH
  if (unit === 'year') return quantity * 12
  return quantity
}

function getMembershipDurationMonths(serviceDuration: string | undefined) {
  if (!serviceDuration) return 1

  const durationMs = parseInt(serviceDuration, 10)
  if (!Number.isFinite(durationMs)) return 1

  const dayMs = 24 * 60 * 60 * 1000
  return durationMs >= dayMs ? durationMs / (DAYS_PER_MONTH * dayMs) : 1
}

function formatOrderQuantity(value: number) {
  return Number.isInteger(value) ? String(value) : value.toFixed(6).replace(/0+$/, '').replace(/\.$/, '')
}

function applyCatalogDiscount(totalCents: number, discount: CatalogDiscount | undefined) {
  if (!discount) return totalCents

  if (discount.percentage && discount.percentage > 0) {
    return Math.max(0, Math.round(totalCents * (1 - discount.percentage / 100)))
  }

  if (discount.amountCents && discount.amountCents > 0) {
    return Math.max(0, totalCents - discount.amountCents)
  }

  return totalCents
}

function transformDiscount(obj: Record<string, unknown>, attributeNamesByToken = new Map<string, string>()): CatalogDiscount | undefined {
  const discountData = obj.discount_data

  if (isRecord(discountData)) {
    const name = discountData.name
    const percentage = parseNumericValue(discountData.percentage)
    const amountMoney = discountData.amount_money
    const amountCents = isRecord(amountMoney) ? parseNumericValue(amountMoney.amount) : undefined
    const currency = isRecord(amountMoney) && typeof amountMoney.currency === 'string' ? amountMoney.currency : undefined

    if (typeof obj.id === 'string' && typeof name === 'string' && name.trim()) {
      return {
        id: obj.id,
        name: name.trim(),
        ...(percentage !== undefined ? { percentage } : {}),
        ...(amountCents !== undefined ? { amountCents } : {}),
        ...(currency ? { currency } : {}),
      }
    }
  }

  const attributes = obj.attribute
  if (!Array.isArray(attributes) || typeof obj.token !== 'string') return undefined

  let name: string | undefined
  let percentage: number | undefined
  let amountCents: number | undefined
  let currency: string | undefined

  for (const attribute of attributes) {
    if (!isRecord(attribute) || typeof attribute.definition_token !== 'string') continue

    const attributeName = attributeNamesByToken.get(attribute.definition_token)
    if (attributeName === 'name' && typeof attribute.string_value === 'string') {
      name = attribute.string_value.trim()
    }

    if (attributeName === 'percent') {
      const rawPercent = parseNumericValue(attribute.int_value ?? attribute.number_value ?? attribute.string_value)
      if (rawPercent !== undefined) percentage = rawPercent / 100_000
    }

    if (attributeName === 'price') {
      amountCents = parseNumericValue(attribute.int_value ?? attribute.number_value ?? attribute.string_value)
    }

    if (attributeName === 'currency' && typeof attribute.string_value === 'string') {
      currency = attribute.string_value
    }
  }

  if (!name) return undefined

  return {
    id: obj.token,
    name,
    ...(percentage !== undefined ? { percentage } : {}),
    ...(amountCents !== undefined ? { amountCents } : {}),
    ...(currency ? { currency } : {}),
  }
}

function transformSubscriptionPlanVariation(obj: Record<string, unknown>): CatalogSubscriptionPlanVariation | undefined {
  const variationData = obj.subscription_plan_variation_data
  if (obj.type !== 'SUBSCRIPTION_PLAN_VARIATION' || typeof obj.id !== 'string' || !isRecord(variationData)) return undefined

  const phases = Array.isArray(variationData.phases) ? variationData.phases : []

  return {
    id: obj.id,
    name: typeof variationData.name === 'string' ? variationData.name : undefined,
    phases: phases
      .filter(isRecord)
      .map((phase) => {
        const pricing = phase.pricing
        return {
          uid: typeof phase.uid === 'string' ? phase.uid : undefined,
          cadence: typeof phase.cadence === 'string' ? phase.cadence : undefined,
          ordinal: parseNumericValue(phase.ordinal),
          pricingType: isRecord(pricing) && typeof pricing.type === 'string' ? pricing.type : undefined,
        }
      }),
  }
}

function getSubscriptionPlanVariations(obj: Record<string, unknown>) {
  const directVariation = transformSubscriptionPlanVariation(obj)
  if (directVariation) return [directVariation]

  const planData = obj.subscription_plan_data
  if (obj.type !== 'SUBSCRIPTION_PLAN' || !isRecord(planData) || !Array.isArray(planData.subscription_plan_variations)) return []

  return planData.subscription_plan_variations
    .filter(isRecord)
    .map(transformSubscriptionPlanVariation)
    .filter((variation): variation is CatalogSubscriptionPlanVariation => Boolean(variation))
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
  const cached = globalCatalogCache.__theLabCatalogCacheV5

  if (cached?.items && cached.expiresAt > now) {
    return cached.items
  }

  if (cached?.promise && cached.expiresAt > now) {
    return cached.promise
  }

  const promise = fetchFreshCatalogItems()
  globalCatalogCache.__theLabCatalogCacheV5 = {
    expiresAt: now + CATALOG_CACHE_TTL_MS,
    promise,
  }

  try {
    const items = await promise
    globalCatalogCache.__theLabCatalogCacheV5 = {
      expiresAt: Date.now() + CATALOG_CACHE_TTL_MS,
      items,
    }
    return items
  } catch (err) {
    globalCatalogCache.__theLabCatalogCacheV5 = undefined
    throw err
  }
}

export function clearCatalogItemsCache() {
  globalCatalogCache.__theLabCatalogCacheV5 = undefined
}

export async function fetchCatalogDiscounts() {
  const now = Date.now()
  const cached = globalCatalogCache.__theLabDiscountCacheV1

  if (cached?.discounts && cached.expiresAt > now) {
    return cached.discounts
  }

  if (cached?.promise && cached.expiresAt > now) {
    return cached.promise
  }

  const promise = fetchFreshCatalogDiscounts()
  globalCatalogCache.__theLabDiscountCacheV1 = {
    expiresAt: now + CATALOG_CACHE_TTL_MS,
    promise,
  }

  try {
    const discounts = await promise
    globalCatalogCache.__theLabDiscountCacheV1 = {
      expiresAt: Date.now() + CATALOG_CACHE_TTL_MS,
      discounts,
    }
    return discounts
  } catch (err) {
    globalCatalogCache.__theLabDiscountCacheV1 = undefined
    throw err
  }
}

export function clearCatalogDiscountsCache() {
  globalCatalogCache.__theLabDiscountCacheV1 = undefined
}

export async function validateMembershipCheckout(itemVariationId: string, discountId?: string): Promise<MembershipCheckout> {
  const [items, discounts] = await Promise.all([fetchCatalogItems(), fetchCatalogDiscounts()])
  const membership = items
    .filter(isWebsiteMembershipItem)
    .find((item) => item.itemData.variations.some((variation) => variation.id === itemVariationId))
  const variation = membership?.itemData.variations.find((itemVariation) => itemVariation.id === itemVariationId)

  if (!membership || !variation) throw new Error('Membership variation not found')

  const priceMoney = variation.itemVariationData?.priceMoney
  const amountCents = priceMoney ? parseNumericValue(priceMoney.amount) : undefined
  if (!amountCents || amountCents <= 0) throw new Error('Membership price not found')

  const discount = discountId ? discounts.find((catalogDiscount) => catalogDiscount.id === discountId) : undefined
  if (discountId && !discount) throw new Error('Prepaid membership discount not found')

  const duration = discount ? parsePrepaidMembershipDiscountName(discount.name) : { quantity: 1, unit: 'month' as const }
  if (!duration) throw new Error('Unsupported prepaid membership discount')

  const variationDurationMonths = getMembershipDurationMonths(variation.itemVariationData?.serviceDuration)
  const quantity = durationMonths(duration.quantity, duration.unit) / variationDurationMonths
  if (!Number.isFinite(quantity) || quantity <= 0) throw new Error('Unsupported membership duration')

  const regularAmountCents = Math.round(amountCents * quantity)

  return {
    membershipName: membership.itemData.websiteCustomAttributes.name ?? membership.itemData.name ?? 'Membership',
    variationId: itemVariationId,
    quantity,
    quantityString: formatOrderQuantity(quantity),
    regularAmountCents,
    totalAmountCents: applyCatalogDiscount(regularAmountCents, discount),
    currency: priceMoney?.currency ?? 'CAD',
    ...(discount ? { discount } : {}),
    duration,
  }
}

export async function fetchCatalogSubscriptionPlanVariations() {
  const now = Date.now()
  const cached = globalCatalogCache.__theLabSubscriptionPlanVariationCacheV1

  if (cached?.variations && cached.expiresAt > now) {
    return cached.variations
  }

  if (cached?.promise && cached.expiresAt > now) {
    return cached.promise
  }

  const promise = fetchFreshCatalogSubscriptionPlanVariations()
  globalCatalogCache.__theLabSubscriptionPlanVariationCacheV1 = {
    expiresAt: now + CATALOG_CACHE_TTL_MS,
    promise,
  }

  try {
    const variations = await promise
    globalCatalogCache.__theLabSubscriptionPlanVariationCacheV1 = {
      expiresAt: Date.now() + CATALOG_CACHE_TTL_MS,
      variations,
    }
    return variations
  } catch (err) {
    globalCatalogCache.__theLabSubscriptionPlanVariationCacheV1 = undefined
    throw err
  }
}

function availabilityCacheKey(serviceVariationId: string, startDate: string) {
  return `${serviceVariationId}:${startDate}`
}

export function getUtcRangeForEasternDate(startDate: string) {
  const sample = new Date(`${startDate}T12:00:00Z`)
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Toronto',
    timeZoneName: 'shortOffset',
    hour: 'numeric',
  }).formatToParts(sample)
  const str = parts.find(p => p.type === 'timeZoneName')?.value ?? 'GMT-4'
  const etOffset = parseInt(str.replace('GMT', '') || '-4', 10)
  const absOffset = Math.abs(etOffset)
  const startAt = new Date(`${startDate}T${String(absOffset).padStart(2, '0')}:00:00.000Z`)
  const endAt = new Date(startAt.valueOf() + 24 * 3600_000 - 1)

  return { startAt, endAt }
}

export async function fetchAvailability(serviceVariationId: string, startDate: string) {
  const now = Date.now()
  const key = availabilityCacheKey(serviceVariationId, startDate)
  const cache = globalCatalogCache.__theLabAvailabilityCacheV1 ??= {}
  const cached = cache[key]

  if (cached?.slots && cached.expiresAt > now) {
    return cached.slots
  }

  if (cached?.promise && cached.expiresAt > now) {
    return cached.promise
  }

  const promise = fetchFreshAvailability(serviceVariationId, startDate)
  cache[key] = {
    expiresAt: now + AVAILABILITY_CACHE_TTL_MS,
    promise,
  }

  try {
    const slots = await promise
    cache[key] = {
      expiresAt: Date.now() + AVAILABILITY_CACHE_TTL_MS,
      slots,
    }
    return slots
  } catch (err) {
    delete cache[key]
    throw err
  }
}

export function clearAvailabilityCache() {
  globalCatalogCache.__theLabAvailabilityCacheV1 = undefined
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

function getAttributeNamesByToken(definitions: unknown) {
  const namesByToken = new Map<string, string>()
  if (!Array.isArray(definitions)) return namesByToken

  for (const definition of definitions) {
    if (!isRecord(definition) || typeof definition.token !== 'string' || typeof definition.name !== 'string') continue
    namesByToken.set(definition.token, definition.name)
  }

  return namesByToken
}

async function fetchFreshCatalogDiscounts() {
  const discounts: CatalogDiscount[] = []
  let cursor: string | undefined

  do {
    const res = await squareFetch('/catalog/search', {
      method: 'POST',
      body: JSON.stringify({
        object_types: ['DISCOUNT'],
        include_deleted_objects: false,
        limit: 100,
        ...(cursor ? { cursor } : {}),
      }),
    })

    if (!res.ok) throw new Error(`Square catalog discounts ${res.status}: ${await res.text()}`)

    const data = (await res.json()) as {
      objects?: Record<string, unknown>[]
      catalog_object?: Record<string, unknown>[]
      attribute_definition?: unknown
      cursor?: string
      pagination_token?: string
    }
    const attributeNamesByToken = getAttributeNamesByToken(data.attribute_definition)
    const objects = data.objects ?? data.catalog_object ?? []

    for (const obj of objects) {
      if (obj.type !== 'DISCOUNT') continue

      const discount = transformDiscount(obj, attributeNamesByToken)
      if (discount) discounts.push(discount)
    }

    cursor = data.cursor || data.pagination_token || undefined
  } while (cursor)

  return discounts
}

async function fetchFreshCatalogSubscriptionPlanVariations() {
  const variationsById = new Map<string, CatalogSubscriptionPlanVariation>()
  let cursor: string | undefined

  do {
    const res = await squareFetch('/catalog/search', {
      method: 'POST',
      body: JSON.stringify({
        object_types: ['SUBSCRIPTION_PLAN', 'SUBSCRIPTION_PLAN_VARIATION'],
        include_deleted_objects: false,
        limit: 100,
        ...(cursor ? { cursor } : {}),
      }),
    })

    if (!res.ok) throw new Error(`Square subscription plans ${res.status}: ${await res.text()}`)

    const data = (await res.json()) as {
      objects?: Record<string, unknown>[]
      catalog_object?: Record<string, unknown>[]
      cursor?: string
      pagination_token?: string
    }
    const objects = data.objects ?? data.catalog_object ?? []

    for (const obj of objects) {
      for (const variation of getSubscriptionPlanVariations(obj)) {
        variationsById.set(variation.id, variation)
      }
    }

    cursor = data.cursor || data.pagination_token || undefined
  } while (cursor)

  return Array.from(variationsById.values())
}

async function fetchCatalogImageUrls(imageIds: string[]) {
  const uniqueImageIds = Array.from(new Set(imageIds))
  if (uniqueImageIds.length === 0) return new Map<string, string>()

  const res = await squareFetch('/catalog/batch-retrieve', {
    method: 'POST',
    body: JSON.stringify({
      object_ids: uniqueImageIds,
      include_related_objects: false,
    }),
  })

  if (!res.ok) throw new Error(`Square catalog images ${res.status}: ${await res.text()}`)

  const data = (await res.json()) as { objects?: Record<string, unknown>[] }
  const urlsById = new Map<string, string>()

  for (const obj of data.objects ?? []) {
    const imageData = obj.image_data
    if (obj.type !== 'IMAGE' || typeof obj.id !== 'string' || !isRecord(imageData)) continue

    const url = imageData.url
    if (typeof url === 'string' && url.trim()) {
      urlsById.set(obj.id, url)
    }
  }

  return urlsById
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

  const items = Array.from(
    [...displayItems, ...appointmentServices]
      .reduce((itemsById, item) => itemsById.set(item.id, item), new Map<string, CatalogItem>())
      .values()
  )
  let imageUrlsById = new Map<string, string>()

  try {
    imageUrlsById = await fetchCatalogImageUrls(items.flatMap((item) => item.itemData.imageIds))
  } catch (err) {
    console.error('Square catalog image fetch error:', err)
  }

  return items.map((item) => {
    const imageUrls = item.itemData.imageIds
      .map((imageId) => imageUrlsById.get(imageId))
      .filter((url): url is string => Boolean(url))

    return {
      ...item,
      itemData: {
        ...item.itemData,
        imageUrl: imageUrls[0],
        imageUrls,
      },
    }
  })
}

async function fetchFreshAvailability(serviceVariationId: string, startDate: string) {
  const { startAt, endAt } = getUtcRangeForEasternDate(startDate)
  const res = await squareFetch('/bookings/availability/search', {
    method: 'POST',
    body: JSON.stringify({
      query: {
        filter: {
          start_at_range: {
            start_at: startAt.toISOString(),
            end_at: endAt.toISOString(),
          },
          location_id: LOCATION_ID,
          segment_filters: [{ service_variation_id: serviceVariationId }],
        },
      },
    }),
  })

  if (!res.ok) throw new Error(`Square availability ${res.status}: ${await res.text()}`)

  const data = (await res.json()) as { availabilities?: Record<string, unknown>[] }
  return (data.availabilities ?? []).map(transformAvailability)
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
