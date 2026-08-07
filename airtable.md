# Airtable

{% hint style="info" %}
Airtable sync is only available a field that has customer resource and JSON value type.
{% endhint %}

<figure><img src="https://1211303336-files.gitbook.io/~/files/v0/b/gitbook-x-prod.appspot.com/o/spaces%2FNP07jPPCyBlsAnUAqYNM%2Fuploads%2FUtS8JfZhZYLVnk8eEejB%2FFieldsRaven%20Stage%20%C2%B7%20FieldsRaven%20%5BSTAGE%5D%20%C2%B7%20Shopify%202023-05-13%2010-30-42.png?alt=media&#x26;token=96ba2b05-37fc-48c0-92af-327d8890c91f" alt=""><figcaption><p>FieldRAven: Airtable sync is only available a field that has customer resource and JSON value type.</p></figcaption></figure>

### 1. If you don't already have an account, create an account and then:

1. Create an empty base
2. Rename first table column/field to match your incoming data first key
3. Delete the fields/columns that Airtable created by default and create your own fields/columns
4. Make sure the type of the field/column matches the types of your incoming data values



<figure><img src="https://1211303336-files.gitbook.io/~/files/v0/b/gitbook-x-prod.appspot.com/o/spaces%2FNP07jPPCyBlsAnUAqYNM%2Fuploads%2FLdbq7W4s2SIcOQMcJB7N%2FAirtable%202023-05-13%2009-40-52.png?alt=media&#x26;token=57826346-e1c5-4350-afe8-a3495d29573e" alt="FieldsRaven: Create an empty Airtable base"><figcaption><p>1.Create an empty base</p></figcaption></figure>

<figure><img src="https://1211303336-files.gitbook.io/~/files/v0/b/gitbook-x-prod.appspot.com/o/spaces%2FNP07jPPCyBlsAnUAqYNM%2Fuploads%2FLC3JgXIWKnBgl3ZVF1F8%2FFieldsRaven%20Stage%3A%20Table%201%20-%20Airtable%202023-05-13%2009-42-57.png?alt=media&#x26;token=bff5be48-570f-4121-93b8-b140f7492697" alt=""><figcaption><p>2.rename first column to match your incoming data first key</p></figcaption></figure>

<figure><img src="https://1211303336-files.gitbook.io/~/files/v0/b/gitbook-x-prod.appspot.com/o/spaces%2FNP07jPPCyBlsAnUAqYNM%2Fuploads%2FyakPe5dYohXZUEEr8aYs%2FFieldsRaven%20Stage%3A%20Table%201%20-%20Airtable%202023-05-13%2009-46-03.png?alt=media&#x26;token=cc36f7dc-c4f5-46a5-a25e-fc5ea88616ab" alt=""><figcaption><p>3.Delete the fields/columns that Airtable created by default and create your own fields/columns</p></figcaption></figure>

<figure><img src="https://1211303336-files.gitbook.io/~/files/v0/b/gitbook-x-prod.appspot.com/o/spaces%2FNP07jPPCyBlsAnUAqYNM%2Fuploads%2FfaQyXLZRKHCnGIWenxOy%2F%5BStage%5D%20FieldsRaven%20Products%20Registrations%3A%20Table%201%20-%20Airtable%202023-05-13%2010-20-48.png?alt=media&#x26;token=c6effdfa-f073-404f-8963-564973ced4b5" alt=""><figcaption><p>Final table headers</p></figcaption></figure>

### Create personal access token, make sure that the scope includes `data.records` read/write and `schema.bases` read/write

<figure><img src="https://1211303336-files.gitbook.io/~/files/v0/b/gitbook-x-prod.appspot.com/o/spaces%2FNP07jPPCyBlsAnUAqYNM%2Fuploads%2FqQwYG2lX8PVrrk0mGsG1%2FAirtable%20Developers%202023-04-16%2009-07-54.png?alt=media&#x26;token=2d8129fc-2637-4ef1-9a56-6d6f4716cfac" alt="Airtable personal access token settings"><figcaption><p>Airtable personal access token settings</p></figcaption></figure>

{% hint style="warning" %}
Make sure the PAT you are creating has access to the base/app you want FieldsRaven to sync with
{% endhint %}

<figure><img src="https://1211303336-files.gitbook.io/~/files/v0/b/gitbook-x-prod.appspot.com/o/spaces%2FNP07jPPCyBlsAnUAqYNM%2Fuploads%2FW8SfICeAKPHBInDvJ6vN%2FAirtable%20Developers%202023-05-13%2010-41-07.png?alt=media&#x26;token=4ed59585-49ec-46d8-8d42-5d0dcb27a1f1" alt=""><figcaption></figcaption></figure>

## Raven setup

<figure><img src="https://1211303336-files.gitbook.io/~/files/v0/b/gitbook-x-prod.appspot.com/o/spaces%2FNP07jPPCyBlsAnUAqYNM%2Fuploads%2Fe3Ao9f9CPbEbRtOXpuJt%2FFieldsRaven%20Stage%20%C2%B7%20FieldsRaven%20%5BSTAGE%5D%20%C2%B7%20Shopify%202023-05-13%2010-22-02.png?alt=media&#x26;token=30a7b544-2490-4536-a905-0c61a11e0ace" alt=""><figcaption><p>Raven: Airtable setup</p></figcaption></figure>

### Grab Airtable app ID and table ID from the url

<figure><img src="https://1211303336-files.gitbook.io/~/files/v0/b/gitbook-x-prod.appspot.com/o/spaces%2FNP07jPPCyBlsAnUAqYNM%2Fuploads%2FZGSRMFXEe4LhHavZuySw%2F%5BStage%5D%20FieldsRaven%20Products%20Registrations%3A%20Table%201%20-%20Airtable%202023-05-13%2009-52-48.png?alt=media&#x26;token=5a62f255-af70-4f89-aefa-0a36b71c3e87" alt=""><figcaption></figcaption></figure>

<figure><img src="https://1211303336-files.gitbook.io/~/files/v0/b/gitbook-x-prod.appspot.com/o/spaces%2FNP07jPPCyBlsAnUAqYNM%2Fuploads%2FKLNPyeRUPCwvwd6PoZFw%2FFieldsRaven%20Stage%20%C2%B7%20FieldsRaven%20%5BSTAGE%5D%20%C2%B7%20Shopify%202023-05-13%2010-45-32.png?alt=media&#x26;token=4d892a71-2e4d-4c16-a75e-e6aa518000d7" alt=""><figcaption></figcaption></figure>

### Airtable table header fields

Add your Airtable header fields into the raven, separate each field by a comma

## Validation

FieldsRaven will validate all Airtable settings before creating the Raven, if any of the settings is invalid, you'll get an error message

<figure><img src="https://1211303336-files.gitbook.io/~/files/v0/b/gitbook-x-prod.appspot.com/o/spaces%2FNP07jPPCyBlsAnUAqYNM%2Fuploads%2FVGw0ibs8yZbSn9yshFqv%2FFieldsRaven%20Stage%20%C2%B7%20FieldsRaven%20%5BSTAGE%5D%20%C2%B7%20Shopify%202023-05-13%2010-26-33.png?alt=media&#x26;token=654bd33e-93c6-42e0-9510-782869a8ec24" alt=""><figcaption></figcaption></figure>

## Airtable automations

Syncing your metafields with Airtable gives you access to all of the automations – depending on your Airtable plan – that Airtable has to offer, it's pretty powerful.

<figure><img src="https://1211303336-files.gitbook.io/~/files/v0/b/gitbook-x-prod.appspot.com/o/spaces%2FNP07jPPCyBlsAnUAqYNM%2Fuploads%2FjzevzXPC82v2NYLaJxE8%2F%5BStage%5D%20FieldsRaven%20Products%20Registrations%3A%20Table%201%20-%20Airtable%202023-05-13%2010-51-43.png?alt=media&#x26;token=bd73065f-2475-42bd-b64f-fde7d1f4c6bc" alt=""><figcaption></figcaption></figure>
