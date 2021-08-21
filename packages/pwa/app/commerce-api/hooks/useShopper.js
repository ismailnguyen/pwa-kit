/* * *  *  * *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  * *
 * Copyright (c) 2021 Mobify Research & Development Inc. All rights reserved. *
 * * *  *  * *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  * */
import {useEffect} from 'react'
import useBasket from './useBasket'
import useCustomer from './useCustomer'
import useCustomerProductLists from './useCustomerProductLists'
import {customerProductListTypes} from '../../constants'

/**
 * Joins basket and customer hooks into a single hook for initializing their states
 * when the app loads on the client-side. Should only be use at top-level of app.
 * @returns {Object} - customer and basket objects
 */
const useShopper = () => {
    const customer = useCustomer()
    const basket = useBasket()
    const customerProductLists = useCustomerProductLists()

    // Create or restore the user session upon mounting
    useEffect(() => {
        customer.login()
    }, [])

    // Handle basket init/updates in response to customer/basket changes.
    useEffect(() => {
        const hasCustomer = customer?.customerId
        const hasBasket = basket?.loaded

        // We have a customer but no basket, so we fetch a new or existing basket
        if (hasCustomer && !hasBasket) {
            basket.getOrCreateBasket()
            return
        }

        // We have a customer and a basket, but the basket does not belong to this customer
        // so we get their existing basket or create a new one for them
        if (hasCustomer && hasBasket && customer.customerId !== basket.customerInfo.customerId) {
            basket.getOrCreateBasket()
            return
        }

        // We have a registered customer (customer with email), and we have their basket,
        // but the email applied to the basket is missing or doesn't match the customer
        // email. In this case, we update the basket with their email.
        if (
            hasCustomer &&
            hasBasket &&
            customer.email &&
            customer.customerId === basket.customerInfo.customerId &&
            customer.email !== basket.customerInfo.email
        ) {
            basket.updateCustomerInfo({email: customer.email})
            return
        }
    }, [customer, basket.loaded])

    useEffect(() => {
        // Fetch product details for all items in cart
        if (customer.customerId && basket?.basketId) {
            if (basket.itemCount > 0) {
                const allImages = true
                let ids = basket.productItems?.map((item) => item.productId)
                if (basket?._productItemsDetail) {
                    ids = ids.filter((id) => !basket?._productItemsDetail[id])
                }
                console.log(' baseket ids', ids)

                basket.getProductsInBasket(ids.toString(), {allImages})
            }
        }
    }, [customer, basket])

    // Load wishlists in context for logged-in users
    useEffect(() => {
        const hasCustomer = customer?.customerId
        const hasCustomerProductLists = customerProductLists?.loaded
        if (hasCustomer && customer?.authType === 'registered' && !hasCustomerProductLists) {
            // we are only interested in wishlist
            customerProductLists.fetchOrCreateProductLists(customerProductListTypes.WISHLIST)
        } else if (customer?.authType === 'guest' && hasCustomerProductLists) {
            // customerProductLists need to be reset when the user logs out
            customerProductLists.clearProductLists()
        }
    }, [customerProductLists.loaded, customer.authType])

    useEffect(() => {
        // Fetch product details for new items in product-lists
        const hasCustomerProductLists = customerProductLists?.loaded
        if (!hasCustomerProductLists) return

        // find the wishlist in customerProduct list
        // we current only take the first wishlist into the account
        const wishlist = customerProductLists.getProductListPerType(
            customerProductListTypes.WISHLIST
        )
        let ids = wishlist.customerProductListItems?.map((item) => item.productId)
        if (wishlist?._productItemsDetail) {
            ids = ids.filter((id) => !wishlist?._productItemsDetail[id])
        }
        customerProductLists.getProductsInList(ids?.toString(), wishlist.id)
    }, [customerProductLists.data])

    return {customer, basket}
}

export default useShopper
