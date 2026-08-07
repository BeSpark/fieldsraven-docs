# FAQ

## How does FieldsRaven differentiate from any other metafields app?

* Unlike other metafields apps, FieldsRaven is built for developers.
* FieldsRaven doesn't have an admin UI to create and manage metafields.
* As a developer you need to write a few lines of HTML, Liquid and JavaScript to take advantage of the app. (Check [quick start guide](quick-start))
* Metafields should be created on a specific events on the storefront, based on customer actions or predetermined logic.
* Have a look at the example [features link](example-features) to get a better idea of what you might be able to build on top of FieldsRaven.

## Why is there a delay between the AJAX call returning and the metafield appearing?

A submission is accepted and acknowledged immediately, then written to Shopify in the background. A few things add to the gap:

1. Each request is queued, so the wait depends on queue depth at that moment.
2. Requests are throttled per shop to stay inside Shopify's API rate limit. Your store's queue is isolated from every other store's, so a busy neighbour can't slow you down.
3. Shopify's own write takes roughly a second.
4. Shopify's storefront cache. An unpublished theme shows a new metafield sooner than a live one.

If Shopify throttles a write, FieldsRaven now retries at the delay Shopify specifies rather than giving up, so a throttled submission completes late instead of failing.

## Can I delete a metafield?

Yes. `DELETE /apps/raven/delete_metafield` takes `raven_id` and `resource_id`, and removes the metafield from Shopify.

Two things to know:

* A delete that Shopify rejects returns **422** with Shopify's own error message. Earlier versions reported success regardless — if you built against that, check your error handling.
* If Shopify throttles the delete, you get **429** with a `Retry-After` header. Wait that long and retry.

## FieldsRaven won't update a metafield to a blank value

Values are validated against the metafield's type before being sent, and an empty value fails that check for most types. Use a type-appropriate empty value instead — `0` for numbers, `{}` for JSON — and handle the display in Liquid. If you genuinely want the metafield gone, use the delete endpoint above.
