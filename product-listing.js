class ProductListing {
    constructor() {
        this.init();
        this.setupEventListeners();
        this.setupLazyLoading();
        this.setupTouchFeedback();
    }

    init() {
        this.productContainer = document.getElementById('product-container');
        this.toggleBtns = document.querySelectorAll('.toggle-btn');
        this.addToCartBtns = document.querySelectorAll('.add-to-cart-btn');
        this.loadMoreBtn = document.querySelector('.load-more-btn');
        this.sortSelect = document.getElementById('sort-select');
        this.resultsCount = document.getElementById('results-count');
        this.viewStatus = document.getElementById('view-status');
        
        this.currentView = 'list';
        this.isLoading = false;
        
        console.log('ProductListing initialized');
        console.log('Toggle buttons found:', this.toggleBtns.length);
        console.log('Product container:', this.productContainer);
        
        this.setupInitialState();
    }

    setupInitialState() {
        this.updateViewClass();
        this.updateViewStatus();
    }

    setupEventListeners() {
        console.log('Setting up event listeners...');
        
        this.toggleBtns.forEach((btn, index) => {
            console.log(`Adding listener to button ${index}:`, btn.dataset.view);
            btn.addEventListener('click', (e) => {
                console.log('Toggle clicked:', e.currentTarget.dataset.view);
                this.handleViewToggle(e);
            });
            btn.addEventListener('keydown', this.handleToggleKeydown.bind(this));
        });

        this.addToCartBtns.forEach(btn => {
            btn.addEventListener('click', this.handleAddToCart.bind(this));
        });

        if (this.loadMoreBtn) {
            this.loadMoreBtn.addEventListener('click', this.handleLoadMore.bind(this));
        }

        if (this.sortSelect) {
            this.sortSelect.addEventListener('change', this.handleSortChange.bind(this));
        }

        document.querySelectorAll('.product-card').forEach(card => {
            card.addEventListener('click', this.handleProductClick.bind(this));
            card.addEventListener('keydown', this.handleProductKeydown.bind(this));
        });

        window.addEventListener('resize', this.debounce(this.handleResize.bind(this), 250));
    }

    handleViewToggle(event) {
        const btn = event.currentTarget;
        const view = btn.dataset.view;
        
        console.log(`Attempting to switch to ${view} view from ${this.currentView} view`);
        
        if (view === this.currentView) {
            console.log('Same view selected, ignoring');
            return;
        }
        
        this.setActiveToggle(btn);
        this.currentView = view;
        this.updateViewClass();
        this.updateViewStatus();
        this.announceViewChange(view);
        this.addFadeInAnimation();
        
        console.log(`Successfully switched to ${view} view`);
        this.logEvent('view_toggle', { view: view });
    }

    handleToggleKeydown(event) {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            this.handleViewToggle(event);
        }
    }

    setActiveToggle(activeBtn) {
        this.toggleBtns.forEach(btn => {
            btn.classList.remove('active');
            btn.setAttribute('aria-selected', 'false');
        });
        
        activeBtn.classList.add('active');
        activeBtn.setAttribute('aria-selected', 'true');
    }

    updateViewClass() {
        this.productContainer.className = `product-container ${this.currentView}-view`;
        console.log('Updated container class:', this.productContainer.className);
    }

    updateViewStatus() {
        if (this.viewStatus) {
            this.viewStatus.textContent = `Currently viewing: ${this.currentView === 'list' ? 'List' : 'Grid'} View`;
            console.log('Updated view status:', this.viewStatus.textContent);
        }
    }

    announceViewChange(view) {
        const announcement = document.createElement('div');
        announcement.className = 'sr-only';
        announcement.setAttribute('aria-live', 'polite');
        announcement.textContent = `Switched to ${view} view`;
        document.body.appendChild(announcement);
        
        setTimeout(() => {
            document.body.removeChild(announcement);
        }, 1000);
    }

    addFadeInAnimation() {
        this.productContainer.classList.add('fade-in');
        setTimeout(() => {
            this.productContainer.classList.remove('fade-in');
        }, 300);
    }

    handleAddToCart(event) {
        event.stopPropagation();
        const btn = event.currentTarget;
        const productCard = btn.closest('.product-card');
        const productTitle = productCard.querySelector('.product-title').textContent;
        
        this.addRippleEffect(btn, event);
        this.showAddToCartFeedback(btn);
        
        this.logEvent('add_to_cart', { product: productTitle });
        
        console.log(`Added "${productTitle}" to cart`);
    }

    showAddToCartFeedback(btn) {
        const originalText = btn.innerHTML;
        const originalColor = btn.style.backgroundColor;
        
        btn.innerHTML = '<i class="fas fa-check" aria-hidden="true"></i> Added!';
        btn.style.backgroundColor = '#28a745';
        btn.disabled = true;
        
        setTimeout(() => {
            btn.innerHTML = originalText;
            btn.style.backgroundColor = originalColor;
            btn.disabled = false;
        }, 2000);
    }

    handleProductClick(event) {
        if (event.target.closest('.add-to-cart-btn')) return;
        
        const productCard = event.currentTarget;
        const productTitle = productCard.querySelector('.product-title').textContent;
        
        this.addRippleEffect(productCard, event);
        this.logEvent('product_click', { product: productTitle });
        
        console.log(`Navigating to product: ${productTitle}`);
    }

    handleProductKeydown(event) {
        if (event.key === 'Enter' || event.key === ' ') {
            if (!event.target.closest('.add-to-cart-btn')) {
                event.preventDefault();
                this.handleProductClick(event);
            }
        }
    }

    handleLoadMore() {
        if (this.isLoading) return;
        
        this.isLoading = true;
        this.loadMoreBtn.textContent = 'Loading...';
        this.loadMoreBtn.disabled = true;
        
        this.simulateLoadMore().then(() => {
            this.loadMoreBtn.textContent = 'Load More Products';
            this.loadMoreBtn.disabled = false;
            this.isLoading = false;
        });
    }

    async simulateLoadMore() {
        await this.delay(1500);
        
        const currentCount = document.querySelectorAll('.product-card').length;
        this.updateResultsCount(currentCount + 6);
        
        this.logEvent('load_more', { total_products: currentCount + 6 });
    }

    handleSortChange(event) {
        const sortValue = event.target.value;
        this.logEvent('sort_change', { sort_by: sortValue });
        
        console.log(`Sorting by: ${sortValue}`);
    }

    handleResize() {
        this.logEvent('viewport_change', { 
            width: window.innerWidth, 
            height: window.innerHeight 
        });
    }

    setupLazyLoading() {
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        if (img.dataset.src) {
                            img.src = img.dataset.src;
                            img.removeAttribute('data-src');
                        }
                        img.classList.remove('lazy');
                        imageObserver.unobserve(img);
                    }
                });
            }, {
                rootMargin: '50px 0px'
            });

            document.querySelectorAll('img[data-src]').forEach(img => {
                img.classList.add('lazy');
                imageObserver.observe(img);
            });
        }
    }

    setupTouchFeedback() {
        const touchElements = document.querySelectorAll('.product-card, .toggle-btn, .add-to-cart-btn');
        
        touchElements.forEach(element => {
            element.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: true });
            element.addEventListener('touchend', this.handleTouchEnd.bind(this), { passive: true });
        });
    }

    handleTouchStart(event) {
        event.currentTarget.classList.add('touching');
    }

    handleTouchEnd(event) {
        setTimeout(() => {
            event.currentTarget.classList.remove('touching');
        }, 150);
    }

    addRippleEffect(element, event) {
        const ripple = document.createElement('span');
        const rect = element.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = event.clientX - rect.left - size / 2;
        const y = event.clientY - rect.top - size / 2;
        
        ripple.style.cssText = `
            position: absolute;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.6);
            transform: scale(0);
            animation: ripple 0.6s linear;
            left: ${x}px;
            top: ${y}px;
            width: ${size}px;
            height: ${size}px;
            pointer-events: none;
        `;
        
        element.style.position = 'relative';
        element.style.overflow = 'hidden';
        element.appendChild(ripple);
        
        setTimeout(() => {
            if (ripple.parentNode) {
                ripple.parentNode.removeChild(ripple);
            }
        }, 600);
    }

    updateResultsCount(count) {
        if (this.resultsCount) {
            this.resultsCount.textContent = `${count} Products`;
        }
    }

    logEvent(eventName, data = {}) {
        if (typeof gtag === 'function') {
            gtag('event', eventName, data);
        }
        
        if (window.dataLayer) {
            window.dataLayer.push({
                event: eventName,
                ...data
            });
        }
        
        console.log(`Event: ${eventName}`, data);
    }

    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const productListing = new ProductListing();
    
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/sw.js')
                .catch(err => console.log('ServiceWorker registration failed: ', err));
        });
    }
});

const rippleStyle = document.createElement('style');
rippleStyle.textContent = `
    @keyframes ripple {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
    
    .touching {
        transform: scale(0.98);
        transition: transform 0.1s ease;
    }
    
    .lazy {
        opacity: 0;
        transition: opacity 0.3s;
    }
    
    .lazy.loaded {
        opacity: 1;
    }
`;
document.head.appendChild(rippleStyle);