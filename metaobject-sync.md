---
description: Mirror each storefront submission into a Shopify metaobject entry, alongside the metafield FieldsRaven already writes.
---

# Metaobject sync

A JSON-type raven can mirror every storefront submission into a **Shopify metaobject entry**, in addition to the metafield it already writes.

This is a post-processing step bolted onto the existing pipeline. The metafield write is untouched, and a metaobject failure — bad data, a Shopify error, a dropped connection — never changes the submission's status and never blocks the metafield from saving. If metaobject sync breaks, your storefront keeps working exactly as before.

## Why you'd want it

A JSON metafield is one opaque blob. A metaobject entry is a typed record with named fields, which means Shopify itself can filter, reference, and render it — and other apps and Flow can read it as structured data rather than parsing your JSON.

## You own the definition, not FieldsRaven

FieldsRaven asks for three scopes:

* `read_metaobject_definitions`
* `read_metaobjects`
* `write_metaobjects`

`write_metaobject_definitions` is deliberately **not** among them. FieldsRaven never creates or edits a metaobject definition. You build and own the definition in Shopify admin; the app only reads it and writes entries against it.

Existing merchants keep working exactly as before and opt in when they choose. If your store hasn't granted these scopes yet, **Settings** shows a "Permissions update needed" section with a re-authorization button, and metaobject sync stays dormant until you approve it. Nothing is forced, and declining costs you nothing else.

## Setting it up

### 1. Get the definition brief

Before a matching definition exists, FieldsRaven drafts one for you as a checklist — inferring field names and types either from a real prior submission or from a sample payload you paste in.

The pasted sample is sent as form data, never in a URL, and is never echoed back into the brief's output or into any log. Query strings leak into proxy logs, browser history, and referrer headers; a sample payload has no business in any of them.

### 2. Build the definition in Shopify admin

Follow the brief. Create the metaobject definition with the field names and types it lists.

### 3. Attach it to the raven

In the raven's settings, enable metaobject sync and select your definition. From the next submission on, each one writes both a metafield and a metaobject entry.

## How values are converted

Coercion is **lenient in, canonical out**: FieldsRaven accepts the forms a real HTML form actually submits, then normalizes them to what Shopify wants.

Numbers are parsed against HTML's own "valid floating-point number" grammar and canonicalized, bounded by Shopify's numeric limits:

| You submit | Stored as |
| ---------- | --------- |
| `007`      | `7`       |
| `1e3`      | `1000`    |
| `.5`       | `0.5`     |

Booleans accept `yes`, `no`, `on`, `off`, `1`, and `0` in any case — `on` in particular is what a bare HTML checkbox submits.

This matters because `<input type="number">` legitimately permits leading zeros and exponent form. Earlier versions accepted only the exact canonical spelling, which meant FieldsRaven manufactured failures from values emitted by the very forms it generates.

Values that genuinely don't fit the field's type are still rejected, and surface as described below.

## Retries and idempotency

Each field's entry upserts against a **handle derived from the raven and field**, so a retry after a lost response converges on the same entry rather than creating a duplicate. `SyncMetaobjectJob` retries up to 8 times.

**Nothing already synced to Shopify is ever deleted by this app.** Disabling sync, switching definitions, or deleting the raven all leave existing entries in place. If you want an entry gone, remove it in Shopify admin.

## Linking entries to a customer

Optional, and **off by default**. For customer-owned ravens, FieldsRaven can maintain a `list.metaobject_reference` customer metafield listing that customer's entries, so you can render a customer's submission history directly in Liquid.

Entries are appended with compare-and-set, so two near-simultaneous submissions can't overwrite each other's link.

The list is capped at **256 entries per customer**. Past that, new entries still sync — they just stop being added to the link list, and the raven's dashboard shows a warning.

## Keeping an eye on it

**Status badges** appear across the dashboard views: *synced*, *pending*, *needs attention*, and *out of sync*.

**Failed Operations** lists metaobject sync failures that you can actually act on. A failed sync leaves the submission's own status at *success* — the JSON metafield write did succeed — so these are tracked separately rather than being reported as broken submissions.

Failures still being retried are deliberately excluded from that list. A delivery that hasn't finished isn't a failure yet, and listing it would report a submission as broken while it's still on its way.

**Drift detection** runs daily: FieldsRaven re-reads each linked definition and flags the raven if the definition changed or was deleted. A transient connection failure is never read as "the definition was deleted" — that distinction matters, because collapsing it would falsely flag every synced raven during a Shopify outage.
