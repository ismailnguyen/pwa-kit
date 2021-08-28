<div class="c-callout c--important">
  <p>
    <strong>Important:</strong> Projects generated <em>after</em> 2019 do not use the Integration Manager because it has been replaced with our <a href="../../integrations/commerce-integrations/">Commerce Integrations</a> technology.
  </p>

  <p>
     For anyone working on projects that were generated <em>before</em> 2019, we've left the Integration Manager documentation here in case you still need to refer to it.
  </p>
</div>

Mobify provides an Salesforce Commerce Cloud (SFCC) **cartridge** and **connector** that simplifies integration:

* The **cartridge** installs the Mobify Tag and Mobify Serivce worker.
* The **connector** uses the Open Commerce API (OCAPI) to communicate with SFCC.

## Before you begin 

Before following these instructions you should:

* Complete the [Quick Start](../../getting-started/quick-start/) guide.
* Read the [Integration Manager Overview](../ecommerce-overview/).
* Have admin access to a working SFCC site.

## Integration

To complete integration with SFCC you must:

1. Install the cartridge
2. Create an OCAPI client
3. Update OCAPI settings
4. Set up the connector in your project

### Install the cartridge

_The cartridge adds the [Mobify Tag](../../getting-started/installing-the-mobify-tag/) and [Mobify Service Worker](../../getting-started/installing-the-service-worker/) to your SFCC site._

Download the cartridge from the [LINK Marketplace](http://www.demandware.com/link-marketplace/mobify). Follow the installation instructions included with it.

> You must login with your SFCC account to view and download the cartridge!

Once you've installed it, verify the [Mobify Tag](../../getting-started/installing-the-mobify-tag/) and [service worker](../../getting-started/installing-the-service-worker/) are present on your site.

### Create an OCAPI client 

_The client allows the connector to communicate with SFCC using OCAPI._

[Create a new OCAPI client](https://documentation.demandware.com/DOC1/topic/com.demandware.dochelp/AccountManager/AccountManagerAddAPIClientID.html). _Note its client ID. It is need to configure OCAPI settings and the connector._

### Update OCAPI settings

<!-- TODO: Move OCAPI settings to the `platform-scaffold` repo to better track changes. -->

_Settings control which OCAPI resources can be used by the connector._

1. Login to the SFCC Business Manager.
2. Select _Administration > Site Development > Open Commerce API Settings_.
3. Select _Shop_ and the relevant Site ID. _Record the Site ID. It is needed to set up the connector!_
4. Open the [settings](mobify-ocapi-settings.json) in an editor. Update the `client_id`.
4. Copy the contents of your settings into the field and _Save_.

> If you are using extensions with the connector, you may need additional settings.

### Set up the connector

_Configuring the connector tells it how to talk to your SFCC site._

In the Web SDK, the connector is configured and registered with Integration Manager in `web/app/init-sfcc-connector.js`.
Update it with your `siteID` and `clientID` from earlier.

Open `web/app/main.jsx` and remove the other connectors. Import the one we set up:

```diff
- import initConnector from './init-merlins-connector'
- import initConnector from './init-stub-connector'
+ import initConnector from './init-sfcc-connector'

initConnector()
```

**You're done! Great job! 🙌**

Your PWA should now be integrated with SFCC.

## Verifying it worked

_To verify, load the PWA and confirm it gets data from SFCC_.

1. Start the development server by running `npm start` in the `web` folder.
1. Open a web browser and activate mobile emulation.
2. Copy Preview URL from your console and open it in your web browser.
3. Ensure the Site URL is set to your SFCC site's homepage over HTTPS.
3. Hit Preview!

If everything worked correctly, you should see the PWA load your site:

<!--
To create this screenshot:

* Create a new project: https://docs.mobify.com/progressive-web/latest/getting-started/quick-start/
* Configure the SFCC connector.
* Use SFCC Merlin's for the Site URL: https://mobify-tech-prtnr-na03-dw.demandware.net/on/demandware.store/Sites-2017refresh-Site/default/Home-Show
-->
<img src="./successful-sfcc-integration.png" style="max-width: 375px">

### Troubleshooting

**`npm start` doesn't work!**
* Check your JavaScript for syntax errors.
* Check your are running the command from inside the `web` folder of your project.
* Check that your packages are up to date by running `npm install` from the root of your project.

**After previewing, the PWA doesn't load!**
* [Check for HTTPS errors](../../getting-started/quick-start/#avoiding-https-errors-in-local-development).
* Verify the Mobify Tag is present on the page
* Open DevTools and confirm requests to SFCC are succeeding.

-----------

<!-- @JB Note: The rest of document should be a seperate article. -->

## Authentication/JWT 

We use JSON Web Tokens (JWT) for authentication with Salesforce Commerce Cloud.
The details of how JWT authentication works in SFCC are documented in the
[Salesforce documentation](https://documentation.b2c.commercecloud.salesforce.com/DOC1/topic/com.demandware.dochelp/OCAPI/19.3/usage/JWT.html?resultof=%22%6a%77%74%22%20).

The Connector for SFCC automatically manages requesting a JWT token when a
sessions starts and then submits and renews the token as needed.

_Authentication using JWT does not work correctly in Safari for sites that require [Basic HTTP authentication](https://developer.mozilla.org/en-US/docs/Web/HTTP/Authentication). Safari uses the Basic authentication header instead of the JSON Web Token, which causes requests to the API to fail. To fix this issue, disable basic HTTP authentication for the site._

## Utility Functions 

There are a number of utility functions that you may find useful if you need to
[extend](../extending-a-connector) the Connector for SFCC. They simplify
interacting with SFCC OC APIs by taking care of things like authentication
tokens (JWT) and cart management automatically.

_If you are extending the Connector for SFCC we strongly recommend
using these functions instead of implementing similar functionality from
scratch._

The functions are organized into a set of broad categories below.

### Authentication 

#### `getAuthToken(): string`

Retrieves the [auth token](#authentication-jwt) from browser storage.

_You almost never need to use this function directly because the
[Request Functions](#functions-request) manage the authorization token
automatically._

#### `storeAuthToken(authToken: string)`

Stores the [auth token](#authentication-jwt) to browser storage. This function
stores the auth token using the best available method (currently it tries
session storage first and falls back to using a cookie).

_You almost never need to use this function directly because the
[Request Functions](#functions-request) manage the authorization token
automatically._

#### `deleteAuthToken()`

Deletes the [auth token](#authentication-jwt) from browser storage.

_You almost never need to use this function directly because the
[Request Functions](#functions-request) manage the authorization token
automatically._

#### `getAuthTokenPayload(authToken: string): object`

Returns an object built using the given serialized [auth
token](#authentication-jwt). The SFCC documentation provided in the
[Authentication/JWT](#authentication-jwt) section details the various pieces of
data that the auth token contains.

#### `getCustomerData()`

Returns the customer data portion of the currently-stored authorization token.
SFCC packs some extra customer data into the authorization token (such as a
Customer ID) and this function returns that data unchanged.

*SFCC documentation does not specify what this object contains in all scenarios.
The best way to discover what it contains is to call this function after setting
up a session and authenticating and then execute
`console.log(getCustomerData())` and inspect it in the Javascript console.*

#### `isUserLoggedIn(authorization) -> boolean`

Returns `true` if the given `authToken` represents a logged in user, `false`
otherwise.

#### `initSfccSession(authToken: string): Promise<Array<string>>`

Initializes an SFCC session using the provided `authToken`. This function
returns a Promise that resolves to an array of headers to use in subsequent API
requests (session headers).

#### `initSfccAuthAndSession()`

Initializes an SFCC session and authorization token (re-using an existing
authorization token if a valid one was previously created). This function will
also refresh a saved authorization token if it has expired.

### Requests 

#### `makeApiRequest(path: string, options: object): Promise<object>`

Executes an API request to the specified `path` and returns `Promise` that
resolves with the server's results. The resolved object is the `Response` object
returned by the `fetch` API and is documented
[here](https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/fetch).

*Note that this method only takes a `path` instead of a full URL because the
connector manages building the full URL based on the configured **Site ID**.*

#### `makeApiJsonRequest(path: string, body: object, options: object): Promise<object>`

Makes a request to the SFCC API and serializing the `body` as JSON and
deserializing the result from JSON. This function delegates to `makeApiRequest`
and then deserializes the response as JSON.

#### `checkForResponseFault(responseJSON: string): string`

Checks the given response JSON object and throws if it contains a `fault`
(error). If the response does not contain a fault, the response is returned
unchanged. This is useful for using this method in a Promise chain without any
extra work when the response is not a fault.

For example:

```javascript
// Returns a Promise that resolves with current cart data, or throws if an error occurs
return makeApiJsonRequest('/cart', {}, {method: 'GET'})
    .then(checkForResponseFault)
    .then((cart) => {
        // update cart in the UI
    })
```

#### `makeUnAuthenticatedApiRequest(path: string, options: object): Promise<object>`

Exactly the same as `makeApiRequest` but explicitly _doesn't_ set any
authorization headers. This is useful if you need to make an API call outside of
the current session/user.

### Basket/Cart Management 

#### `deleteBasketID()`

Deletes the currently-saved basket ID from browser storage.

#### `getBasketID(): string`

Retrieves the currently-saved basket ID from browser storage

#### `storeBaskedID(basketID: string)`

Stores the given basket ID to browser storage

#### `createBasket(basketContents: object)`

Creates a new basket on the SFCC server with the given contents. This function
will take care of using an existing Basket ID, if one has been previously
created and saved, or create a new one, if needed.

#### `createNewBasket() => (dispatch)`

[Thunk Action] Deletes and creates a new basket carrying over existing cart
contents to the newly created basket.

#### `fetchCartItemImages() => (dispatch)`

[Thunk Action] Fetches product images for items that are in the cart and don't
already have them.

#### `requestCartData(noRetry: boolean): Promise<object>`

Fetches cart data from SFCC for the current cart. When `noRetry` is set to
`false` the process will retry if the server returns an `HTTP 404 Not Found`
error.

#### `handleCartData(basket: object): Promise`

Processes the provided cart data and dispatches it to the Redux store. This will
also dispatch `fetchCartItemImages` at the end to ensure that all items in the
cart have an associated image. The returned Promise resolves when all work is
completed. The resolved value is undefined.

#### `isCartExpired(basket: object): boolean`

Checks if the given cart contents contains a fault that signals an expired cart.
Returns `true` if the given cart (basket) is expired, `false` otherwise.

#### `updateExpiredCart(basket: object)`

Check if the users cart has expired, if it has create a new one and throw an
error otherwise return the cart object

----------

## Terminology 

* OCAPI - the **O**pen **C**ommerce **API** provides access to most SFCC
  resources through a
  [REST](https://en.wikipedia.org/wiki/Representational_state_transfer) API. The
  OCAPI is divided into different APIs:
    * Shop API - allows a client to interact with the system as a shop customer
      or as an agent shopping on behalf of a customer.
    * Data API - gives create/read/update/delete access to system resources.
* JWT - JSON Web Token - an authentication mechanism required by several Shop
  API resources. You can find out more about the SFCC usage of JWT
  [above](#authentication-jwt) and at the [JWT homepage](https://jwt.io/).
* Basket/Cart - Typically known as "cart" in the e-commerce industry, most of
  the SFCC documentation and OCAPI refer to the cart as "Basket". The terms are
  interchangable in this document. Typically when you see "basket" it is due to
  influence from the SFCC OCAPI.

<div id="toc"><p class="u-text-size-smaller u-margin-start u-margin-bottom"><b>IN THIS ARTICLE:</b></p></div>