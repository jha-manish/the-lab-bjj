# The Lab BJJ

Next.js site for The Jiu-Jitsu Lab Waterloo.

## Getting Started

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.


## Square Catalog Data

Catalog data is fetched through `lib/square.ts` using Square's `SearchCatalogItems` endpoint. The site fetches:

- Item-library entries where `website_display` is enabled.
- Appointment services by `product_types: ['APPOINTMENTS_SERVICE']`, because booking services do not need website custom attributes.

The fetched catalog is shared by memberships, shop, free-trial booking, and `/api/square/catalog`.

### Custom Attributes

These Square custom attributes control which item-library entries appear on the website:

- `website_display` controls whether an item-library entry is shown on the site.
- `website_merch` controls whether a displayed item-library entry appears under `Shop > Merch`.

Memberships are displayed when `website_display` is enabled and `website_merch` is not enabled. Merch is displayed only when both `website_display` and `website_merch` are enabled.

### Membership Items

Memberships appear on `/memberships` and under `Shop > Memberships`.

The item's first variation is used for the displayed price and selected purchasable option.

### Merch Items

Merch appears under `Shop > Merch`.

## Catalog Cache

`fetchCatalogItems()` uses a backend in-memory cache stored on `globalThis`.

- Cache TTL: 5 minutes.
- In-flight Square requests are shared so concurrent requests do not stampede Square.
- The cache is per server runtime/instance. It is not browser storage and is not shared between separate users' browsers.
- Server-rendered pages still receive catalog data before HTML is sent, so the cache does not prevent search engines from seeing rendered content. The tradeoff is freshness: catalog changes may take up to 5 minutes to appear.

In development, clear the cache with:

```bash
curl -X POST http://localhost:3000/api/dev/clear-square-cache
```

The cache-clear endpoint returns `404` in production.

## Availability Cache

`fetchAvailability()` uses the same backend in-memory pattern for Square booking availability.

- Cache TTL: 6 hours.
- In-flight Square requests are shared so preloading and week navigation do not stampede Square.
- `/book` preloads a rolling 3-week window of availability for all free trial classes after the page loads.
- The cache is per server runtime/instance, so a cold runtime still needs to ask Square once for each class/date pair.
