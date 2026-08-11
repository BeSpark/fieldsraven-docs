# FieldsRaven MCP

Requires FieldsRaven 0.30.21 or later

FieldsRaven's production Model Context Protocol endpoint is `https://fieldsraven.app/mcp`. It lets an MCP client inspect supported field types and Ravens, preview configuration, manage Ravens with explicit permission, and verify storefront submissions without exposing shop secrets or customer values.

## Eligibility and permissions

Any merchant with the already installed FieldsRaven app who can open authenticated Settings may create MCP tokens. FieldsRaven does not perform a separate MCP billing lookup or require a second MCP plan.

Choose the narrowest capability you need:

* A **read** token can discover types and Ravens, preview changes, and verify submissions.
* A **manage** token includes every read permission and can create or update Ravens. A manage token can change Raven configuration, so protect it like an administrator credential.

See [Tools and permissions](tools-reference.md) for the exact matrix.

## Safe token lifecycle

Create and revoke MCP tokens from authenticated FieldsRaven Settings. Token creation uses a short-lived, shop-bound, one-time form nonce. The plaintext has a one-time reveal and is shown exactly once; FieldsRaven stores only its digest and cannot recover it later.

Copy the token directly into the `FIELDSRAVEN_MCP_TOKEN` environment variable, then leave it out of client configuration files, URLs, support messages, logs, and screenshots. Revoking a token takes effect on later authenticated requests.

If the creation response is lost, Settings may show an active token row even though you never received the plaintext. Revoke that row and mint a replacement. Do not expect FieldsRaven to recover or re-show the token.

Continue with [Client setup](client-setup.md).

## From storefront to verification

The MCP tools configure Ravens; your theme still submits customer data through the FieldsRaven storefront app proxy. Follow the [Quick Start](../quick-start.md) for the current direct-request example and theme snippet placement, then use the receipt returned by a successful storefront submission with the verification tools described in [Workflows and receipts](workflows.md).

For help, email [karim@fieldsraven.app](mailto:karim@fieldsraven.app). Never include bearer tokens, receipts, submitted values, customer email addresses, or integration payloads in a support message.
