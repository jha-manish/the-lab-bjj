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

export function transformItem(obj: Record<string, unknown>) {
  const d = (obj.item_data ?? {}) as Record<string, unknown>
  const rawVars = (d.variations ?? []) as Record<string, unknown>[]

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
      name: d.name as string | undefined,
      description: d.description as string | undefined,
      productType: d.product_type as string | undefined,
      variations,
    },
  }
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
