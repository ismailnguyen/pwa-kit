/* * *  *  * *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  * *
 * Copyright (c) 2021 Mobify Research & Development Inc. All rights reserved. *
 * * *  *  * *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  * */
import React from 'react'
import PropTypes from 'prop-types'
import {AspectRatio, Box, Badge, Image} from '@chakra-ui/react'
import {useCartItemVariant} from '.'
import {FormattedMessage} from 'react-intl'
import {filterImageGroups} from '../../utils/image-groups-utils'

/**
 * In the context of a cart product item variant, this component renders the item's
 * main image.
 *
 * @todo = This component will render a `SALE` badge when the qualifier is available
 * on the custom property `c_isSale`. This will need to be expanded upon to handle
 * different badge/qualifiers and property names.
 */
const ItemImage = ({imageProps, ratio = 1, ...props}) => {
    const variant = useCartItemVariant()

    // We find the 'small' images in the variant's image groups based on variationValues and pick the first one
    const image = filterImageGroups(variant?.imageGroups, {
        size: 'small',
        selectedVariationAttributes: variant?.variationValues
    })?.images?.[0]

    return (
        <Box width="84px" backgroundColor="gray.100" {...props}>
            <AspectRatio ratio={ratio}>
                <Box position="relative">
                    {variant.c_isSale && (
                        <Badge
                            position="absolute"
                            top={0}
                            left={0}
                            marginLeft={2}
                            marginTop={2}
                            fontSize="10px"
                            variant="solid"
                            colorScheme="blue"
                        >
                            <FormattedMessage defaultMessage="Sale" />
                        </Badge>
                    )}

                    {image && (
                        <Image
                            alt={image.alt}
                            src={image.disBaseLink}
                            ignoreFallback={true}
                            {...imageProps}
                        />
                    )}
                </Box>
            </AspectRatio>
        </Box>
    )
}

ItemImage.propTypes = {
    imageProps: PropTypes.object,
    ratio: PropTypes.number
}

export default ItemImage