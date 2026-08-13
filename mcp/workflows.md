# Workflows and receipts

Requires FieldsRaven 0.30.23 or later

## Configure a Raven safely

Use the discover, preview, create, and update sequence: discover supported resource/value types and definitions, preview the proposed Raven, create it only after the preview is valid, then update it against the revision you actually read.

Updates use optimistic revision checks. On a revision conflict, read the Raven again and decide whether your change is still correct. Send an idempotency key with each create or update attempt; reusing a key with a different request produces an idempotency conflict instead of silently applying different work.

Preview may perform bounded prerequisite reads, but it does not write remotely, persist a Raven, or enqueue work. Create and update can return a partial outcome when safe remote effects completed but the local optimistic write did not; inspect `remote_effects` and `local_applied` before reconciling.

## Submit, poll, and investigate

Use the submit, poll, deep, and failed operation sequence: submit through the storefront app proxy, poll the returned receipt in state mode, request deep evidence only after settlement when needed, and list failed operations when a merchant-actionable submission needs remediation.

Every successful storefront submission response contains one stateless encrypted receipt for each committed Field. `create_metafield` and deprecated `create_update_metafield` each return one receipt. `create_multiple_metafields` returns one ordered receipt per committed Field. A successful `delete_metafield` response does not return a receipt. Receipts are generated inside the Field transaction. Their default and maximum expiry is seven days. If receipt issuance fails, the transaction rolls back the Field or the whole batch, and a failed batch returns no receipts.

A successful receipt is never reissued after response loss. Preserve the response received by the storefront; a later search cannot reconstruct that success receipt. `list_failed_operations` may issue a fresh receipt only for an existing retained failed-operation Field.

Fields are retained only while their installed Shop row exists. Fields cascade-delete when that Shop is destroyed or uninstalled, so receipt expiry never promises evidence beyond Field existence.

Malformed, expired, cross-shop, and missing-Field receipts all return the same non-oracular `SUBMISSION_NOT_FOUND`. The response does not reveal which check failed.

## State and deep verification

State mode returns fresh local evidence on every call, including the safe overall status and configured hop states. Pending work includes retry guidance and is a valid domain result, not a transport failure.

Deep mode starts with fresh state and adds bounded Shopify, Klaviyo, metaobject, and customer-link read-back evidence for settled work. It compares expected and observed values in memory but returns only stable verdicts, safe messages, evidence kinds, and observation times. Airtable is always `state_only`; FieldsRaven does not claim independent Airtable read-back.

Deep calls are deadline-bounded and quota-limited. A short remote-evidence cache does not make cache hits quota-free. See [Errors, limits, and security](errors-and-limits.md) before writing a polling loop.

## Privacy boundary

Receipts are opaque correlation artifacts, not customer records. Tool output and support diagnostics omit submitted values, customer email addresses, raw remote values, integration JSON, access tokens, and unredacted vendor errors. Follow the [Quick Start](../quick-start.md) for storefront theme placement; do not move customer submission data into MCP configuration files.
