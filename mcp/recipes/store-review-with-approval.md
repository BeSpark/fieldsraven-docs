# Store review with approval

Requires FieldsRaven 0.34.0 or later.

Use a **Manage token** and require the reviewer to be logged in. MCP configures the Raven but
cannot originate a storefront submission; capture `submission.receipt` from the theme and poll it
with `verify_submission` in `state` mode.

## Create the Raven

```json
{
  "configuration": {
    "resource_name": "customer",
    "namespace": "fields_raven",
    "key": "store_review",
    "value_type": "json",
    "active": true,
    "use_customer_email_as_id": false,
    "needs_approval": true
  },
  "idempotency_key": "store-review-provision-2026-08-25"
}
```

For `applied` or `existing`, read `raven.identity.slug` and `raven.revision`; for `conflict` or
`partial`, read `current_raven.identity.slug` and `current_raven.revision`. Use the slug with
`get_raven`, the revision as `expected_revision`, and a fresh idempotency key whenever the request
changes.

## Optional approval workflow

`needs_approval` is an optional recommendation with a real operational risk: a submission waits
for human approval instead of writing immediately. It was not live-exercised on a designated test
store for this release. Confirm that the merchant has an approval owner and a safe review process
before enabling it.

After a logged-in customer submits the review, `verify_submission` in state mode should return
`AWAITING_APPROVAL`. That is expected. Polling cannot advance it; a human approval is required.
After approval, poll until `SUCCESS`, then use `deep` only if settled Shopify read-back evidence is
needed.

```json
{
  "raven_slug": "<raven.identity.slug>",
  "expected_revision": 0,
  "patch": { "active": false },
  "idempotency_key": "store-review-deactivate-2026-08-25"
}
```

Deactivate with `update_raven` using the current revision.
