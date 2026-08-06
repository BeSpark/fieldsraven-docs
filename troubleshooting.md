# Troubleshooting

### Invalid auth\_code

<figure><img src="https://1211303336-files.gitbook.io/~/files/v0/b/gitbook-x-prod.appspot.com/o/spaces%2FNP07jPPCyBlsAnUAqYNM%2Fuploads%2FsD0o7LiT0h3xrmsdUKJM%2Funnamed.png?alt=media&#x26;token=147812e6-1e4c-4103-854e-131e28c2e4b2" alt=""><figcaption></figcaption></figure>

When a request (aka. raven) is sent, payload must include a `raven_mac` which is a `sha256` generated using a secret key. That secret is added to the store when FieldsRaven app is installed, in rare occasions the app fails to add the secret key, when that happens, the incoming payload won't have a valid `raven_mac`.

To make sure your Shopify store has the secret key go to settings and click on the eye icon, if the secret key is missing please [reach out](mailto:karim@fieldsraven.app).

<figure><img src="https://1211303336-files.gitbook.io/~/files/v0/b/gitbook-x-prod.appspot.com/o/spaces%2FNP07jPPCyBlsAnUAqYNM%2Fuploads%2FYq1WC6hvTdwDsRIMlnFF%2FFieldsRaven%20Dev%20%C2%B7%20FieldsRaven%20%5BDEV%5D%20%C2%B7%20Shopify%202023-04-18%2010-55-06.png?alt=media&#x26;token=3d0c126f-b878-49a5-899b-6f631ae45c7b" alt=""><figcaption></figcaption></figure>

#### Error: null

<figure><img src="https://1211303336-files.gitbook.io/~/files/v0/b/gitbook-x-prod.appspot.com/o/spaces%2FNP07jPPCyBlsAnUAqYNM%2Fuploads%2FahTiN5nYd1Dg4ZQ3A2vj%2FFieldsRaven%202023-04-18%2010-49-54.png?alt=media&#x26;token=9996df62-1705-4fd9-838f-772a9b9f3d29" alt=""><figcaption></figcaption></figure>

This might be because you created the metafiled in Shopify admin and added a validation to the filed, make sure the data you send from the storefront is valid according to the validation you created and make sure the metafield type matches the type sent by FieldsRaven.
