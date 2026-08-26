# Wishlist

Requires FieldsRaven 0.34.0 or later.

Use a **Manage token** to create this customer Raven. The shopper must be logged in: the
storefront submission needs the customer id that the generated snippet signs. MCP configures the
Raven but cannot originate the storefront submission; capture `submission.receipt` from the theme
response and poll it with `verify_submission` in `state` mode.

## Create the Raven

```json
{
  "configuration": {
    "resource_name": "customer",
    "namespace": "fields_raven",
    "key": "wishlist",
    "value_type": "list.product_reference",
    "active": true,
    "needs_approval": false,
    "use_customer_email_as_id": false,
    "has_metafield_definition": true
  },
  "idempotency_key": "wishlist-provision-2026-08-25"
}
```

For `applied` or `existing`, read `raven.identity.slug` and `raven.revision`; for `conflict` or
`partial`, read `current_raven.identity.slug` and `current_raven.revision`. Use the slug with
`get_raven` and the revision as `expected_revision` for every later update. Reuse an idempotency
key only for the identical request; mint a new one when the payload changes.

## Optional metafield-definition creation

`has_metafield_definition` is an optional recommendation, not a default. It can synchronously
create or reconcile the Shopify metafield definition, so it needs the required Shopify scopes and
no incompatible existing definition. This option was not live-exercised on a designated test store
for this release. Treat a failure as a configuration risk: resolve the reported scope or definition
conflict before retrying, rather than repeatedly creating Ravens.

## Hook up, verify, and deactivate

Call `get_raven` with `raven.identity.slug` and the `generic` template, then place the returned
snippet on the product page. Submit while logged in, capture `submission.receipt`, and poll state
until it settles; use `deep` only for settled Shopify read-back evidence.

Values are numeric product ids, never GIDs: submit a JSON array such as `[123456789]`. The generic
snippet is a one-slot wishlist: every submission replaces the list. Theme code that accumulates a
wishlist must read the current list, append the product id, and submit the full desired array.

```json
{
  "raven_slug": "<raven.identity.slug>",
  "expected_revision": 0,
  "patch": { "active": false },
  "idempotency_key": "wishlist-deactivate-2026-08-25"
}
```

Deactivate with `update_raven` only after replacing the placeholder revision with the current one.
