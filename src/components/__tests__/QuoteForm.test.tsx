import { render, screen, fireEvent, waitFor } from '@/test/utils'
import { QuoteForm } from '@/components/custom/quote-form'
import { mockFetch } from '@/test/utils'

describe('QuoteForm', () => {
  beforeEach(() => {
    mockFetch({ success: true, message: 'Quote submitted successfully' })
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('renders all form fields correctly', () => {
    render(<QuoteForm />)
    
    expect(screen.getByLabelText(/name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/order type/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/quantity/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument()
    expect(screen.getByText(/drag.*drop.*images/i)).toBeInTheDocument()
  })

  it('validates required fields', async () => {
    render(<QuoteForm />)
    
    const submitButton = screen.getByText('Submit Quote Request')
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText(/name is required/i)).toBeInTheDocument()
      expect(screen.getByText(/email is required/i)).toBeInTheDocument()
      expect(screen.getByText(/description is required/i)).toBeInTheDocument()
    })
  })

  it('validates email format', async () => {
    render(<QuoteForm />)
    
    const emailInput = screen.getByLabelText(/email/i)
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } })
    fireEvent.blur(emailInput)
    
    await waitFor(() => {
      expect(screen.getByText(/invalid email format/i)).toBeInTheDocument()
    })
  })

  it('validates quantity range', async () => {
    render(<QuoteForm />)
    
    const quantityInput = screen.getByLabelText(/quantity/i)
    fireEvent.change(quantityInput, { target: { value: '0' } })
    fireEvent.blur(quantityInput)
    
    await waitFor(() => {
      expect(screen.getByText(/quantity must be at least 1/i)).toBeInTheDocument()
    })
  })

  it('handles file upload correctly', async () => {
    render(<QuoteForm />)
    
    const file = new File(['test image'], 'test.jpg', { type: 'image/jpeg' })
    const fileInput = screen.getByLabelText(/upload design images/i)
    
    fireEvent.change(fileInput, { target: { files: [file] } })
    
    await waitFor(() => {
      expect(screen.getByText('test.jpg')).toBeInTheDocument()
    })
  })

  it('validates file types', async () => {
    render(<QuoteForm />)
    
    const invalidFile = new File(['test'], 'test.txt', { type: 'text/plain' })
    const fileInput = screen.getByLabelText(/upload design images/i)
    
    fireEvent.change(fileInput, { target: { files: [invalidFile] } })
    
    await waitFor(() => {
      expect(screen.getByText(/only image files are allowed/i)).toBeInTheDocument()
    })
  })

  it('limits file size', async () => {
    render(<QuoteForm />)
    
    // Mock a large file (>10MB)
    const largeFile = new File(['x'.repeat(11 * 1024 * 1024)], 'large.jpg', { 
      type: 'image/jpeg' 
    })
    const fileInput = screen.getByLabelText(/upload design images/i)
    
    fireEvent.change(fileInput, { target: { files: [largeFile] } })
    
    await waitFor(() => {
      expect(screen.getByText(/file size must be less than 10mb/i)).toBeInTheDocument()
    })
  })

  it('limits number of files to 5', async () => {
    render(<QuoteForm />)
    
    const files = Array.from({ length: 6 }, (_, i) => 
      new File(['test'], `test${i}.jpg`, { type: 'image/jpeg' })
    )
    const fileInput = screen.getByLabelText(/upload design images/i)
    
    fireEvent.change(fileInput, { target: { files } })
    
    await waitFor(() => {
      expect(screen.getByText(/maximum 5 images allowed/i)).toBeInTheDocument()
    })
  })

  it('handles successful form submission', async () => {
    render(<QuoteForm />)
    
    // Fill out form
    fireEvent.change(screen.getByLabelText(/name/i), { 
      target: { value: 'John Doe' } 
    })
    fireEvent.change(screen.getByLabelText(/email/i), { 
      target: { value: 'john@example.com' } 
    })
    fireEvent.change(screen.getByLabelText(/order type/i), { 
      target: { value: 'Custom T-Shirt' } 
    })
    fireEvent.change(screen.getByLabelText(/quantity/i), { 
      target: { value: '10' } 
    })
    fireEvent.change(screen.getByLabelText(/description/i), { 
      target: { value: 'Custom military design with unit badge' } 
    })
    
    const submitButton = screen.getByText('Submit Quote Request')
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText(/quote submitted successfully/i)).toBeInTheDocument()
    })
  })

  it('handles form submission errors', async () => {
    mockFetch({ success: false, error: 'Server error occurred' })
    
    render(<QuoteForm />)
    
    // Fill out form with valid data
    fireEvent.change(screen.getByLabelText(/name/i), { 
      target: { value: 'John Doe' } 
    })
    fireEvent.change(screen.getByLabelText(/email/i), { 
      target: { value: 'john@example.com' } 
    })
    fireEvent.change(screen.getByLabelText(/description/i), { 
      target: { value: 'Test description' } 
    })
    
    const submitButton = screen.getByText('Submit Quote Request')
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText(/server error occurred/i)).toBeInTheDocument()
    })
  })

  it('shows loading state during submission', async () => {
    render(<QuoteForm />)
    
    // Fill out form
    fireEvent.change(screen.getByLabelText(/name/i), { 
      target: { value: 'John Doe' } 
    })
    fireEvent.change(screen.getByLabelText(/email/i), { 
      target: { value: 'john@example.com' } 
    })
    fireEvent.change(screen.getByLabelText(/description/i), { 
      target: { value: 'Test description' } 
    })
    
    const submitButton = screen.getByText('Submit Quote Request')
    fireEvent.click(submitButton)
    
    expect(screen.getByText(/submitting/i)).toBeInTheDocument()
    expect(submitButton).toBeDisabled()
  })

  it('allows removing uploaded files', async () => {
    render(<QuoteForm />)
    
    const file = new File(['test image'], 'test.jpg', { type: 'image/jpeg' })
    const fileInput = screen.getByLabelText(/upload design images/i)
    
    fireEvent.change(fileInput, { target: { files: [file] } })
    
    await waitFor(() => {
      expect(screen.getByText('test.jpg')).toBeInTheDocument()
    })
    
    const removeButton = screen.getByLabelText(/remove.*test\.jpg/i)
    fireEvent.click(removeButton)
    
    await waitFor(() => {
      expect(screen.queryByText('test.jpg')).not.toBeInTheDocument()
    })
  })

  it('resets form after successful submission', async () => {
    render(<QuoteForm />)
    
    // Fill out and submit form
    fireEvent.change(screen.getByLabelText(/name/i), { 
      target: { value: 'John Doe' } 
    })
    fireEvent.change(screen.getByLabelText(/email/i), { 
      target: { value: 'john@example.com' } 
    })
    fireEvent.change(screen.getByLabelText(/description/i), { 
      target: { value: 'Test description' } 
    })
    
    const submitButton = screen.getByText('Submit Quote Request')
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText(/quote submitted successfully/i)).toBeInTheDocument()
    })
    
    // Form should be reset
    expect(screen.getByLabelText(/name/i)).toHaveValue('')
    expect(screen.getByLabelText(/email/i)).toHaveValue('')
    expect(screen.getByLabelText(/description/i)).toHaveValue('')
  })
})