export const META_PIXEL_ID = '1984511812190085'

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void
    _fbq?: (...args: unknown[]) => void
  }
}

export function trackMetaLead({
  bookingId,
  className,
}: {
  bookingId: string
  className: string
}) {
  window.fbq?.(
    'track',
    'Lead',
    {
      content_name: className,
      content_category: 'Free Trial',
      currency: 'CAD',
      value: 0,
    },
    { eventID: bookingId },
  )
}
