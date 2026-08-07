# Troubleshooting

## Rejections — `422`

A rejected submission returns **422** with the reason in `message`. The messages below come straight from the app, so you can match on them.

### Raven not found

`Raven ID is missing or raven can't be found`

The `raven_id` you sent doesn't resolve to a raven **on this shop**. Usual causes: a typo, a raven that was deleted, or an id copied from a different store — a raven id is scoped to one shop, so a dev-store id will not work in production.

### Raven is switched off

`Raven is inactive, activate it to be able to send messages`

The raven resolves fine — it's just not active. Switch it on in the app; nothing in your storefront code needs to change.

### Signature rejected

`Invalid auth_code` — or a response body containing `valid_auth_code: false`

The signature didn't match. `raven_mac` is an HMAC over `raven_id + resource_id`, keyed by your shop's `fields_raven.api_secret` metafield. It fails when:

* **The secret is missing from the shop.** It's written at install, but occasionally that write fails. Check Settings — the secret is shown behind the eye icon. If it's absent, [reach out](mailto:karim@fieldsraven.app).
* **The digest was built from different values than the ones sent.** The signed `resource_id` must be byte-identical to the `resource_id` in the payload. Signing `customer.id` and sending a product id fails, and so does signing on one page and posting from another.
* **The MAC was generated for a different raven.** Each raven signs with its own id.

The response also reports `valid_params`, which separates "your parameters were malformed" from "your signature was wrong" — check which one is `false` before hunting the signature.

### Customer could not be identified

`Missing customer ID` · `Invalid customer email`

For customer-owned ravens. Either the storefront had no logged-in customer when it signed, or the email-as-identifier variant received something that isn't a valid address. Requests should be sent by a logged-in customer.

## Rate limiting — `429`

There are **two different 429s**, and they mean different things.

### Shopify throttled the write

A `429` **with** a `Retry-After` header.

The header carries Shopify's own suggested delay, in seconds. Wait that long, then retry — the submission was not recorded as failed, and for ordinary writes FieldsRaven retries in the background on your behalf.

### Your queue is too deep

A `429` **without** a `Retry-After` header.

Backpressure from FieldsRaven itself, not a Shopify limit. It clears as the queue drains. If it happens constantly rather than in bursts, you're submitting faster than Shopify will accept writes for your store; batch your submissions instead.

Generated code already handles the common case. If you hand-rolled your integration, treat a 429 as "retry shortly", never as a failed submission.

## Deletes

`DELETE /apps/raven/delete_metafield` has two responses worth handling explicitly:

* **422** — Shopify refused the delete, and the message is Shopify's own. **Older versions of FieldsRaven reported success regardless**, so if your integration predates that fix, it may be treating failed deletes as successful. Worth re-checking.
* **429** with `Retry-After` — as above.

## The metafield saves, but the value is wrong or empty

* **Blank values are rejected for most types.** Values are validated against the metafield's type before being sent. Use a type-appropriate empty value — `0` for numbers, `{}` for JSON — and handle the display in Liquid. To remove a metafield entirely, use the delete endpoint.
* **A definition you created in Shopify admin may have validations of its own.** If the metafield was defined there with rules — a maximum length, an allowed-values list, a numeric range — Shopify enforces them on write, and the failure surfaces as an error from Shopify rather than from FieldsRaven. Make sure the value you send satisfies the definition, and that its type matches.

## The metafield doesn't appear immediately

Expected. A submission is accepted and acknowledged straight away, then written to Shopify in the background — so a `200` means *queued*, not *stored*. Add Shopify's own write time and its storefront cache on top. An unpublished theme reflects a new metafield sooner than a live one.

## Two forms on one page and only the first works

The second form never bound. Form ids and the JavaScript global are derived from the raven's **resource, namespace and key together**; if you hand-wrote identifiers from the key alone, two ravens sharing a key produce duplicate ids, and `getElementById` returns only the first.

Regenerate both snippets from the **Get Code** panel, which derives collision-safe identifiers for you. See [Quick Start](quick-start.md).

## Metaobject sync issues

A metaobject failure never blocks the metafield write, so the submission's own status stays *success* and these are tracked separately — look at **Failed Operations** and the dashboard status badges rather than the submission list. See [Metaobject sync](metaobject-sync.md).
