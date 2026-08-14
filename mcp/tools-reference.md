# Tools and permissions

Requires FieldsRaven 0.30.23 or later

FieldsRaven exposes exactly eleven MCP tools. Read tokens may call the nine tools other than `create_raven` and `update_raven`. Manage tokens include every read permission and may also call those two mutation tools.

| Order | Tool | Read | Manage | Purpose |
| ---: | --- | :---: | :---: | --- |
| 1 | `get_app_info` | Yes | Yes | Where to get help, and what this server can do. |
| 2 | `list_resource_types` | Yes | Yes | List the Shopify resources a Raven can write to — customer, product, page, and so on. |
| 3 | `list_value_types` | Yes | Yes | List the value types a Raven can use, and what each expects on the wire. |
| 4 | `list_metaobject_definitions` | Yes | Yes | List the shop's Shopify metaobject definitions, a page at a time. |
| 5 | `list_ravens` | Yes | Yes | List the shop's Ravens and their settings. |
| 6 | `get_raven` | Yes | Yes | Read a single Raven, including the revision number you need in order to update it. |
| 7 | `preview_raven_configuration` | Yes | Yes | Check a Raven's configuration before committing to it. Writes nothing, anywhere. |
| 8 | `create_raven` | No | Yes | Create a Raven. Runs the same validation the app's own form does. |
| 9 | `update_raven` | No | Yes | Update mutable Raven configuration using its expected revision. |
| 10 | `verify_submission` | Yes | Yes | Look up a storefront submission by its receipt, and optionally check it against Shopify. |
| 11 | `list_failed_operations` | Yes | Yes | List submissions that failed in a way the merchant can act on, with what to do about each. |

Tool arguments never include `shop_id`; the bearer token determines the authenticated shop. A Raven, Field, cursor, receipt, or failed operation from another shop never becomes accessible by supplying an identifier.

Mutation tools use optimistic revisions and idempotency keys. Read [Workflows and receipts](workflows.md) before automating changes, and use [Errors, limits, and security](errors-and-limits.md) for the stable error contract and retry rules.
