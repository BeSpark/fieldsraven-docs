---
description: Ready-made theme blocks you enable in the theme customizer, no code required.
---

# App embeds

App embeds are blocks FieldsRaven adds to your theme customizer. You switch them on under **Online Store → Themes → Customize → App embeds**, fill in a setting or two, and save. No theme code to paste.

Three are available:

| Embed | What it does |
| ----- | ------------ |
| **Storefront Kit** | Loads FieldsRaven's storefront JavaScript, and optionally AlpineJS. **The other two embeds depend on it.** |
| **Sitemap Manager** | Adds an admin-only widget for hiding a page, product, collection, article or blog from search engines and your sitemap. |
| **Birthday Popup (example)** | A worked example — collects a customer's birthday into a metafield. Built to show what's possible, not as a finished feature. |

## Start with the Storefront Kit

Both other embeds need it. Enable **Storefront Kit** first, and tick **Include AlpineJS** unless your theme already loads Alpine itself — the Sitemap Manager and Birthday Popup are both built with it.

If an embed looks enabled but nothing appears on the storefront, an unchecked Storefront Kit is the usual reason.

## These are examples you can replace

The embeds are deliberately narrow. They exist to show a complete working path from a storefront interaction to a Shopify metafield, using nothing but FieldsRaven.

Anything they do, you can build yourself with the code the **Get Code** panel generates — see [Quick Start](../quick-start.md). The Birthday Popup in particular is labelled *(example)* in the theme customizer for exactly that reason.
