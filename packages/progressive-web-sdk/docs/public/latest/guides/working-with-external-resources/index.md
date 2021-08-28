## loadScripts <a name="load-scripts" href="#load-scripts">#</a>

The Progressive Web SDK provides a utility method for selecting script elements from the page document you request via AJAX, and injecting them into the Progressive Web application.

To use the utility, first import the `loadScripts` utility into your project:

```javascript
import loadScripts from 'progressive-web-sdk/dist/load-scripts'
```

The following is an example of using loadScripts within a Redux action inside your application (`e.g. inside /app/containers/app/actions.js`). Invoke the utility inside the `.then` chain or callback for your page document request, as it needs access to the $response object.

```javascript
import {jqueryResponse} from 'progressive-web-sdk/dist/jquery-response'
import loadScripts from 'progressive-web-sdk/dist/load-scripts'

// Example Redux action for requesting page documents
export const fetchPage = (url) => {
    return (dispatch) => {
        fetch(url)
            .then(jqueryResponse)
            .then((response) => {
                const [$, $response] = response
                dispatch(onPageReceived($, $response))
                loadScripts
                    /**
                     * This needs to be run before using `inject` but only needs
                     * to be invoked once in the application
                     *
                     * @param {object} the current selector library
                     * @param {boolean} debug mode, logs execution in the console
                     * @returns {promise} for use in chaining with `.inject`
                     */
                    .init($, true)
                    /**
                     * @param {string} url - the url that the jQuery response is from
                     * @param {object} $response - jQuery response object from jQueryResponse
                     * @param {object} config - configuration used to find and process scripts
                     *   @key {array} contains - inline scripts
                     *   @key {array} src - external scripts
                     *   @key {bool} evalInGlobalScope - evaluate inline scripts within the global scope
                     */
                    .inject(url, $response, {
                        contains: [
                            'UA-11111111',
                            'var require',
                        ],
                        src: [
                            'requirejs/require.js',
                            /mixins\.js/
                        ],
                        evalInGlobalScope: true
                    })
            })
    }
}
```

The example above searches for scripts using two different search methods:
1. using the `src` attribute of external scripts
2. using the text contents of inline scripts

Using these two methods, the loadScripts utility would find any inline scripts that match text substrings for `UA-11111111` and `var require`, as well as any external scripts with a `src` attribute that contains a text substring matching `requirejs/require.js` or the regular expression `mixins\.js/`. These are automatically added and executed in the same order they were found in the page document.

### Options <a name="options" href="#options">#</a>

#### evalInGlobalScope <a name="eval-in-global-scope" href="#eval-in-global-scope">#</a>

Matched inline scripts are not added to the DOM, they are executed using `eval()`. By default, these inline scripts will not execute in the global scope. However, you may find that you need a script to run in the global scope. For example, you may have an inline script that looks like this:

```js
<script>
    var dataLayer = {
        productId: 123
    }
</script>
```

If this script executes within the global scope, `dataLayer` will be added to `window`. If it does not execute in the global scope, `window` will not be changed. If you need access to `dataLayer`, you can use the `evalInGlobalScope` option. This option defaults to false.

### Notes <a name="notes" href="#notes">#</a>
- Matched scripts are not available from within the React/Redux application as a string value or DOM node
- The utility will prevent re-adding scripts for a given URL, but you will need to provide more restrictive handling if needed (e.g. only running once for a given page type)