---
description: Confirm from your theme that an asynchronous metafield write actually landed, using the receipt returned by a storefront submission.
---

# Verify a submission

A storefront submission is accepted **before** the metafield is written — the response says "Sit tight the raven is on it!" and the write happens in the background moments later. Usually that is all you need. But if your theme wants to show a real confirmation ("your entry is saved") rather than an optimistic one, it needs a way to ask whether the write landed.

That is what the verify endpoint is for.

```
GET /apps/raven/verify_submission?receipt=<receipt>
```

Requires FieldsRaven 0.31.9 or later.

## Where the receipt comes from

Every successful submission response carries a `submission` object with a `receipt` and an `expires_at`:

```json
{
  "message": "Sit tight the raven is on it!",
  "submission": {
    "receipt": "frsr1...",
    "expires_at": "2026-08-27T00:00:00Z"
  }
}
```

The receipt is an opaque token. Hold on to it in the page's JavaScript — it is the **only** handle the verify endpoint accepts, it is bound to your shop, and it expires (default seven days). It cannot be reconstructed later, so capture it from the submission response or not at all.

## The response

```json
{ "state": "pending", "retry_after_seconds": 2 }
```

| `state` | Meaning | What your theme should do |
| --- | --- | --- |
| `pending` | The write hasn't completed yet | Wait `retry_after_seconds`, then poll again |
| `landed` | The metafield write completed | Show your confirmation |
| `awaiting_approval` | The submission is held for merchant approval | Tell the shopper it's received and pending review |
| `rejected` | The merchant rejected the submission | Show your rejection copy |
| `failed` | The write failed | Show your failure copy; the merchant sees it on Failed Operations |

`retry_after_seconds` is only present while another poll is worth making — it carries a value on `pending` and is `null` on every other state.

The state reflects the **metafield write only**. Integrations the raven may also run (Klaviyo, Airtable, metaobject sync) never change the answer — a submission is `landed` when its metafield is written, whatever its syncs are still doing.

## What a 404 means

A bad receipt — malformed, expired, from another shop, or never issued — always returns the same thing:

```
404  { "state": "not_found" }
```

Deliberately, the response does not say which of those it was, so receipts cannot be used to probe for what exists. Note that an **expired** receipt also lands here: if a shopper leaves a tab open past the receipt's `expires_at` and your script polls again, treat `not_found` as "this confirmation is no longer available", not as an error worth alarming anyone about.

## Rules your polling should respect

* **Never cache the response.** Every response carries `Cache-Control: no-store`, and that is the point of the endpoint — it is the one storefront-reachable read that is guaranteed fresh. Don't wrap it in your own caching layer.
* **Back off between polls.** Follow `retry_after_seconds` when present. Most writes land within a couple of seconds; a poll loop tighter than that gains nothing.
* **Handle `429` and `503` as backpressure, not failure.** The endpoint is rate limited per shop and per visitor IP. Shoppers behind one shared IP (an office, a cafe) share a window, so a `429` can happen to a perfectly polite script. A `503` (empty body) means the limiter's backing store was briefly unavailable and the endpoint failed closed. Both carry a `Retry-After` header; wait a few seconds and resume polling — don't surface either as an error.
* **Treat any other status as transient and stop polling.** A `400` or `500` returns `{"error": ...}` with no `state`. Don't loop on it — fall back to your optimistic "submission received" copy.

## Example

```javascript
async function confirmSubmission(receipt) {
  for (let i = 0; i < 10; i++) {
    const response = await fetch(
      `/apps/raven/verify_submission?receipt=${encodeURIComponent(receipt)}`
    )
    if (response.status === 429 || response.status === 503) { await sleep(3000); continue }
    if (response.status === 404) return "not_found"
    if (!response.ok) return "pending" // 400/500 — stop polling, stay optimistic
    const body = await response.json()
    if (body.state !== "pending") return body.state
    await sleep((body.retry_after_seconds || 2) * 1000)
  }
  return "pending" // still not settled — treat as accepted, not failed
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
```

Submit with the pattern from the [Quick Start](quick-start.md), pass the `receipt` from its response into `confirmSubmission`, and branch your UI on the returned state.
