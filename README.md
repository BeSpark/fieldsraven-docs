# Welcome!

## Welcome to FieldsRaven developer docs

Here you'll find all the documentation you need to get up and running with FieldsRaven and/or Storefront Kit. Here is the [app page](https://apps.shopify.com/fieldsraven) on the Shopify app store.

## Want to jump right in?

Feeling like an eager beaver? Jump in to the quick start docs and get making your first request:

* [**Quick Start**](quick-start) — create a raven, paste the generated code, make your first request.
* [**FAQ**](faq) — the questions that come up most, including deleting metafields and why a write is not instant.

## What FieldsRaven does

FieldsRaven lets your Shopify theme write **metafields from the storefront** — saving a customer's answer, choice or list straight onto their Shopify record, at the moment they give it to you.

Normally that needs a server: Shopify's Admin API can't be called from a theme, so collecting anything custom means standing up middleware to hold an API token and relay the write. FieldsRaven is that layer. You write Liquid, HTML and JavaScript; it handles authentication, queueing, Shopify's rate limits, and retries.

It is built for developers. There is no admin UI for composing forms — you build the storefront experience you want, and FieldsRaven carries the data to Shopify.

## How it fits together

1. **Create a Raven.** A raven is the configuration that says *which* metafield a submission writes to — its owner resource, namespace, key and value type. See [Raven identity](raven-identity.md).
2. **Copy the generated code.** The **Get Code** panel emits the Liquid, HTML and JavaScript for that specific raven, with the request signature computed inline. Paste it into your theme.
3. **The customer submits.** Your storefront posts to the app proxy, signed. FieldsRaven accepts it, queues it, and writes the metafield in the background — so a `200` means *accepted*, not yet *stored*.
4. **Verify if you need to.** A successful write returns a receipt you can look up later — see [Workflows and receipts](mcp/workflows.md).

## What people build with it

The recipes below are complete, working implementations rather than sketches:

* [**Quiz profiles**](example-features/shopify-quiz-profiles.md) — save structured quiz answers to one JSON metafield.
* [**Wishlist**](example-features/wish-list.md) — add and remove products from a customer-owned list.
* [**Saved product configurations**](example-features/saved-product-configurations.md) — let customers save, reopen and update a configured product.
* [**Vehicle garage**](example-features/shopify-vehicle-garage.md) — add, select and remove customer vehicles.
* [**Product registration**](example-features/customer-product-registration.md) — append validated registrations, with serial and purchase details.
* [**Marketing preferences**](example-features/shopify-klaviyo-sync.md) — collect preferences and map them to Klaviyo profile properties.

The shape they share: something the customer tells you on the storefront, kept on their Shopify customer record, available to Liquid, Flow, and every other app that reads Shopify data.

## Where the data can go

A metafield write is the baseline. A raven can also, optionally:

* **Sync to [Klaviyo](klaviyo.md)** — turn a customer's submission into profile properties for segmentation and flows.
* **Sync to [Airtable](airtable.md)** — append each submission as a row.
* **Mirror into [Shopify metaobjects](metaobject-sync.md)** — turn a JSON submission into a typed, referenceable Shopify record.

## Beyond the storefront

* [**MCP overview**](mcp/overview.md) — an MCP endpoint that lets an AI client discover field types, preview and manage ravens, and verify submissions, with read or manage tokens you control.
* [**App embeds**](app-embeds/) — theme blocks you enable without writing code, including the Storefront Kit the other embeds depend on.
* [**Troubleshooting**](troubleshooting.md) — the exact errors the app returns, and what each one means.
