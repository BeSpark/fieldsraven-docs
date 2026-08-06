---
description: Build a basic wish list feature in Shopify themes with AlpineJS
---

# Wish List

[Demo](https://monosnap.com/file/0z9rXtaZxEnzGZd0TewclSoOv3ePah)

### Steps

1. Create a Raven to carry the wish list payload
2. Add "Add to wish list" button/link to product pages
3. Create `addToWishlist` JS function and hook it to the button `click` event.
4. Create a page to display the wish list items
5. 🎉

### Code

{% hint style="info" %}
I used Tailwind CSS to style the wish list and AlpineJS to manage the state of the feature and UI updates.
{% endhint %}

![](https://1211303336-files.gitbook.io/~/files/v0/b/gitbook-x-prod.appspot.com/o/spaces%2FNP07jPPCyBlsAnUAqYNM%2Fuploads%2FS3qKHNqsvTphlWLLEg6J%2FAntique%20Drawers%20%E2%80%93%20FieldsRaven%20Demo%202022-03-25%2008-34-26.png?alt=media\&token=3c083448-4745-4e8d-b6fb-ac82d977066a)

```liquid
{% comment %}
Add to wish list button
{% endcomment %}

{% if customer %}
  <script type="text/javascript">
    {% assign wishlist = customer.metafields.fields_raven.wish_list.value %}
    {% if wishlist != blank %}
      window.wishlistObj = {{ wishlist | json }};
    {% else %}
      window.wishlistObj = [];
    {% endif %}
    console.log('window.wishlistObj: ', window.wishlistObj)
  </script>
  <div
    x-data="{
      wishlist: window.wishlistObj,
      done: false,
      inWishlist: false,
      addWishlistItem(value) {
        this.wishlist.push(value);
        let wishlistString = JSON.stringify(wishlistObj);
        const ravenObj = {%- render 'raven-mac-gen', resource_id: customer.id, raven_id: 'TBD' -%};
        const valueObj = { value: wishlistString };
        console.log('🎉 wishlistString', wishlistString)
        const response = Raven.send(ravenObj, valueObj);
        response.then(res => {
          if (res.status === 200) {
            console.log('🎉', res.json)
            this.done = true;
          } else {
            console.error('😞', res)
          }
        })
        {% comment %}
        {% endcomment %}
      }
    }"
  >
    <button
      id="fieldsraven-demo"
      class="tw-flex tw-items-center tw-justify-center tw-bg-white tw-py-2 tw-px-2.5 tw-border tw-border-gray-300 tw-rounded-md tw-shadow-sm tw-text-lg tw-font-medium tw-text-gray-700 hover:tw-bg-gray-50 tw-focus:tw-outline-none tw-focus:tw-ring-2 tw-focus:tw-ring-offset-2 tw-focus:tw-ring-indigo-500"
      x-show="!done && !inWishlist" @click="addWishlistItem({product_handle: '{{product.handle}}', created_at: new Date().toISOString()})">
      <span></span>Add to Wishlist!
    </button>
    <span x-show="done || inWishlist">✅🙌</span>
  </div>
  <div>
  </div>
{% else %}
  <p class="tw-text-gray-500 tw-mt-2">Please <a class="tw-text-indigo-600 tw-whitespace-nowrap hover:tw-text-indigo-500" href="/account/login">log in</a> (or <a class="tw-text-indigo-600 tw-whitespace-nowrap hover:tw-text-indigo-500" href="/account/register">register</a>) to be able to add this item to your wishlist.</p>
{% endif %}
```

![](https://1211303336-files.gitbook.io/~/files/v0/b/gitbook-x-prod.appspot.com/o/spaces%2FNP07jPPCyBlsAnUAqYNM%2Fuploads%2FlmlWGoO8U1XxMIIufnam%2FWish%20list%20%E2%80%93%20FieldsRaven%20Demo%202022-03-25%2008-35-44.png?alt=media\&token=1840532a-218a-45db-a379-e7d698f22996)

```liquid
{% comment %}
Wish list items
{% endcomment %}

<script type="text/javascript">
  window.addToCart = async (item) => {
    let formData = { items: [item] };

    const response = await fetch('/cart/add.js', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });

    const cartJson = await response.json();
    return cartJson;
  }
</script>
<div class="tw-bg-white tw-border-gray-200 tw-shadow-sm tw-rounded-lg tw-border tw-p-4"
  {%- if customer -%}
    {%- assign wishlist = customer.metafields.fields_raven.wish_list.value -%}
  x-data='{
    wishlist: {{ wishlist | json }},
    wishlistRemoveItem(handle) {
      let newWishlist = this.wishlist.filter((item) => item.product_handle !== handle)
      console.log("newWishlist: ", newWishlist);
      const ravenObj = {%- render 'raven-mac-gen-2', resource_id: customer.id, raven_id: 'TDB' -%};
      const valueObj = { value: JSON.stringify(newWishlist) };
      const response = Raven.send(ravenObj, valueObj);
      response.then(res => {
        if (res.status === 200) {
          console.log("🎉", res.json)
          this.wishlist = newWishlist;
        } else {
          console.error("😞", res)
        }
      })
    },
    wishlistAddToCart(id, quantity) {
      addToCart({id: id, quantity: quantity})
        .then(res => location = "/cart")
    },
    isPresent(handle) {
      return this.wishlist.map(i => i.product_handle).includes(handle)
    }
  }'
  x-init="console.log('wishlist: ', wishlist)"
  {%- endif -%}
>
{% if customer %}
  <template x-if="wishlist && wishlist.length > 0">
    <ul role="list" class="tw-divide-y tw-divide-gray-200">
    {% for item in wishlist %}
      {% render 'include-wishlist-item', item: item %}
    {% endfor %}
    </ul>
  </template>
  <template x-if="!wishlist || wishlist.length < 1">
    {% render 'include-empty-wishlist' %}
  </template>
{% else %}
  <p>Please <a class="tw-text-indigo-600 tw-whitespace-nowrap hover:tw-text-indigo-500" href="/account/login">log in</a> to view your wish list, or <a class="tw-text-indigo-600 tw-whitespace-nowrap hover:tw-text-indigo-500" href="/account/register">register</a> to start adding items to a wish list.</p>
{% endif %}
</div>
```

![](https://1211303336-files.gitbook.io/~/files/v0/b/gitbook-x-prod.appspot.com/o/spaces%2FNP07jPPCyBlsAnUAqYNM%2Fuploads%2FPt32kH1UiJdULIym0sbP%2FWish%20list%20%E2%80%93%20FieldsRaven%20Demo%202022-03-25%2008-36-07.png?alt=media\&token=8727d811-b8ed-4b7a-82be-9ea9afb28994)

```liquid
{% comment %}
include-empty-wishlist.liquid
{% endcomment %}

<div class="tw-text-center">
  <svg xmlns="http://www.w3.org/2000/svg" class="tw-mx-auto tw-h-12 tw-w-12 tw-text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
    <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
  </svg>
  <h3 class="tw-mt-2 tw-text-xl tw-font-medium tw-text-gray-900">Wish List is empty</h3>
  <p class="tw-mt-1 tw-text-xl tw-text-gray-500">Get started by adding a new item.</p>
  <div class="tw-mt-6">
    <a href="/collections/all" class="tw-inline-flex tw-items-center tw-px-4 tw-py-2 tw-border tw-border-transparent tw-shadow-sm tw-text-xl tw-font-medium tw-rounded-md tw-text-white tw-bg-indigo-600 hover:tw-bg-indigo-700 focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-offset-2 focus:tw-ring-indigo-500">
      <svg class="tw--ml-1 tw-mr-2 tw-h-5 tw-w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
        <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
      </svg>
      New Item
    </a>
  </div>
</div>
```

```liquid
{% comment %}
include-wishlist-item.liquid
{% endcomment %}

{% assign prod_obj = all_products[item.product_handle] %}
<li class="tw-p-4 sm:tw-p-6" x-show="isPresent('{{ item.product_handle }}')">
  <div class="tw-flex tw-items-center sm:tw-items-start">
    <div class="tw-flex-shrink-0 tw-w-20 tw-h-20 tw-bg-gray-200 tw-rounded-lg tw-overflow-hidden sm:tw-w-40 sm:tw-h-40">
      <img src="{{ prod_obj.featured_image | img_url: '200x' }}" alt="{{ prod_obj.featured_image.alt }}" class="tw-w-full tw-h-full tw-object-center tw-object-cover">
    </div>
    <div class="tw-flex-1 tw-ml-6">
      <div class="tw-font-medium tw-text-gray-900 sm:tw-flex sm:tw-justify-between">
        <h5 class="tw-text-3xl">{{ prod_obj.title }}</h5>
        <p class="tw-mt-2 sm:tw-mt-0">{{ prod_obj.price | money_with_currency }}</p>
      </div>
      <div class="tw-text-gray-500 tw-text-xl tw-mt-2">{{ prod_obj.description }}</div>
    </div>
  </div>

  <div class="tw-mt-6 sm:tw-flex sm:tw-justify-between">
    <div class="tw-flex tw-items-center">
      <svg class="tw-w-5 tw-h-5 tw-text-green-500" x-description="Heroicon name: solid/check-circle" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
      </svg>
      <p class="tw-ml-2 tw-text-lg tw-font-medium tw-text-gray-500">Added on <time datetime="{{ item.created_at | date: "%Y-%m-%d" }}">{{ item.created_at | date: "%b %d, %y" }}</time></p>
    </div>

    <div class="tw-mt-6 tw-border-t tw-border-gray-200 tw-pt-4 tw-flex tw-items-center tw-space-x-4 tw-divide-x tw-divide-gray-200 tw-text-sm tw-font-medium sm:tw-mt-0 sm:tw-ml-4 sm:tw-border-none sm:tw-pt-0">
      <div class="tw-flex-1 tw-flex tw-justify-center">
        <a href="#" @click.prevent="wishlistRemoveItem('{{ item.product_handle }}')"
          class="tw-text-red-600 tw-whitespace-nowrap hover:tw-text-red-500 tw-text-xl"
        >Remove</a>
      </div>
      <div class="tw-flex-1 tw-pl-4 tw-flex tw-justify-center">
        <a href="#"
          class="tw-text-indigo-600 tw-whitespace-nowrap hover:tw-text-indigo-500 tw-text-xl"
          @click.prevent="wishlistAddToCart({{ prod_obj.selected_or_first_available_variant.id }}, 1)"
        >Add to cart</a>
      </div>
    </div>
  </div>
</li>
```
