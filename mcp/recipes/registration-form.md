# Registration form

Requires FieldsRaven 0.34.0 or later.

Use a **Manage token** to create this Raven. It is a logged-in customer registration flow: MCP
cannot originate a storefront submission, so the theme must return `submission.receipt` for
`verify_submission` polling in `state` mode.

## Create the Raven

```json
{
  "configuration": {
    "resource_name": "customer",
    "namespace": "fields_raven",
    "key": "registrations",
    "value_type": "json",
    "active": true,
    "needs_approval": false,
    "use_customer_email_as_id": false
  },
  "idempotency_key": "registrations-provision-2026-08-25"
}
```

For `applied` or `existing`, read `raven.identity.slug` and `raven.revision`; for `conflict` or
`partial`, read `current_raven.identity.slug` and `current_raven.revision`. The revision is the
`expected_revision` for updates, and an idempotency key can be reused only for an identical retry.
Call `get_raven` with the slug and either `profile_basic` or `generic`; rename the sample fields to
the actual registration fields before shipping the snippet.

## Anonymous registration is an out-of-band prerequisite

Do not put it in this payload: email-keyed identity needs a shop-level flag the MCP cannot set.
Until the app owner enables that flag out of band, keep this logged-in registration flow. A shopper
who is not logged in cannot submit this customer Raven successfully.

After a logged-in submission, capture `submission.receipt` and poll state until it settles. Use
`deep` only after settlement if Shopify read-back proof is needed.

```json
{
  "raven_slug": "<raven.identity.slug>",
  "expected_revision": 0,
  "patch": { "active": false },
  "idempotency_key": "registrations-deactivate-2026-08-25"
}
```

Deactivate with `update_raven` after substituting the current revision.
