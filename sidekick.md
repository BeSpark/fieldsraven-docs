# Ask Shopify Sidekick about FieldsRaven

Sidekick, the AI assistant in your Shopify admin, can answer questions about FieldsRaven for you. Ask in plain words and Sidekick checks FieldsRaven, then answers with links that open the right FieldsRaven screen.

## What you can ask

* **What needs attention?** For example: "Does anything in FieldsRaven need my attention?" Sidekick tells you how many submissions are waiting for your approval and how many failed to save to Shopify, with links to the approval queue and the failed operations screen.
* **What failed?** For example: "Which FieldsRaven submissions failed?" Sidekick lists up to 10 of the most recent submissions that failed to save to a Shopify metafield or metaobject: which resource and metafield, why it failed, when it was submitted, and a link to the submission.
* **Which forms are set up?** For example: "Which FieldsRaven forms are active?" Sidekick lists up to 20 of your most recent forms (ravens), what each one saves to, whether it is active, whether its submissions need approval, and a link to open it in FieldsRaven.

## What Sidekick can and cannot see

Sidekick only reads. Approving, declining and retrying still happen in FieldsRaven, through the links in Sidekick's answer.

When you ask, FieldsRaven sends Sidekick:

* counts of submissions
* the Shopify resource names and metafield namespace/key identifiers you configured
* whether each form is active and whether it needs approval
* fixed failure codes, such as `metafield_delivery_failed`
* whether FieldsRaven's Shopify connection needs attention
* submission timestamps
* links into FieldsRaven

**FieldsRaven never sends Sidekick the values your customers submitted.** To see a submitted value, open the submission from Sidekick's link.

Sidekick's answers cover submissions waiting for approval and submissions that failed to save to Shopify. They do not report Klaviyo or Airtable delivery. Check those in FieldsRaven.

## If FieldsRaven's connection needs attention

If FieldsRaven's connection to your store needs attention, Sidekick says so before anything else and links you to FieldsRaven for the next steps. Open the link to see what to do.

## If Sidekick doesn't use FieldsRaven

Sidekick decides which apps to ask for each question, and it only considers a limited number of your installed apps. If an answer doesn't come from FieldsRaven, mention FieldsRaven by name in your question. You can always get the same information directly in FieldsRaven.
