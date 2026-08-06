---
description: Hide a resource from search engines and sitemaps in Shopify
---

# Sitemap manager

[Shopify has a predefined metafield for all resources to hide a resource from search engines and sitemaps. ](https://shopify.dev/docs/apps/marketing/seo)This app embed will take advantage of this metafield to hide/show Shopify pages from store sitemap and search engines.

Before you enable the app embed you need to create a raven (instructions below) for each type of resource you want to be able to show/hide from the sitemap and search engines.

{% hint style="info" %}
This feature is only suported for the following resource types: collection, product, article, blog, page
{% endhint %}

<figure><img src="https://1211303336-files.gitbook.io/~/files/v0/b/gitbook-x-prod.appspot.com/o/spaces%2FNP07jPPCyBlsAnUAqYNM%2Fuploads%2F1ihUEr14JFmb8daUUTXc%2FFieldsRaven%20Dev%20%C2%B7%20FieldsRaven%20%5BDEV%5D%20%C2%B7%20Shopify%202023-03-11%2009-07-48.png?alt=media&#x26;token=4acd0ff0-067e-4c3f-adad-6a83660eee90" alt=""><figcaption><p>Go to "Ravens" page and click on "Create a new Raven"</p></figcaption></figure>

<figure><img src="https://1211303336-files.gitbook.io/~/files/v0/b/gitbook-x-prod.appspot.com/o/spaces%2FNP07jPPCyBlsAnUAqYNM%2Fuploads%2FRooOfmv0U3WJWChs6QrO%2FFieldsRaven%20Dev%20%C2%B7%20FieldsRaven%20%5BDEV%5D%20%C2%B7%20Shopify%202023-03-11%2009-12-49.png?alt=media&#x26;token=01cc3b38-6a99-4693-a95c-6bee439e32c6" alt=""><figcaption><p>Create a raven</p></figcaption></figure>

<figure><img src="https://1211303336-files.gitbook.io/~/files/v0/b/gitbook-x-prod.appspot.com/o/spaces%2FNP07jPPCyBlsAnUAqYNM%2Fuploads%2F0pjinAm6YUUGY92I3rKW%2FFieldsRaven%20Dev%20%C2%B7%20FieldsRaven%20%5BDEV%5D%20%C2%B7%20Shopify%202023-03-11%2009-16-35.png?alt=media&#x26;token=128fe35a-2421-41c1-87da-410779696bc4" alt=""><figcaption><p>Create a raven for each resource you want to hide/show</p></figcaption></figure>



To enable the "Sitemap Manager" app embed, follow steps below:



<figure><img src="https://1211303336-files.gitbook.io/~/files/v0/b/gitbook-x-prod.appspot.com/o/spaces%2FNP07jPPCyBlsAnUAqYNM%2Fuploads%2FoyZCkvcWN9xtQzbsvoB3%2FFieldsRaven%20Dev%20%C2%B7%20Themes%20%C2%B7%20Shopify%202023-03-11%2008-58-12.png?alt=media&#x26;token=a0999dfa-81d4-42f7-b821-37a84c35233f" alt=""><figcaption><p>Go to theme customizer</p></figcaption></figure>

<figure><img src="https://1211303336-files.gitbook.io/~/files/v0/b/gitbook-x-prod.appspot.com/o/spaces%2FNP07jPPCyBlsAnUAqYNM%2Fuploads%2FcMtXJwqGivhgpjtY3s2K%2FFieldsRaven%20Dev%20%C2%B7%20Customize%20FieldsRaven%20%5BDev%5D%20%C2%B7%20Shopify%202023-03-11%2008-59-57.png?alt=media&#x26;token=8563cecd-131d-4b06-8f84-6a10ac1a01cc" alt=""><figcaption><p>Click on App embeds</p></figcaption></figure>



<figure><img src="https://1211303336-files.gitbook.io/~/files/v0/b/gitbook-x-prod.appspot.com/o/spaces%2FNP07jPPCyBlsAnUAqYNM%2Fuploads%2FXHLA5CIBzoa85UVoHcMX%2FFieldsRaven%20Dev%20%C2%B7%20Customize%20FieldsRaven%20%5BDev%5D%20%C2%B7%20Shopify%202023-03-11%2009-18-19.png?alt=media&#x26;token=341938a3-d1e1-4b3f-9aeb-9e7a1af30605" alt=""><figcaption><p>Make sure that FieldsRaven "Storefront Kit" is enabled and "Include AlpineJS" is checked</p></figcaption></figure>

{% hint style="warning" %}
This is an admin only feature, the popup will be only visible to a logged-in customer with the provided email.
{% endhint %}

<figure><img src="https://1211303336-files.gitbook.io/~/files/v0/b/gitbook-x-prod.appspot.com/o/spaces%2FNP07jPPCyBlsAnUAqYNM%2Fuploads%2FLnvHKH4z52nEgnXPDkc8%2FFieldsRaven%20Dev%20%C2%B7%20Customize%20FieldsRaven%20%5BDev%5D%20%C2%B7%20Shopify%202023-03-11%2009-20-34.png?alt=media&#x26;token=c923f7ba-bf5c-4730-95b3-5b39a32a74ba" alt=""><figcaption><p>1) Enable "Sitemap manager" app embed 2) Copy &#x26; paste raven ids, make sure that the raven resource type match the type in the settings 3) Add admin email 4) Save!</p></figcaption></figure>

After you login using the email you used in the settings as an admin email, you should be able to see this.

<figure><img src="https://1211303336-files.gitbook.io/~/files/v0/b/gitbook-x-prod.appspot.com/o/spaces%2FNP07jPPCyBlsAnUAqYNM%2Fuploads%2FoamPCQY82Qp91TYbXsxj%2FTest%20page%20%E2%80%93%20FieldsRaven%20Dev%202023-03-11%2014-54-47.png?alt=media&#x26;token=bf4a5e66-7ec7-4426-8800-e41de2b3c4a2" alt=""><figcaption><p>FieldsRaven Hide/Show from sitemap widget</p></figcaption></figure>

<figure><img src="https://1211303336-files.gitbook.io/~/files/v0/b/gitbook-x-prod.appspot.com/o/spaces%2FNP07jPPCyBlsAnUAqYNM%2Fuploads%2FMlzyTM9jmh5QUSvyCZJM%2FTest%20page%20%E2%80%93%20FieldsRaven%20Dev%202023-03-11%2014-56-09.png?alt=media&#x26;token=eaee3ae2-f717-46cb-80e4-e18dc58b7831" alt=""><figcaption><p>FieldsRaven Hide/Show from sitemap widget when it's open</p></figcaption></figure>

{% hint style="info" %}
Note: when a resource is hidden from the sitemap,  it won't appear in search results when customers use storefront search.
{% endhint %}



