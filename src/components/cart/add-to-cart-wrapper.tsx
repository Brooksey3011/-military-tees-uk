"use client"

import { AddToCartButton } from "./add-to-cart-button"

// Wrapper to handle different prop formats
interface AddToCartWrapperProps {
  // Option 1: Direct props (new format)
  productId?: string
  variantId?: string
  name?: string
  price?: number
  image?: string
  size?: string
  color?: string
  maxQuantity?: number
  
  // Option 2: Product and variant objects (old format)
  product?: any
  variant?: any
  
  // Common props
  quantity?: number
  buttonSize?: "sm" | "default" | "lg"
  className?: string
  disabled?: boolean
  showIcon?: boolean
  onSuccess?: () => void
}

export function AddToCartWrapper(props: AddToCartWrapperProps) {
  // If product and variant objects are provided, extract the props
  if (props.product && props.variant) {
    const { product, variant, ...otherProps } = props
    
    console.log('AddToCartWrapper - Product page props:', {
      product: product,
      variant: variant,
      extractedProps: {
        productId: product.id,
        variantId: variant.id,
        name: product.name,
        price: product.price + (variant.price_modifier || 0),
        image: variant.imageUrls?.[0] || product.mainImageUrl || product.main_image_url || product.image,
        size: variant.size,
        color: variant.color,
        maxQuantity: variant.stockQuantity || variant.stock_quantity || 10
      }
    })
    
    return (
      <AddToCartButton
        productId={product.id}
        variantId={variant.id}
        name={product.name}
        price={product.price + (variant.price_modifier || 0)}
        image={variant.imageUrls?.[0] || product.mainImageUrl || product.main_image_url || product.image}
        size={variant.size}
        color={variant.color}
        maxQuantity={variant.stockQuantity || variant.stock_quantity || 10}
        {...otherProps}
      />
    )
  }
  
  // Otherwise, use direct props
  const {
    productId = "",
    variantId = "",
    name = "",
    price = 0,
    image = "",
    maxQuantity = 10,
    ...otherProps
  } = props
  
  return (
    <AddToCartButton
      productId={productId}
      variantId={variantId}
      name={name}
      price={price}
      image={image}
      maxQuantity={maxQuantity}
      {...otherProps}
    />
  )
}

// Export as AddToCartButton for backward compatibility
export { AddToCartWrapper as AddToCartButton }