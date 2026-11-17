// Conversion events, sent to both GA4 (gtag) and the Meta Pixel (fbq).
//
// Every helper is called right after a booking or payment has already
// succeeded, so a tracking failure must never surface as a checkout error:
// send() swallows anything the vendor scripts throw, and both globals are
// optional because ad blockers routinely remove them.

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void
    fbq?: (...args: unknown[]) => void
    _fbq?: (...args: unknown[]) => void
  }
}

function send(fn: () => void) {
  try {
    fn()
  } catch (err) {
    console.error('Analytics event failed', err)
  }
}

function dollars(cents: number) {
  return Math.round(cents) / 100
}

/** A free trial class was booked. */
export function trackTrialBooked({ bookingId, className }: { bookingId: string; className: string }) {
  send(() =>
    window.fbq?.(
      'track',
      'Lead',
      { content_name: className, content_category: 'Free Trial', currency: 'CAD', value: 0 },
      { eventID: bookingId },
    ),
  )
  send(() => window.gtag?.('event', 'generate_lead', { lead_source: 'free_trial', class_name: className }))
}

/** An unpaid appointment (anything bookable without a card) was booked. */
export function trackAppointmentBooked({ bookingId, itemName }: { bookingId: string; itemName: string }) {
  send(() => window.fbq?.('track', 'Schedule', { content_name: itemName }, { eventID: bookingId }))
  send(() => window.gtag?.('event', 'generate_lead', { lead_source: 'appointment', class_name: itemName }))
}

/** A recurring membership was started. `monthlyCents` is the pre-tax recurring price. */
export function trackSubscriptionStarted({
  subscriptionId,
  planName,
  monthlyCents,
  currency,
}: {
  subscriptionId: string
  planName: string
  monthlyCents: number
  currency: string
}) {
  const value = dollars(monthlyCents)
  send(() =>
    window.fbq?.(
      'track',
      'Subscribe',
      { content_name: planName, content_category: 'Membership', currency, value },
      { eventID: subscriptionId },
    ),
  )
  send(() =>
    window.gtag?.('event', 'purchase', {
      transaction_id: subscriptionId,
      currency,
      value,
      items: [{ item_id: planName, item_name: planName, item_category: 'Membership subscription', price: value, quantity: 1 }],
    }),
  )
}

/** A one-time card payment (pre-paid membership, private lesson, merch) went through. */
export function trackPurchase({
  transactionId,
  itemName,
  category,
  amountCents,
  currency,
}: {
  transactionId: string
  itemName: string
  category: string
  amountCents: number
  currency: string
}) {
  const value = dollars(amountCents)
  send(() =>
    window.fbq?.(
      'track',
      'Purchase',
      { content_name: itemName, content_category: category, currency, value },
      { eventID: transactionId },
    ),
  )
  send(() =>
    window.gtag?.('event', 'purchase', {
      transaction_id: transactionId,
      currency,
      value,
      items: [{ item_id: itemName, item_name: itemName, item_category: category, price: value, quantity: 1 }],
    }),
  )
}

/** A contact form was submitted. `source` says which form. */
export function trackContactSubmitted(source: 'contact_page' | 'floating_widget') {
  send(() => window.fbq?.('track', 'Contact', { content_name: source }))
  send(() => window.gtag?.('event', 'generate_lead', { lead_source: source }))
}
