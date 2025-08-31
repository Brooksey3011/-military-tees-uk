// Military Tees UK - Custom Checkout JavaScript
// Production-ready Stripe checkout system

class MilitaryCheckout {
    constructor() {
        this.stripe = null;
        this.elements = null;
        this.paymentElement = null;
        this.expressCheckoutElement = null;
        this.clientSecret = null;
        this.currentStep = 1;
        this.cart = this.loadCart();
        this.subtotal = 0;
        this.shipping = 4.99; // Default standard shipping
        this.tax = 0;
        this.discount = 0;
        this.appliedPromo = null;
        this.total = 0;
        
        // Initialize when DOM is loaded
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.init());
        } else {
            this.init();
        }
    }
    
    async init() {
        try {
            console.log('Initializing Military Tees UK Checkout...');
            
            // Initialize Stripe
            await this.initializeStripe();
            
            // Load cart data and update UI
            this.updateOrderSummary();
            
            // Setup form event listeners
            this.setupEventListeners();
            
            // Note: Express checkout removed - using Stripe Checkout which includes express payment methods
            
            console.log('Checkout initialized successfully');
            
        } catch (error) {
            console.error('Checkout initialization error:', error);
            this.showError('Failed to initialize checkout. Please refresh and try again.');
        }
    }
    
    async initializeStripe() {
        try {
            // Get publishable key from environment or API
            const publishableKey = await this.getStripePublishableKey();
            
            if (!publishableKey || !publishableKey.startsWith('pk_')) {
                throw new Error('Invalid Stripe publishable key format');
            }
            
            // Initialize Stripe
            if (typeof Stripe === 'undefined') {
                throw new Error('Stripe.js library not loaded. Please ensure the Stripe script tag is included.');
            }
            
            this.stripe = Stripe(publishableKey);
            
            // Wait for Stripe to be fully initialized
            await new Promise(resolve => {
                if (this.stripe) {
                    resolve();
                } else {
                    setTimeout(resolve, 100);
                }
            });
            
            console.log('Stripe initialized successfully');
            
        } catch (error) {
            console.error('Stripe initialization error:', error);
            throw error;
        }
    }
    
    async getStripePublishableKey() {
        try {
            // Try to get from environment variable or API endpoint
            const response = await fetch('/api/config/stripe');
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            const data = await response.json();
            
            if (!data.publishableKey) {
                throw new Error('No publishable key in response');
            }
            
            return data.publishableKey;
        } catch (error) {
            console.error('Error getting Stripe key:', error);
            
            // Try to get from window/environment as fallback
            if (typeof window !== 'undefined' && window.STRIPE_PUBLISHABLE_KEY) {
                return window.STRIPE_PUBLISHABLE_KEY;
            }
            
            // Final fallback - this needs to be replaced with your actual key
            throw new Error('Stripe publishable key not found. Please configure NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY in your environment.');
        }
    }
    
    loadCart() {
        try {
            // Load cart from localStorage using the same key as the main site
            const stored = localStorage.getItem('military-tees-cart');
            if (stored) {
                const cartData = JSON.parse(stored);
                
                // Handle both cart data formats (with or without state wrapper)
                if (cartData.state && cartData.state.items) {
                    return cartData.state.items;
                } else if (Array.isArray(cartData)) {
                    return cartData;
                } else if (cartData.items && Array.isArray(cartData.items)) {
                    return cartData.items;
                }
            }
            
            // If no cart data found, return empty array
            console.log('No cart data found - cart is empty');
            return [];
        } catch (error) {
            console.error('Error loading cart:', error);
            return [];
        }
    }
    
    calculateTotals() {
        // Calculate subtotal
        this.subtotal = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        
        // Calculate shipping (free over £50, otherwise £4.99)
        this.shipping = this.subtotal >= 50 ? 0 : 4.99;
        
        // No discount calculation here - handled by backend API
        this.discount = 0;
        
        // Calculate tax (20% VAT on subtotal + shipping)
        const taxableAmount = this.subtotal + this.shipping;
        this.tax = taxableAmount * 0.2;
        
        // Calculate total
        this.total = this.subtotal + this.shipping + this.tax;
        
        // Ensure minimum total
        this.total = Math.max(this.total, 0.50); // Minimum 50p
    }
    
    updateOrderSummary() {
        this.calculateTotals();
        
        // Update cart items display
        const itemsContainer = document.getElementById('order-items');
        if (itemsContainer) {
            itemsContainer.innerHTML = this.cart.map(item => `
                <div class=\"order-item\">
                    <div class=\"item-image\">
                        ${item.image ? `<img src=\"${item.image}\" alt=\"${item.name}\" style=\"width: 100%; height: 100%; object-fit: cover;\">` : 'IMG'}
                        <div class=\"item-quantity\">${item.quantity}</div>
                    </div>
                    <div class=\"item-details\">
                        <div class=\"item-name\">${item.name}</div>
                        <div class=\"item-variant\">${item.size}${item.color ? ` • ${item.color}` : ''}</div>
                    </div>
                    <div class=\"item-price\">£${(item.price * item.quantity).toFixed(2)}</div>
                </div>
            `).join('');
        }
        
        // Update summary breakdown
        document.getElementById('subtotal').textContent = `£${this.subtotal.toFixed(2)}`;
        document.getElementById('shipping-cost').textContent = this.shipping === 0 ? 'FREE' : `£${this.shipping.toFixed(2)}`;
        document.getElementById('tax-amount').textContent = `£${this.tax.toFixed(2)}`;
        document.getElementById('total-amount').textContent = `£${this.total.toFixed(2)}`;
        document.getElementById('mobile-total').textContent = `£${this.total.toFixed(2)}`;
        
        // Update discount line
        const discountLine = document.getElementById('discount-line');
        if (this.discount > 0 && this.appliedPromo) {
            discountLine.style.display = 'flex';
            document.getElementById('discount-amount').textContent = `-£${this.discount.toFixed(2)}`;
            document.getElementById('applied-promo').textContent = this.appliedPromo.code;
        } else {
            discountLine.style.display = 'none';
        }
    }
    
    setupEventListeners() {
        // Form submission
        const form = document.getElementById('checkout-form');
        if (form) {
            form.addEventListener('submit', (e) => this.handleFormSubmit(e));
        }
        
        // Shipping method changes
        document.querySelectorAll('input[name=\"shipping\"]').forEach(radio => {
            radio.addEventListener('change', (e) => this.handleShippingChange(e));
        });
        
        // Form validation on input
        this.setupFormValidation();
    }
    
    setupFormValidation() {
        const fields = ['email', 'firstName', 'lastName', 'address1', 'city', 'postcode', 'country'];
        
        fields.forEach(fieldName => {
            const field = document.getElementById(fieldName);
            if (field) {
                field.addEventListener('blur', () => this.validateField(fieldName));
                field.addEventListener('input', () => this.clearFieldError(fieldName));
            }
        });
    }
    
    validateField(fieldName) {
        const field = document.getElementById(fieldName);
        const errorElement = document.getElementById(`${fieldName}-error`);
        
        if (!field || !errorElement) return true;
        
        let isValid = true;
        let errorMessage = '';
        
        // Check if required field is empty
        if (field.hasAttribute('required') && !field.value.trim()) {
            isValid = false;
            errorMessage = 'This field is required';
        } else if (fieldName === 'email' && field.value) {
            // Email validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(field.value)) {
                isValid = false;
                errorMessage = 'Please enter a valid email address';
            }
        } else if (fieldName === 'postcode' && field.value) {
            // UK postcode validation
            const postcodeRegex = /^[A-Z]{1,2}[0-9]{1,2}[A-Z]?\\s?[0-9][A-Z]{2}$/i;
            if (!postcodeRegex.test(field.value.replace(/\\s+/g, ''))) {
                isValid = false;
                errorMessage = 'Please enter a valid UK postcode';
            }
        }
        
        // Update UI
        field.classList.toggle('error', !isValid);
        errorElement.textContent = errorMessage;
        
        return isValid;
    }
    
    clearFieldError(fieldName) {
        const field = document.getElementById(fieldName);
        const errorElement = document.getElementById(`${fieldName}-error`);
        
        if (field && errorElement) {
            field.classList.remove('error');
            errorElement.textContent = '';
        }
    }
    
    validateStep(step) {
        let isValid = true;
        
        switch (step) {
            case 1:
                // Contact information
                isValid = this.validateField('email') && isValid;
                break;
                
            case 2:
                // Shipping information
                const shippingFields = ['firstName', 'lastName', 'address1', 'city', 'postcode', 'country'];
                shippingFields.forEach(field => {
                    isValid = this.validateField(field) && isValid;
                });
                break;
                
            case 3:
                // Payment validation handled by Stripe
                break;
        }
        
        return isValid;
    }
    
    async setupExpressCheckout() {
        try {
            // Create payment intent first
            await this.createPaymentIntent();
            
            if (!this.clientSecret) {
                console.warn('No client secret available for express checkout');
                return;
            }
            
            // Setup express checkout element
            const expressCheckoutElement = this.elements.create('expressCheckout', {
                clientSecret: this.clientSecret,
                paymentMethodCreation: 'manual',
            });
            
            // Handle express checkout events
            expressCheckoutElement.on('click', (event) => {
                console.log('Express checkout clicked:', event.expressPaymentType);
            });
            
            expressCheckoutElement.on('confirm', async (event) => {
                console.log('Express checkout confirm:', event);
                await this.handleExpressCheckout(event);
            });
            
            expressCheckoutElement.on('cancel', () => {
                console.log('Express checkout cancelled');
            });
            
            // Mount the element
            expressCheckoutElement.mount('#express-checkout-element');
            this.expressCheckoutElement = expressCheckoutElement;
            
        } catch (error) {
            console.error('Express checkout setup error:', error);
            // Hide express checkout section if setup fails
            const section = document.querySelector('.express-checkout-section');
            if (section) {
                section.style.display = 'none';
            }
        }
    }
    
    async createCheckoutSession() {
        try {
            const shippingAddress = this.getShippingAddress();
            const billingAddress = this.getBillingAddress(); // We'll add this method
            const email = document.getElementById('email')?.value;
            
            if (!email) {
                throw new Error('Email address is required');
            }
            
            // Format items for the real API (uses variantId instead of id)
            const formattedItems = this.cart.map(item => ({
                variantId: item.variantId || item.id, // Use variantId if available, fallback to id
                quantity: item.quantity,
                price: item.price
            }));
            
            // Prepare headers
            const headers = {
                'Content-Type': 'application/json'
            };
            
            // Add authentication if user is logged in (check if supabase is available)
            if (typeof window !== 'undefined' && window.supabase) {
                try {
                    const { data: { session } } = await window.supabase.auth.getSession();
                    if (session?.access_token) {
                        headers['Authorization'] = `Bearer ${session.access_token}`;
                    }
                } catch (error) {
                    console.log('No authentication available, proceeding as guest');
                }
            }
            
            const orderData = {
                items: formattedItems,
                shippingAddress: {
                    firstName: shippingAddress.firstName,
                    lastName: shippingAddress.lastName,
                    email: email,
                    phone: shippingAddress.phone || '07000000000', // Provide default if empty
                    address1: shippingAddress.address1,
                    address2: shippingAddress.address2 || null,
                    city: shippingAddress.city,
                    postcode: shippingAddress.postcode,
                    country: shippingAddress.country
                },
                billingAddress: {
                    firstName: billingAddress.firstName || shippingAddress.firstName,
                    lastName: billingAddress.lastName || shippingAddress.lastName,
                    address1: billingAddress.address1 || shippingAddress.address1,
                    address2: billingAddress.address2 || shippingAddress.address2 || null,
                    city: billingAddress.city || shippingAddress.city,
                    postcode: billingAddress.postcode || shippingAddress.postcode,
                    country: billingAddress.country || shippingAddress.country
                },
                customerNotes: this.getCustomerNotes() || null
            };
            
            console.log('Creating checkout session with real API:', orderData);
            
            const response = await fetch('/api/checkout', {
                method: 'POST',
                headers,
                body: JSON.stringify(orderData)
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || `Checkout failed: ${response.status}`);
            }
            
            // Store checkout session info
            this.checkoutSession = {
                sessionId: data.sessionId,
                url: data.url,
                orderNumber: data.orderNumber
            };
            
            console.log('Checkout session created:', data.orderNumber);
            return data;
            
        } catch (error) {
            console.error('Error creating checkout session:', error);
            throw error;
        }
    }
    
    async setupPaymentElement() {
        try {
            console.log('Setting up payment element...');
            
            // Ensure Stripe and elements are initialized
            if (!this.stripe) {
                await this.initializeStripe();
            }
            
            // Initialize Elements if not already done
            if (!this.elements) {
                this.elements = this.stripe.elements({
                    appearance: {
                        theme: 'stripe',
                        variables: {
                            colorPrimary: '#4a5d23',
                            colorBackground: '#ffffff',
                            colorText: '#1a1a1a',
                            colorDanger: '#dc3545',
                            fontFamily: 'Inter, system-ui, sans-serif',
                            spacingUnit: '4px',
                            borderRadius: '0px',
                        },
                        rules: {
                            '.Input': {
                                border: '2px solid #e1e5e9',
                                padding: '12px',
                            },
                            '.Input:focus': {
                                border: '2px solid #4a5d23',
                                boxShadow: '0 0 0 3px rgba(74, 93, 35, 0.1)',
                            },
                            '.Label': {
                                fontWeight: '600',
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px',
                                fontSize: '0.9rem',
                                marginBottom: '0.5rem',
                            }
                        }
                    }
                });
            }
            
            // Create payment intent if not exists
            if (!this.clientSecret) {
                await this.createPaymentIntent();
            }
            
            // Create payment element
            this.paymentElement = this.elements.create('payment', {
                clientSecret: this.clientSecret,
                layout: {
                    type: 'tabs',
                    defaultCollapsed: false,
                }
            });
            
            // Handle payment element events
            this.paymentElement.on('change', (event) => {
                const errorElement = document.getElementById('payment-errors');
                if (event.error) {
                    errorElement.textContent = event.error.message;
                } else {
                    errorElement.textContent = '';
                }
            });
            
            // Mount payment element
            await this.paymentElement.mount('#payment-element');
            console.log('Payment element mounted successfully');
            
        } catch (error) {
            console.error('Error setting up payment element:', error);
            this.showError('Failed to load payment form. Please refresh and try again.');
        }
    }
    
    getShippingAddress() {
        return {
            firstName: document.getElementById('firstName')?.value || '',
            lastName: document.getElementById('lastName')?.value || '',
            address1: document.getElementById('address1')?.value || '',
            address2: document.getElementById('address2')?.value || '',
            city: document.getElementById('city')?.value || '',
            postcode: document.getElementById('postcode')?.value || '',
            country: document.getElementById('country')?.value || 'United Kingdom',
            phone: document.getElementById('phone')?.value || ''
        };
    }
    
    getBillingAddress() {
        // For now, use same as shipping address
        // In a full implementation, you'd have separate billing address fields
        return this.getShippingAddress();
    }
    
    getCustomerNotes() {
        return document.getElementById('customerNotes')?.value || '';
    }
    
    getSelectedShipping() {
        const selected = document.querySelector('input[name=\"shipping\"]:checked');
        return selected ? selected.value : 'standard';
    }
    
    getEstimatedDelivery() {
        const deliveryDays = {
            'standard': 5,
            'express': 1,
            'premium': 2
        };
        
        const selectedMethod = this.getSelectedShipping();
        const days = deliveryDays[selectedMethod] || 5;
        const deliveryDate = new Date();
        deliveryDate.setDate(deliveryDate.getDate() + days);
        
        return deliveryDate.toLocaleDateString('en-GB');
    }
    
    handleShippingChange(event) {
        // Note: Shipping calculation is handled by the backend API
        // This is just for display purposes - final calculation done server-side
        console.log('Shipping method changed to:', event.target.value);
        
        // Update display only - real calculation will be done by API
        this.updateOrderSummary();
    }
    
    async updatePaymentIntent() {
        try {
            const response = await fetch('/api/update-payment-intent', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    paymentIntentId: this.clientSecret.split('_secret_')[0],
                    amount: Math.round(this.total * 100),
                    deliveryOption: this.getSelectedShipping(),
                    promoCode: this.appliedPromo?.code
                })
            });
            
            if (!response.ok) {
                console.warn('Failed to update payment intent');
            }
            
        } catch (error) {
            console.error('Error updating payment intent:', error);
        }
    }
    
    async handleExpressCheckout(event) {
        try {
            this.showLoading(true);
            
            const {error} = await this.stripe.confirmPayment({
                elements: this.elements,
                clientSecret: this.clientSecret,
                confirmParams: {
                    return_url: `${window.location.origin}/checkout/success`,
                    payment_method_data: {
                        billing_details: {
                            email: event.billingDetails?.email || document.getElementById('email')?.value
                        }
                    }
                },
                redirect: 'if_required'
            });
            
            if (error) {
                console.error('Express checkout error:', error);
                this.showError(error.message);
            } else {
                console.log('Express checkout successful');
                // Handle success - redirect or show success message
                window.location.href = '/checkout/success';
            }
            
        } catch (error) {
            console.error('Express checkout error:', error);
            this.showError('Payment failed. Please try again.');
        } finally {
            this.showLoading(false);
        }
    }
    
    async handleFormSubmit(event) {
        event.preventDefault();
        
        try {
            // Validate current step
            if (!this.validateStep(3)) {
                return;
            }
            
            this.showLoading(true);
            
            // Create checkout session using the real API
            const checkoutData = await this.createCheckoutSession();
            
            // Store order information for potential success page use
            const orderData = {
                orderNumber: checkoutData.orderNumber,
                orderDate: new Date().toLocaleDateString('en-GB'),
                customerEmail: document.getElementById('email').value,
                deliveryMethod: this.getSelectedShipping(),
                items: this.cart,
                subtotal: this.subtotal.toFixed(2),
                shipping: this.shipping.toFixed(2),
                tax: this.tax.toFixed(2),
                discount: this.discount.toFixed(2),
                total: this.total.toFixed(2),
                appliedPromo: this.appliedPromo,
                shippingAddress: this.getShippingAddress(),
                estimatedDelivery: this.getEstimatedDelivery()
            };
            
            // Store for potential success page use
            localStorage.setItem('orderConfirmation', JSON.stringify(orderData));
            
            console.log('Redirecting to Stripe Checkout:', checkoutData.url);
            
            // Redirect to Stripe Checkout
            window.location.href = checkoutData.url;
            
        } catch (error) {
            console.error('Checkout submission error:', error);
            this.showError(error.message || 'Checkout failed. Please try again.');
        } finally {
            this.showLoading(false);
        }
    }
    
    // Promo codes are handled by the Stripe Checkout page
    // This method is kept for compatibility but does nothing
    async applyPromoCode() {
        console.log('Promo codes are handled on the Stripe Checkout page');
    }
    
    showError(message) {
        // Show error in payment errors element
        const errorElement = document.getElementById('payment-errors');
        if (errorElement) {
            errorElement.textContent = message;
        }
        
        // You could also show a toast or modal here
        console.error('Checkout error:', message);
    }
    
    showLoading(show) {
        const overlay = document.getElementById('loading-overlay');
        const submitBtn = document.getElementById('submit-payment');
        
        if (overlay) {
            overlay.style.display = show ? 'flex' : 'none';
        }
        
        if (submitBtn) {
            submitBtn.classList.toggle('loading', show);
            submitBtn.disabled = show;
        }
    }
    
    clearCart() {
        this.cart = [];
        // Clear using the same key as the main site
        localStorage.removeItem('military-tees-cart');
        
        // Also trigger a storage event to notify other parts of the site
        window.dispatchEvent(new StorageEvent('storage', {
            key: 'military-tees-cart',
            oldValue: null,
            newValue: null,
            storageArea: localStorage
        }));
    }
}

// Global functions for HTML onclick handlers
function goToStep(step) {
    window.militaryCheckout?.goToStep(step);
}

function toggleSummary() {
    const content = document.getElementById('summary-content');
    const toggle = document.querySelector('.toggle-summary .toggle-icon');
    
    if (content && toggle) {
        const isExpanded = content.classList.contains('expanded');
        content.classList.toggle('expanded', !isExpanded);
        toggle.textContent = isExpanded ? '▼' : '▲';
    }
}

function togglePromoCode() {
    const container = document.getElementById('promo-input');
    const toggle = document.querySelector('.promo-toggle');
    
    if (container && toggle) {
        const isActive = container.classList.contains('active');
        container.classList.toggle('active', !isActive);
        toggle.classList.toggle('active', !isActive);
    }
}

function applyPromoCode() {
    window.militaryCheckout?.applyPromoCode();
}

// Step navigation methods
MilitaryCheckout.prototype.goToStep = function(step) {
    // Validate current step before proceeding
    if (step > this.currentStep && !this.validateStep(this.currentStep)) {
        return;
    }
    
    // Hide all steps
    document.querySelectorAll('.form-step').forEach(el => {
        el.classList.remove('active');
    });
    
    // Show target step
    const targetStep = document.getElementById(`step-${step}`);
    if (targetStep) {
        targetStep.classList.add('active');
    }
    
    // Update progress indicator
    document.querySelectorAll('.progress-indicator .step').forEach((el, index) => {
        const stepNumber = index + 1;
        el.classList.toggle('active', stepNumber === step);
        el.classList.toggle('completed', stepNumber < step);
    });
    
    // No payment element needed - using Stripe Checkout redirect
    
    this.currentStep = step;
    
    // Scroll to top of form
    document.querySelector('.checkout-main').scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start' 
    });
};

// Initialize checkout when page loads
window.militaryCheckout = new MilitaryCheckout();