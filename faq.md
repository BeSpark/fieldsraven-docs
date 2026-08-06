# FAQ

#### How does FieldsRaven differentiate from any other metafields app?

* Unlike other metafields apps, FieldsRaven is built for developers.
* FieldsRaven doesn't have an admin UI to create and manage metafields.
* As a developer you need to write a few lines of HTML, Liquid and JavaScript to take advantage of the app. (Check [quick start guide](quick-start))
* Metafields should be created on a specific events on the storefront, based on customer actions or predetermined logic.
* Have a look at the example [features link](example-features) to get a better idea of what you might be able to build on top of FieldsRaven.

#### **We have noticed a 6-10seconds delay between the return of AJAX call and time to have this information on metafields. Is it possible to decrease this time?**

There are a few things that contributes to that delay:&#x20;

1. Each request to FieldsRaven gets queued, so there is delay depending on how long the queue is
2. The requests coming from the storefront to FieldsRaven will be throttled to match Shopify API rate limit for the store
3. Shopify REST API takes on average 1.5 seconds to create a metafield
4. Shopify cache, unpublished themes will display newly created metafields faster than published/live themes

I guess there are a couple of things I can do on my end to&#x20;

1. Add transparency on the time it took FieldsRaven to send the request to Shopify
2. How long it took Shopify to return a response (success/fail)
3. Try GraphQL API, which might be a bit faster and more generous with rate limit

At the moment however, I don't have a plan to invest time on this.

#### I have noticed is that FieldsRaven will not update a metafield if it is changing to a blank.

Regarding changing values to blank, I assume that should work with text type fields, for other available types you might wanna change it to 0 for numbers and maybe an empty "{}" for JSON, and then manage the display of those values with liquid. \
\
At the moment, I validate the value on the backend so if the value isn't valid for the field type the value will get rejected. \
\
I guess I should add a delete field endpoint, maybe at some point I will :)
