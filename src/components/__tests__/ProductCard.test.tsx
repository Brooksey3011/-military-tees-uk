import { render, screen, fireEvent } from '@/test/utils'
import { ProductCard } from '@/components/product/product-card'
import { mockProducts } from '@/test/utils'

const mockProduct = mockProducts[0]

describe('ProductCard', () => {
  it('renders product information correctly', () => {
    render(<ProductCard product={mockProduct} />)
    
    expect(screen.getByText('SAS Regiment Elite Tee')).toBeInTheDocument()
    expect(screen.getByText('£24.99')).toBeInTheDocument()
    expect(screen.getByAltText('SAS Regiment Elite Tee')).toBeInTheDocument()
  })

  it('displays sale price when available', () => {
    const saleProduct = { ...mockProduct, sale_price: 19.99 }
    render(<ProductCard product={saleProduct} />)
    
    expect(screen.getByText('£19.99')).toBeInTheDocument()
    expect(screen.getByText('£24.99')).toHaveClass('line-through')
  })

  it('shows featured badge for featured products', () => {
    render(<ProductCard product={mockProduct} />)
    expect(screen.getByText('Featured')).toBeInTheDocument()
  })

  it('handles quick view button click', () => {
    const onQuickView = jest.fn()
    render(<ProductCard product={mockProduct} onQuickView={onQuickView} />)
    
    fireEvent.click(screen.getByText('Quick View'))
    expect(onQuickView).toHaveBeenCalledWith(mockProduct)
  })

  it('handles add to cart button click', () => {
    render(<ProductCard product={mockProduct} />)
    
    const addToCartButton = screen.getByText('Add to Cart')
    fireEvent.click(addToCartButton)
    
    // Should show success message or cart update
    expect(screen.getByText(/added to cart/i)).toBeInTheDocument()
  })

  it('displays out of stock state correctly', () => {
    const outOfStockProduct = { ...mockProduct, is_active: false }
    render(<ProductCard product={outOfStockProduct} />)
    
    expect(screen.getByText('Out of Stock')).toBeInTheDocument()
    expect(screen.getByText('Add to Cart')).toBeDisabled()
  })

  it('has proper accessibility attributes', () => {
    render(<ProductCard product={mockProduct} />)
    
    const productLink = screen.getByRole('link', { name: /sas regiment elite tee/i })
    expect(productLink).toHaveAttribute('href', `/products/${mockProduct.slug}`)
    
    const addToCartButton = screen.getByRole('button', { name: /add to cart/i })
    expect(addToCartButton).not.toBeDisabled()
  })

  it('handles image loading error gracefully', () => {
    render(<ProductCard product={mockProduct} />)
    
    const image = screen.getByAltText('SAS Regiment Elite Tee')
    fireEvent.error(image)
    
    // Should show placeholder or fallback image
    expect(image).toHaveAttribute('src', expect.stringContaining('placeholder'))
  })
})