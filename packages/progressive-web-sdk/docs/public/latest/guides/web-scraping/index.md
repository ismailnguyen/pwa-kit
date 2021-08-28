## What is web scraping? 

Web scraping, or HTML parsing, is a technique where you extract data from a well-structured HTML page in order to use it in some novel way. In our case, we want to provide something that looks like a REST API client, but behind the scenes uses a legacy HTML site as its data store.  

For example, you could write a scraper for a Product Listing Page that extracts product data (titles, prices, etc.) from an HTML page and returns that data as a native JavaScript array.  

Web scraping can be tricky, but we’re here to help! In this guide, we’ll walk you through the fundamentals.  

## When to use web scraping  

Before you decide to parse an HTML page, consider whether the page meets these two conditions:  

###  1. The page structure can be traversed programmatically:  

The page markup should be structured so that it can be traversed using plain and simple JavaScript. For example, a typical category list page should be structured in a way that makes it easy to find each individual category.  

###  2. The page content follows a consistent format:

Ecommerce site product pages typically follow a consistent format from one product to another. It’s reasonable to expect every product to contain a title, price, description, and other metadata. It’s possible that there will be some inconsistencies. Some products may contain options that don’t exist for others. For example, clothing may have color options while hardware tools may not. These inconsistencies can be manageable, so long as you can easily identify those differences.  

Pages that typically meet the above criteria include product descriptions and category lists.  

In the context of commerce integrations, consider whether the backend you’re working with has an API available. If your backend does have an API, we encourage you to use it to access the website’s data. Often times, however, you’ll find that there is no API, or that the API does not cover the full desktop functionality. In these cases, you can use a web scraping approach to provide a convenient, equivalent data layer.  

## When to avoid web scraping  

If it’s impossible to programmatically traverse a page’s content, the page should _not_ be parsed.

Consider a page where the page title is only wrapped in a `<span>` tag with no ID or unique class. In addition, notice how there are many other `<span>` tags being used throughout the page:  

```html
<span>Sub-title<span>
<div>
    <!--
      It might be difficult to tell this heading apart from the sidebar below
      -->
    <span>Main Heading</span>
</div>
<p>Main content goes here</p>
<div>
    <span>Sidebar</span>
    <p>Information</p>
</div>
```  

If it’s difficult or impossible to know what is the same and what is different from one page to another, the page should _not_ be parsed.  

Articles or blog-like pages are a common offender. Their structures can vary dramatically, often because the content is created using WYSIWYG editors. For example, a recipe blog post may list its ingredients with a plain list element in one article, while another article may list them in a paragraph with `<br />` tags mixed in. Take a look, in this example:

```html
<!-- Article Blog Post Example #1 -->
<h1>Egg Pancakes</h1>
<p>Ingredients</p>
<ul>
    <li>Eggs</li>
    <li>Flour</li>
    <li>Syrup</li>
</ul>

<!-- Article Blog Post Example #2 -->
<!-- Notice this example formatted completely differently from #1 -->
<h1>Banana Brownies</h1>
<p>Ingredients<br />
    - Bananas<br />
    - Cocoa Powder<br />
    - Eggs<br />
</p>
```

## Writing a web scraping connector  

As a head start, our Commerce Integrations library includes a base class for web scraping connectors. If you decide to use web scraping, you will need to write your own connector that *extends* our `ScrapingConnector` class.  

A `ScrapingConnector` is an ordinary JavaScript class with methods that take plain JavaScript objects as arguments and return plain JavaScript objects, parsed from a web page. (Returning **JavaScript objects instead of DOM elements** makes it possible to use the connector in different contexts-- outside of the browser, especially.) A `ScrapingConnector` should *never* return DOM Nodes or take, for example, browser-native `FormData` as arguments to a method. 

The `ScrapingConnector` class does the following:

1. **Requires injection of the window object** so that you can write a web scraping connector that can be used both inside the browser, *and* on the server side. To use it server side, you can swap the native browser window instance with a JSDom implementation of the browser.
   
2. **Includes the superagent library**, which allows you to make HTTP requests to your backend both in the browser or on the server.  
   
3. **Provides a utility function called `buildDocument`** which safely constructs a DOM document that you can use to extract data from the page. It uses common,  familiar, browser-native selector functions, such as `querySelector`.

###  Extracting data from a page

```javascript

import {ScrapingConnector} from '@mobify/commerce-integrations/dist/connectors/scraping-connector'

class MyConnector extends ScrapingConnector {

    /**
     * An example showing how to make an HTTP GET request to get 
     * and parse data for a Product Detail Page.
     *
     * @param id {Number}
     */
    getProduct(id) {
        const url = `${this.basePath}/products/${id}`
        return this.agent
            .get(url)
            .then((res) => this.buildDocument(res))
            .then((htmlDoc) => {
                return {
                    name: htmlDoc.querySelector('.page-title').textContent,
                    description: htmlDoc.querySelector('.product.description').textContent,
                    //...
                }
            })
    }
}
```

In the example above, we write an implementation that uses `this.agent` and `this.buildDocument` to fetch an HTML response, build a document and then parse data for the product detail page, including the product name, and product description. Note that `this.agent` is referring to the superagent library.

###  Submitting data to a server

```javascript
import {ScrapingConnector} from '@mobify/commerce-integrations/dist/connectors/scraping-connector'

class MyConnector extends ScrapingConnector {

    /**
     * An example showing how to make an HTTP POST request to add an
     * item to a user's cart.
     *
     * @param cart {Object}
     * @param cartItem {Object}
     */
    addCartItem(cart, cartItem) {
        return this.agent
            .post(`${this.basePath}/carts/${cart.id}`)
            .type('form') // The data will be form-encoded
            .send(cartItem)
    }
}
```
In the example above, our implementation uses `this.agent` to make a HTTP POST request, adding an item from a user’s form-encoded data to a user’s cart.  

###  Client-side versus server-side setup

In your app, you need to inject the Window object into your connector to ensure that it can work on both the client and the server. On the server, you'll want to use JSDOM. For client-side use, you can use a browser-native window object. (If server-side rendering is new to you, take a few minutes to learn more about [server-side rendering](../../architecture/#2.-server-side-rendered-pwas).)  

For example:
```javascript
// Server-side example
import jsdom from 'jsdom'

jsdom.JSDOM.fromURL('http://www.example.com')
    .then((dom) => new MyConnector({window: dom.window}))
```
*On the server-side, we use JSDOM to inject the window object into the connector’s constructor.*

```javascript
// Client-side example
const connector = new MyConnector({window: window})
```
*On the client-side, we use a browser-native window object to inject into the connector’s constructor.*

<div id="toc"><p class="u-text-size-smaller u-margin-start u-margin-bottom"><b>IN THIS ARTICLE:</b></p></div>