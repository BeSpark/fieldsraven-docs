# Workflows and receipts

Requires FieldsRaven 0.30.23 or later

## Configure a Raven safely

Discover, then preview, then create, then update — in that order:

1. **Discover** — list the supported resource types, value types and metaobject definitions.
2. **Preview** — check the Raven you intend to create. Nothing is written.
3. **Create** — only once the preview comes back valid.
4. **Update** — against the revision you actually read, not one you assumed.

Updates use optimistic revision checks. On a revision conflict, read the Raven again and decide whether your change is still correct. Send an idempotency key with each create or update attempt; reusing a key with a different request produces an idempotency conflict instead of silently applying different work.

Preview may read a few things it needs to check against — but it writes nothing to Shopify, saves no Raven, and queues no work. Create and update can return a partial outcome when safe remote effects completed but the local optimistic write did not; inspect `remote_effects` and `local_applied` before reconciling.

## Submit, poll, and investigate

Submit, then poll, then go deep, then list failed operations — in that order:

1. **Submit** through the storefront app proxy, as your theme already does.
2. **Poll** the receipt it returns, using state mode.
3. **Go deep** only once the work has settled, and only if you need read-back proof.
4. **List failed operations** when something failed in a way the merchant can fix.

Every successful storefront submission response contains one stateless encrypted receipt for each committed Field. `create_metafield` and deprecated `create_update_metafield` each return one receipt. `create_multiple_metafields` returns one ordered receipt per committed Field. A successful `delete_metafield` response does not return a receipt. Receipts are generated inside the Field transaction. Their default and maximum expiry is seven days. If receipt issuance fails, the transaction rolls back the Field or the whole batch, and a failed batch returns no receipts.

A successful receipt is never reissued after response loss. Preserve the response received by the storefront; a later search cannot reconstruct that success receipt. `list_failed_operations` may issue a fresh receipt only for an existing retained failed-operation Field.

Fields are retained only while their installed Shop row exists. Fields cascade-delete when that Shop is destroyed or uninstalled, so receipt expiry never promises evidence beyond Field existence.

Malformed, expired, cross-shop, and missing-Field receipts all return the same `SUBMISSION_NOT_FOUND`. The response deliberately does not say which of the four it was, so a receipt cannot be used to probe for what exists.

## State and deep verification

State mode returns fresh local evidence on every call, including the safe overall status and configured hop states. Pending work includes retry guidance and is a valid domain result, not a transport failure.

Deep mode does everything state mode does, then reads back from Shopify, Klaviyo, the metaobject and the customer-link to confirm the write actually landed. It only does this for work that has finished. It compares expected and observed values in memory but returns only stable verdicts, safe messages, evidence kinds, and observation times. Airtable is always `state_only`; FieldsRaven does not claim independent Airtable read-back.

Deep calls have both a time limit and a quota. Results are briefly cached, but a cache hit still counts against the quota. See [Errors, limits, and security](errors-and-limits.md) before writing a polling loop.

## Privacy boundary

A receipt is a lookup token, not a record of what was submitted. Tool output and support diagnostics omit submitted values, customer email addresses, raw remote values, integration JSON, access tokens, and unredacted vendor errors. Follow the [Quick Start](../quick-start.md) for storefront theme placement; do not move customer submission data into MCP configuration files.
