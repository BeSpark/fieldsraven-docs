# Tools and permissions

FieldsRaven exposes exactly eleven MCP tools. Read tokens may call the nine tools other than `create_raven` and `update_raven`. Manage tokens include every read permission and may also call those two mutation tools.

| Order | Tool | Read | Manage | Purpose |
| ---: | --- | :---: | :---: | --- |
| 1 | `get_app_info` | Yes | Yes | Show FieldsRaven support, documentation, and server guidance. |
| 2 | `list_resource_types` | Yes | Yes | List the Shopify resource owners supported by Ravens. |
| 3 | `list_value_types` | Yes | Yes | List supported value types and input-shape guidance. |
| 4 | `list_metaobject_definitions` | Yes | Yes | Discover Shopify metaobject definitions with opaque pagination. |
| 5 | `list_ravens` | Yes | Yes | List this shop's Ravens with safe configuration summaries. |
| 6 | `get_raven` | Yes | Yes | Read one shop-owned Raven and its current revision. |
| 7 | `preview_raven_configuration` | Yes | Yes | Validate and preview changes without remote writes, persistence, or jobs. |
| 8 | `create_raven` | No | Yes | Create a Raven through the shared lifecycle orchestrator. |
| 9 | `update_raven` | No | Yes | Update mutable Raven configuration using its expected revision. |
| 10 | `verify_submission` | Yes | Yes | Resolve an opaque receipt and return fresh state or bounded deep evidence. |
| 11 | `list_failed_operations` | Yes | Yes | Page through retained merchant-actionable failures with safe remediation. |

Tool arguments never include `shop_id`; the bearer token determines the authenticated shop. A Raven, Field, cursor, receipt, or failed operation from another shop never becomes accessible by supplying an identifier.

Mutation tools use optimistic revisions and idempotency keys. Read [Workflows and receipts](workflows.md) before automating changes, and use [Errors, limits, and security](errors-and-limits.md) for the stable error contract and retry rules.
