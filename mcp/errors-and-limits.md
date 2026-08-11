# Errors, limits, and security

Requires FieldsRaven 0.30.21 or later

## Stable error codes

FieldsRaven returns fixed safe messages and structured details. Recovery guidance never includes a receipt, submitted value, customer email, raw vendor response, or secret.

| Order | Code | Safe recovery |
| ---: | --- | --- |
| 1 | `INVALID_INPUT` | Correct the named safe validation fields and retry. |
| 2 | `FORBIDDEN_CAPABILITY` | Use a manage token for create_raven or update_raven. |
| 3 | `RAVEN_NOT_FOUND` | List Ravens, then retry with a Raven owned by this shop. |
| 4 | `SUBMISSION_NOT_FOUND` | Check the receipt, then use list_failed_operations for a retained failed operation. |
| 5 | `CONFIGURATION_CONFLICT` | Preview the configuration and resolve the reported safe prerequisite conflicts. |
| 6 | `REVISION_CONFLICT` | Read the Raven again, then retry with its current revision. |
| 7 | `IDEMPOTENCY_CONFLICT` | Reuse the original request for that idempotency key or choose a new key. |
| 8 | `RATE_LIMITED` | Wait for details.retry_after_seconds and any transport Retry-After delay, then retry. |
| 9 | `SHOPIFY_SCOPES_NOT_GRANTED` | Grant the reported Shopify scopes, then retry. |
| 10 | `UPSTREAM_UNAVAILABLE` | Wait and retry; contact support if the condition persists. |
| 11 | `UPSTREAM_TIMEOUT` | Wait and retry; contact support if the condition persists. |
| 12 | `PARTIAL` | Inspect remote_effects and local_applied, then reconcile before retrying. |
| 13 | `INTERNAL_ERROR` | Retry once; if it persists, contact support with the request ID. |

Treat `SUBMISSION_NOT_FOUND` as non-oracular: malformed, expired, cross-shop, and missing-Field receipts all use the same code and safe message. Do not repeatedly probe receipts to distinguish those cases.

## Shop-wide limits

Limits are shop-wide across all tokens; minting more tokens does not add capacity.

* 120 authenticated requests per minute.
* 20 Raven mutations per minute.
* 6 deep verifications per minute.

Mutation calls consume their mutation quota and general admission. Deep verification calls consume their deep quota and general admission, including cache hits. When FieldsRaven returns `RATE_LIMITED`, wait for `details.retry_after_seconds` and any transport `Retry-After` delay rather than retrying immediately.

## Privacy and protected customer data

MCP can verify protected customer data without returning it. Tool results and diagnostics never include a bearer token, never include a submitted value or customer email, and never include raw integration JSON or a third-party payload. Receipts, cursors, and request IDs are correlation artifacts; do not log or publish them.

Use environment-backed bearer configuration, grant manage only where mutation is required, and revoke unused or exposed tokens. Client configuration must contain the environment-variable placeholder, never token plaintext.

## Key and rotation boundaries

API-token digests, issuance nonces, and cursors use separate Rails key-generator purposes and rotate with `SECRET_KEY_BASE`. These purposes do not make the artifacts interchangeable.

Receipts use the current `FR_RECEIPT_KEY` root or the `SECRET_KEY_BASE` fallback, labeled by `FR_RECEIPT_KEY_ID`. A configured `FR_RECEIPT_KEY_PREVIOUS` and `FR_RECEIPT_KEY_PREVIOUS_ID` provide only a one-version receipt overlap.

Never expose key values. Rotating a root invalidates artifacts outside its explicit overlap. Revoke and mint tokens separately; receipt-key overlap does not preserve bearer tokens, issuance nonces, or cursors.

If a safe retry does not resolve a problem, contact [karim@fieldsraven.app](mailto:karim@fieldsraven.app) with the request ID and error code only.
