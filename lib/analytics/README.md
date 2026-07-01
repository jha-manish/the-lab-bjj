# Analytics & Conversion Tracking

Marketing analytics for The Jiu-Jitsu Lab. The business goal is **free-trial
signups** (primary conversion); online purchases are a **secondary** conversion.
Most memberships are ultimately sold in person via Square after a trial.

All tracking flows through a single typed layer (`lib/analytics`). UI code never
calls `gtag`, `fbq`, or `dataLayer` directly.

---

## Architecture

```
UI / components
      │  (typed helpers only)
      ▼
lib/analytics/index.ts        ← public API: trackTrialSubmitted(), trackPurchase(), …
      │
      ▼
lib/analytics/core.ts         ← dispatcher: dedupe + fan-out + attribution
      │
      ├── providers/gtm.ts          → window.dataLayer  (GTM-managed tags)
      ├── providers/ga4.ts          → gtag.js           (Google Analytics 4)
      ├── providers/meta.ts         → fbq               (Meta Pixel)
      └── providers/google-ads.ts   → gtag.js           (Google Ads conversions)
```

- **`config.ts`** – reads `NEXT_PUBLIC_*` env vars; a platform is enabled when
  its ID is present.
- **`attribution.ts`** – captures UTMs / click IDs / device / referrer once per
  session and attaches them to every event.
- **`events.ts`** – canonical event names (GA4-recommended where one exists) and
  the list of GA4 conversions.
- **`providers/*`** – one adapter per platform, all implementing
  `AnalyticsProvider`. **Adding a platform = add one provider file + register it
  in `core.ts`. No call sites change.**
- **Components** (`components/analytics/*`):
  - `AnalyticsScripts.tsx` – loads vendor libraries (GTM, gtag.js, fbevents.js)
    and `<noscript>` fallbacks. The only place vendor `<script>` tags live.
  - `Analytics.tsx` – runtime: provider init, SPA page views, scroll depth, time
    on page, engaged sessions, delegated CTA/nav/external/download click
    tracking, and global error capture.
  - `PricingView.tsx` – fires the pricing-list view on `/memberships`.

### Avoiding duplicate events

- Each provider is enabled independently. To prevent a platform from being
  counted twice (once directly, once via a GTM tag), set the matching
  `*_VIA_GTM=true` flag to disable the direct provider.
- Conversion events carry a `dedupeKey` (booking/transaction ID), so a
  re-render or retry can never double count.
- `page_view`, `trial_page_view`, `pricing_view`, `session_engaged`, and each
  scroll milestone are deduped per page load.

---

## Environment variables

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_GTM_ID` | GTM container, e.g. `GTM-XXXXXXX` |
| `NEXT_PUBLIC_GA4_MEASUREMENT_ID` | GA4 ID, e.g. `G-XXXXXXXXXX` (defaults to `G-PHS0NYH28S`) |
| `NEXT_PUBLIC_GA4_VIA_GTM` | `true` if GA4 is managed inside GTM |
| `NEXT_PUBLIC_META_PIXEL_ID` | Meta Pixel ID |
| `NEXT_PUBLIC_META_VIA_GTM` | `true` if the pixel is managed inside GTM |
| `NEXT_PUBLIC_GOOGLE_ADS_ID` | Google Ads ID, e.g. `AW-XXXXXXXXX` |
| `NEXT_PUBLIC_GOOGLE_ADS_TRIAL_LABEL` | Conversion label for the trial signup (PRIMARY) |
| `NEXT_PUBLIC_GOOGLE_ADS_PURCHASE_LABEL` | Conversion label for purchase (SECONDARY) |
| `NEXT_PUBLIC_GOOGLE_ADS_VIA_GTM` | `true` if Ads conversions are managed inside GTM |
| `NEXT_PUBLIC_ANALYTICS_DEBUG` | `true` to log every event to the console |

All values are public (client-side) and are **not** secrets.

---

## Public API (`lib/analytics`)

| Helper | Fires |
| --- | --- |
| `trackPageView()` | `page_view` (auto on load + route change) |
| `trackCTA()` | `cta_click` (auto via `data-cta`) |
| `trackNavClick()` | `navigation_click` (auto inside `<nav>`) |
| `trackExternalLink()` | `click` outbound (auto) |
| `trackDownload()` | `file_download` (auto) |
| `trackScrollDepth()` | `scroll` (auto, 25/50/75/100) |
| `trackTimeOnPage()` | `time_on_page` (auto on leave/hide) |
| `trackEngagedSession()` | `session_engaged` (auto) |
| `trackTrialPageView()` | `trial_page_view` |
| `trackTrialCtaClick()` | `trial_cta_click` |
| `trackTrialStarted()` | `trial_form_start` |
| `trackTrialSubmitted()` | `generate_lead` ← **PRIMARY conversion** |
| `trackTrialFailed()` | `trial_submit_failed` |
| `trackPricingView()` | `view_item_list` |
| `trackCheckoutStarted()` | `begin_checkout` |
| `trackPurchase()` | `purchase` ← **SECONDARY conversion** |
| `trackPurchaseFailed()` | `purchase_failed` |
| `trackLogin()` | `login` |
| `track404()` | `page_not_found` |
| `trackError()` | `exception` |

---

## Event catalogue

> `attribution` (UTMs, qr_id, gclid/fbclid, referrer, landing_page, device_type,
> browser, os, country, visitor_type) is attached to **every** event.

### Page & engagement

| Event | Key params | Where |
| --- | --- | --- |
| `page_view` | `page_path`, `page_location`, `page_title` | every load + SPA route change |
| `scroll` | `percent_scrolled` (25/50/75/100), `page_path` | scroll listener |
| `time_on_page` | `page_path`, `time_seconds` | route change / tab hide |
| `session_engaged` | `page_path` | dwell ≥10s or first interaction |
| `navigation_click` | `nav_label`, `link_url`, `nav_location` | clicks inside `<nav>` |
| `cta_click` | `cta_id`, `cta_location`, `cta_text`, `link_url` | any `[data-cta]` element |
| `click` | `link_url`, `link_text`, `outbound` | outbound / mailto / tel / sms |
| `file_download` | `link_url`, `file_name`, `file_extension` | download links |

### Free-trial funnel (PRIMARY)

| Stage | Event | Key params | Fired in |
| --- | --- | --- | --- |
| 1. Trial page viewed | `trial_page_view` | – | `ClassBookingWidget` mount |
| 2. Trial CTA clicked | `trial_cta_click` | `cta_location` | any `data-cta="book_free_trial"` |
| 3. Form started | `trial_form_start` | `class_name`, `class_level` | slot selected → details step |
| 4. ✅ Signup complete | `generate_lead` | `booking_id`, `transaction_id`, `class_name`, `class_level`, `start_at`, `value:0`, `currency:CAD` | booking success |
| 4. ❌ Signup failed | `trial_submit_failed` | `error_message`, `class_name` | booking error |

### Purchase funnel (SECONDARY)

| Stage | Event | Key params | Fired in |
| --- | --- | --- | --- |
| Pricing viewed | `view_item_list` | `item_list_name`, `items[]` | `/memberships` listing |
| Checkout started | `begin_checkout` | `value`, `currency`, `membership_plan`, `items[]` | payment step reached |
| ✅ Purchase complete | `purchase` | `transaction_id`, `value`, `currency`, `membership_plan`, `items[]` | Square payment success |
| ❌ Purchase failed | `purchase_failed` | `error_message`, `value`, `membership_plan` | payment error |

> `value` is in major units (dollars); Square amounts (cents) are divided by 100.
> `purchase` fires **only after Square confirms** the payment.

### Auth & errors

| Event | Key params | Fired in |
| --- | --- | --- |
| `login` | `method` | call `trackLogin()` when auth is added |
| `page_not_found` | `page_path` | `app/not-found.tsx` |
| `exception` | `description`, `fatal`, `context` | `window.onerror`, unhandled rejections, error boundary, failed contact form |

---

## Per-platform mapping

### GA4 events
`page_view`, `scroll`, `time_on_page`, `session_engaged`, `navigation_click`,
`cta_click`, `click`, `file_download`, `trial_page_view`, `trial_cta_click`,
`trial_form_start`, **`generate_lead`**, `trial_submit_failed`, `view_item_list`,
`begin_checkout`, **`purchase`**, `purchase_failed`, `login`, `page_not_found`,
`exception`.

**Mark as conversions in the GA4 UI:** `generate_lead` (primary) and `purchase`
(secondary).

### GTM events & triggers
Every event above is pushed to `window.dataLayer` as
`{ event: <name>, event_type, ...params, attribution }`. Build **Custom Event
triggers** on the `event` name (e.g. *event equals `generate_lead`*) and **Data
Layer Variables** for params (e.g. `attribution.utm_campaign`, `value`,
`transaction_id`). This lets new tags be added entirely in GTM with no code
change.

### Meta Pixel events
| App event | Meta event |
| --- | --- |
| `page_view` | `PageView` |
| `generate_lead` | `Lead` |
| `purchase` | `Purchase` (with `value`, `currency`) |
| `begin_checkout` | `InitiateCheckout` |
| `view_item_list` / `trial_page_view` | `ViewContent` |
| trial funnel / errors / CTA | custom events (verbatim name) |

High-frequency engagement events (scroll, time, nav, outbound) are intentionally
not sent to the pixel.

### Google Ads conversions
| App event | Conversion |
| --- | --- |
| `generate_lead` | **Primary** (`NEXT_PUBLIC_GOOGLE_ADS_TRIAL_LABEL`) |
| `purchase` | **Secondary** (`NEXT_PUBLIC_GOOGLE_ADS_PURCHASE_LABEL`) |

---

## Reporting recipes

- **Trial signups by UTM campaign** → GA4 explore: event `generate_lead`,
  breakdown by `utm_campaign` (or `session_campaign`).
- **Trial signups by QR code** → breakdown `generate_lead` by `qr_id`. Encode
  QR links as `?utm_source=qr&utm_medium=qr&utm_campaign=<location>` or `?qr=<id>`.
- **Best-converting landing pages** → `generate_lead` by `landing_page`.
- **Highest-converting ad campaigns** → conversion rate = `generate_lead` ÷
  `session_start`, by `utm_campaign`.
- **Most-visited pages / time on page** → `page_view` and `time_on_page` by
  `page_path`.
- **Top CTAs** → `cta_click` by `cta_id` / `cta_location`.
- **Where visitors drop off** → funnel of `trial_page_view` →
  `trial_form_start` → `generate_lead`.

---

## FUTURE: offline conversion tracking (in-person Square sales)

Most memberships are sold **in person** after a free trial, so the most valuable
conversions never touch the browser. To close the loop:

1. **Capture the click ID at trial signup.** `attribution.gclid` (Google) and
   `attribution.fbclid` (Meta) are already collected. Persist them with the lead
   when the booking is created — e.g. store `gclid` on the Square customer in
   `app/api/square/booking/route.ts` via `findOrCreateCustomer`.
2. **When the in-person sale closes in Square,** upload an offline conversion:
   - **Google Ads:** Offline Conversion Import / Enhanced Conversions for Leads,
     keyed by the stored `gclid` (or hashed email). Runs server-side.
   - **Meta:** Conversions API (CAPI) `Purchase` event with the stored `fbclid`
     / hashed email, plus an `eventID` matching the browser event for dedupe.
3. **Where to add it:** a server route or a Square webhook handler (e.g.
   `payment.created`) — *not* this client layer. See the notes in
   `lib/analytics/providers/google-ads.ts` and `providers/meta.ts`.

This connects in-person revenue back to the originating online campaign/QR code.

---

## Assumptions

- The existing GA4 property `G-PHS0NYH28S` should keep working, so it is the
  default measurement ID when no env var is set.
- GTM, Meta Pixel, and Google Ads IDs are not yet provisioned; their providers
  stay dormant until the env vars are set — no code change needed to switch on.
- Login/account features don't exist yet, so `trackLogin()` is provided but not
  yet wired to a call site.
- `country` is a best-effort guess from the browser locale; the authoritative
  country comes from GA4/Ads (IP-based) or Cloudflare `request.cf.country`.
- The free-trial booking has no monetary value, so `generate_lead` is sent with
  `value: 0` purely so platforms accept it as a valid lead.
