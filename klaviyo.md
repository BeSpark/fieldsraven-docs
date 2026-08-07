# Klaviyo

## To sync Shopify metafields with Klaviyo you need to create a "Private API Key" in Klaviyo

<div><figure><img src="https://1211303336-files.gitbook.io/~/files/v0/b/gitbook-x-prod.appspot.com/o/spaces%2FNP07jPPCyBlsAnUAqYNM%2Fuploads%2FD1xfvnXdGtkRWUOfHKbc%2FKlaviyo%202024-03-01%2010-19-57.png?alt=media&#x26;token=af3b8ab0-4f41-4181-a4c0-00a73a112d6c" alt=""><figcaption></figcaption></figure> <figure><img src="https://1211303336-files.gitbook.io/~/files/v0/b/gitbook-x-prod.appspot.com/o/spaces%2FNP07jPPCyBlsAnUAqYNM%2Fuploads%2FUWpQkjUMIE3Ovnmxd5Ap%2FKlaviyo%202024-03-01%2010-21-39.png?alt=media&#x26;token=3301d45c-414e-4e40-bd0b-50174ebcd389" alt=""><figcaption></figcaption></figure> <figure><img src="https://1211303336-files.gitbook.io/~/files/v0/b/gitbook-x-prod.appspot.com/o/spaces%2FNP07jPPCyBlsAnUAqYNM%2Fuploads%2FpO5kJNEfEb3CAtEb5umc%2FKlaviyo%202024-03-01%2010-22-33.png?alt=media&#x26;token=766bdf3b-ac76-4894-9023-e305ed2ccc14" alt=""><figcaption></figcaption></figure></div>

## Setup Klaviyo sync in FieldsRaven

{% hint style="warning" %}
Klaviyo sync only works with the customer resource
{% endhint %}

### Save the Klaviyo credential

1. Open **Settings** in FieldsRaven.
2. Under **Integration credentials**, enter the Klaviyo private API key.
3. Select **Update integration credentials**.

FieldsRaven never displays a stored integration credential. Leave the field blank
on a later visit to preserve the current key; enter a nonblank value only when you
want to replace it.

{% hint style="warning" %}
An older Raven that already stores its own Klaviyo key continues to use that key.
The legacy Raven credential overrides the credential in Settings, and replacing the
Settings credential does not rotate the legacy value.
{% endhint %}

### Enable Klaviyo on a Raven

When creating a customer Raven, toggle **Sync with Klaviyo**. Leave the Raven's API
key field blank to use the shop credential from Settings.

Demo -> [https://monosnap.com/file/DB1bRi7qixXvlVdVws37f4grQdJo1J](https://monosnap.com/file/DB1bRi7qixXvlVdVws37f4grQdJo1J)

<figure><img src="https://1211303336-files.gitbook.io/~/files/v0/b/gitbook-x-prod.appspot.com/o/spaces%2FNP07jPPCyBlsAnUAqYNM%2Fuploads%2FdoAy4vcQ6xg6p680VsNu%2FFieldsRaven%20Demo%20%C2%B7%20FieldsRaven%20%C2%B7%20Shopify%202024-09-24%2008-54-48.png?alt=media&#x26;token=015c18b7-61a7-4b45-809d-3837f6555b0c" alt=""><figcaption></figcaption></figure>

{% hint style="info" %}
It takes about 10 seconds after the Shopify metafiled is created/updated for the KlaviyoSync job to kick in
{% endhint %}

## Sync Shopify metafield into Klaviyo customer profile

When you sync a metafield into Klaviyo's customer profiles, property name in Klaviyo will be the metafield's key in Shopify. For example if you're syncing this metafield `customer.metafields.social_media_profiles.facebook` then property name in Klaviyo will be `facebook`&#x20;

<figure><img src="https://1211303336-files.gitbook.io/~/files/v0/b/gitbook-x-prod.appspot.com/o/spaces%2FNP07jPPCyBlsAnUAqYNM%2Fuploads%2Fd8wkiibB9e8ACVgc9uHC%2FKarim%20Tarek%20%7C%20Klaviyo%202023-04-15%2008-37-39.png?alt=media&#x26;token=52f8e045-e074-4df4-b453-bed2db09fea3" alt="Klaviyo customer property name screenshot"><figcaption><p>Klaviyo customer property name example</p></figcaption></figure>

## Sync Shopify JSON metafield into Klaviyo customer profile

When you sync a JSON type metafield, each property of the JSON object gets converted into a customer property in Klaviyo, this object:

```json
{
  "facebook": "Share on Facebook",
  "twitter": "Tweet on Twitter",
  "pinterest": "Pin on Pinterest",
  "timestamp": `${Date.now()}`
}
```

Or this:

```json
{
  "Serial Number": "000123456789",
  "Country of Residence": "Canada",
  "Where did you purchase your meter?": "Amazon"
}
```

Becomes as follows in Klaviyo:

<figure><img src="https://1211303336-files.gitbook.io/~/files/v0/b/gitbook-x-prod.appspot.com/o/spaces%2FNP07jPPCyBlsAnUAqYNM%2Fuploads%2FL4O0FhWZwDMfcNUdBNMk%2FKarim%20Tarek%20%7C%20Klaviyo%202023-04-15%2008-43-34.png?alt=media&#x26;token=a19105b5-9482-478a-9fcd-06bd4fdd3113" alt="Sync Shopify JSON metafield into Klaviyo customer profile"><figcaption><p>Sync Shopify JSON metafield into Klaviyo customer profile</p></figcaption></figure>

<figure><img src="https://1211303336-files.gitbook.io/~/files/v0/b/gitbook-x-prod.appspot.com/o/spaces%2FNP07jPPCyBlsAnUAqYNM%2Fuploads%2FolspvS7tBj76Y0HUmwpK%2FKarim%20Tarek%20%7C%20Klaviyo%202023-04-15%2009-01-15.png?alt=media&#x26;token=7ce321fe-5164-4d42-abd6-226e139cf8fb" alt=""><figcaption></figcaption></figure>

### Nested JSON metafield

TBC

```json
{
  "name": "Ram",
  "age": 27,
  "vehicles": {
    "car": "limousine",
    "bike": "ktm-duke",
    "plane": "lufthansa"
  }
}
```

<figure><img src="https://1211303336-files.gitbook.io/~/files/v0/b/gitbook-x-prod.appspot.com/o/spaces%2FNP07jPPCyBlsAnUAqYNM%2Fuploads%2FYStxqHOr4nW2JQ8wXXyz%2FKarim%20Tarek%20%7C%20Klaviyo%202023-04-15%2009-35-47.png?alt=media&#x26;token=0bbbad1f-294d-459b-93fd-034469c47689" alt="Syncing nested JSON metafield with Klaviyo"><figcaption><p>Syncing nested JSON metafield with Klaviyo</p></figcaption></figure>

```json
{
  "name": "Ram",
  "age": 27,
  "vehicles": ["limousine", "ktm-duke", "lufthansa"]
}
```

<figure><img src="https://1211303336-files.gitbook.io/~/files/v0/b/gitbook-x-prod.appspot.com/o/spaces%2FNP07jPPCyBlsAnUAqYNM%2Fuploads%2FJ5B2Neu9kc8PSj1iUla0%2FKarim%20Tarek%20%7C%20Klaviyo%202023-04-15%2009-48-57.png?alt=media&#x26;token=834c2703-4336-4e29-a071-e6286ce31bb5" alt="Syncing nested JSON with nested array with Klaviyo"><figcaption><p>Syncing nested JSON with nested array with Klaviyo</p></figcaption></figure>

### Array of JSON metafields

```json
[
  {
    "name": "Martha",
    "age": 37,
    "other": {
      "Favorite color": "Blue",
      "Vehicle": "2009 SSC Aero",
      "GUID": "890d954a-4a57-4659-b10d-e16427358b99"
    }
  },
  {
    "name": "Bonnie",
    "age": 29,
    "other": {
      "Favorite color": "Orange",
      "Vehicle": "1998 Daewoo Prince",
      "GUID": "b902c384-2e1c-44de-a8d3-59b92a2afddd"
    }
  },
  {
    "name": "Bridgette",
    "age": 41,
    "other": {
      "Favorite color": "Purple",
      "Vehicle": "1997 Suzuki Cappuccino",
      "GUID": "aad8ceb9-566e-4b9f-a64a-23af8671eb96"
    }
  }
]
```

<figure><img src="https://1211303336-files.gitbook.io/~/files/v0/b/gitbook-x-prod.appspot.com/o/spaces%2FNP07jPPCyBlsAnUAqYNM%2Fuploads%2FGXYCVzkWiGvRX1YgySA2%2FKarim%20Tarek%20%7C%20Klaviyo%202023-04-15%2010-27-06.png?alt=media&#x26;token=ece9d6b4-7f61-490a-8b5a-6b9286c90b8f" alt="Syncing an array of objects with Klaviyo"><figcaption><p>Syncing an array of objects with Klaviyo</p></figcaption></figure>
