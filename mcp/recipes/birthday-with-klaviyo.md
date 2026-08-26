# Birthday with Klaviyo

Requires FieldsRaven 0.34.0 or later.

Use a **Manage token** and a logged-in customer flow. MCP configures and verifies the Raven but
cannot originate a storefront submission; retain `submission.receipt` from the theme and use
`verify_submission` in `state` mode.

The customer must be logged in when submitting the birthday value.

This is a two-beat recipe: create the Raven first, then consider sync only after its prerequisite
is satisfied.

## Beat 1: create the birthday Raven without sync

```json
{
  "configuration": {
    "resource_name": "customer",
    "namespace": "fields_raven",
    "key": "birthday",
    "value_type": "single_line_text_field",
    "active": true,
    "needs_approval": false,
    "use_customer_email_as_id": false
  },
  "idempotency_key": "birthday-provision-2026-08-25"
}
```

For `applied` or `existing`, read `raven.identity.slug` and `raven.revision`; for `conflict` or
`partial`, read `current_raven.identity.slug` and `current_raven.revision`. Then call `get_raven`
with the `generic` template. The revision is the `expected_revision` for the second beat, and an
idempotency key is only reusable for an identical request.

## Beat 2: optional Klaviyo sync

`klaviyo_sync` is an optional recommendation. Before enabling it, the merchant must enter a usable
Klaviyo credential in the admin; MCP cannot supply that credential. The option can make its update
fail when the credential is missing or unusable, and it was not live-exercised on a designated test
store for this release.

```json
{
  "raven_slug": "<raven.identity.slug>",
  "expected_revision": 0,
  "patch": { "klaviyo_sync": true },
  "idempotency_key": "birthday-enable-klaviyo-2026-08-25"
}
```

Make a fresh submission after enabling sync: verification records the configuration at submission
time, so an earlier receipt cannot prove the new setting. Poll `submission.receipt` in state mode.
Read the Klaviyo hop rather than using deep mode for diagnosis: `KLAVIYO_SYNCED` means it completed,
while `KLAVIYO_SYNC_FAILED` means investigate the sync rather than re-entering a credential.

```json
{
  "raven_slug": "<raven.identity.slug>",
  "expected_revision": 0,
  "patch": { "active": false, "klaviyo_sync": false },
  "idempotency_key": "birthday-deactivate-2026-08-25"
}
```

Deactivate with `update_raven` only after replacing the placeholder revision with the current value.
