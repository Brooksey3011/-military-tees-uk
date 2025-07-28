import { render, screen, fireEvent, waitFor } from '@/test/utils'
import { AdvancedAdvancedSearchBar } from '@/components/search/advanced-search-bar'
import { mockProducts, mockFetch } from '@/test/utils'

describe('AdvancedAdvancedSearchBar', () => {
  const mockOnResults = jest.fn()
  
  beforeEach(() => {
    mockFetch({ 
      products: mockProducts.slice(0, 2),
      total: 2,
      suggestions: ['SAS', 'Regiment', 'Military']
    })
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('renders search input correctly', () => {
    render(<AdvancedAdvancedSearchBar onResults={mockOnResults} />)
    
    const searchInput = screen.getByPlaceholderText(/search products/i)
    expect(searchInput).toBeInTheDocument()
    expect(searchInput).toHaveAttribute('type', 'text')
  })

  it('handles search input changes', async () => {
    render(<AdvancedSearchBar onResults={mockOnResults} />)
    
    const searchInput = screen.getByPlaceholderText(/search products/i)
    fireEvent.change(searchInput, { target: { value: 'SAS' } })
    
    expect(searchInput).toHaveValue('SAS')
  })

  it('triggers search after debounce delay', async () => {
    jest.useFakeTimers()
    render(<AdvancedSearchBar onResults={mockOnResults} />)
    
    const searchInput = screen.getByPlaceholderText(/search products/i)
    fireEvent.change(searchInput, { target: { value: 'SAS Regiment' } })
    
    // Fast-forward timers
    jest.advanceTimersByTime(500)
    
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/search'),
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('SAS Regiment')
        })
      )
    })
    
    jest.useRealTimers()
  })

  it('shows loading state during search', async () => {
    render(<AdvancedSearchBar onResults={mockOnResults} />)
    
    const searchInput = screen.getByPlaceholderText(/search products/i)
    fireEvent.change(searchInput, { target: { value: 'SAS' } })
    
    // Search should be triggered
    await waitFor(() => {
      expect(screen.getByLabelText(/searching/i)).toBeInTheDocument()
    })
  })

  it('displays search suggestions', async () => {
    render(<AdvancedSearchBar onResults={mockOnResults} showSuggestions />)
    
    const searchInput = screen.getByPlaceholderText(/search products/i)
    fireEvent.change(searchInput, { target: { value: 'SA' } })
    
    await waitFor(() => {
      expect(screen.getByText('SAS')).toBeInTheDocument()
      expect(screen.getByText('Regiment')).toBeInTheDocument()
      expect(screen.getByText('Military')).toBeInTheDocument()
    })
  })

  it('handles suggestion clicks', async () => {
    render(<AdvancedSearchBar onResults={mockOnResults} showSuggestions />)
    
    const searchInput = screen.getByPlaceholderText(/search products/i)
    fireEvent.change(searchInput, { target: { value: 'SA' } })
    
    await waitFor(() => {
      const suggestion = screen.getByText('SAS')
      fireEvent.click(suggestion)
    })
    
    expect(searchInput).toHaveValue('SAS')
  })

  it('calls onResults with search results', async () => {
    render(<AdvancedSearchBar onResults={mockOnResults} />)
    
    const searchInput = screen.getByPlaceholderText(/search products/i)
    fireEvent.change(searchInput, { target: { value: 'SAS Regiment' } })
    
    await waitFor(() => {
      expect(mockOnResults).toHaveBeenCalledWith({
        products: mockProducts.slice(0, 2),
        total: 2,
        query: 'SAS Regiment'
      })
    })
  })

  it('handles empty search results', async () => {
    mockFetch({ products: [], total: 0, suggestions: [] })
    
    render(<AdvancedSearchBar onResults={mockOnResults} />)
    
    const searchInput = screen.getByPlaceholderText(/search products/i)
    fireEvent.change(searchInput, { target: { value: 'nonexistent' } })
    
    await waitFor(() => {
      expect(mockOnResults).toHaveBeenCalledWith({
        products: [],
        total: 0,
        query: 'nonexistent'
      })
    })
  })

  it('handles search errors gracefully', async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error('Search failed'))
    
    render(<AdvancedSearchBar onResults={mockOnResults} />)
    
    const searchInput = screen.getByPlaceholderText(/search products/i)
    fireEvent.change(searchInput, { target: { value: 'test' } })
    
    await waitFor(() => {
      expect(screen.getByText(/search failed/i)).toBeInTheDocument()
    })
  })

  it('clears search when clear button clicked', async () => {
    render(<AdvancedSearchBar onResults={mockOnResults} />)
    
    const searchInput = screen.getByPlaceholderText(/search products/i)
    fireEvent.change(searchInput, { target: { value: 'SAS Regiment' } })
    
    const clearButton = screen.getByLabelText(/clear search/i)
    fireEvent.click(clearButton)
    
    expect(searchInput).toHaveValue('')
    expect(mockOnResults).toHaveBeenCalledWith({
      products: [],
      total: 0,
      query: ''
    })
  })

  it('handles keyboard navigation in suggestions', async () => {
    render(<AdvancedSearchBar onResults={mockOnResults} showSuggestions />)
    
    const searchInput = screen.getByPlaceholderText(/search products/i)
    fireEvent.change(searchInput, { target: { value: 'SA' } })
    
    await waitFor(() => {
      expect(screen.getByText('SAS')).toBeInTheDocument()
    })
    
    // Arrow down should highlight first suggestion
    fireEvent.keyDown(searchInput, { key: 'ArrowDown' })
    expect(screen.getByText('SAS')).toHaveClass('highlighted')
    
    // Enter should select highlighted suggestion
    fireEvent.keyDown(searchInput, { key: 'Enter' })
    expect(searchInput).toHaveValue('SAS')
  })

  it('closes suggestions when clicking outside', async () => {
    render(<AdvancedSearchBar onResults={mockOnResults} showSuggestions />)
    
    const searchInput = screen.getByPlaceholderText(/search products/i)
    fireEvent.change(searchInput, { target: { value: 'SA' } })
    
    await waitFor(() => {
      expect(screen.getByText('SAS')).toBeInTheDocument()
    })
    
    // Click outside
    fireEvent.click(document.body)
    
    await waitFor(() => {
      expect(screen.queryByText('SAS')).not.toBeInTheDocument()
    })
  })

  it('has proper accessibility attributes', () => {
    render(<AdvancedSearchBar onResults={mockOnResults} />)
    
    const searchInput = screen.getByPlaceholderText(/search products/i)
    expect(searchInput).toHaveAttribute('role', 'searchbox')
    expect(searchInput).toHaveAttribute('aria-label', 'Search products')
    
    const searchButton = screen.getByLabelText(/search/i)
    expect(searchButton).toHaveAttribute('type', 'submit')
  })

  it('prevents search for very short queries', async () => {
    render(<AdvancedSearchBar onResults={mockOnResults} minLength={3} />)
    
    const searchInput = screen.getByPlaceholderText(/search products/i)
    fireEvent.change(searchInput, { target: { value: 'SA' } })
    
    // Should not trigger search for queries shorter than minLength
    await waitFor(() => {
      expect(global.fetch).not.toHaveBeenCalled()
    })
  })
})