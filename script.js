// Cart functionality
let cart = [];
let cartCount = 0;
let appliedPromo = null;
let discountAmount = 0;

// Initialize cart from localStorage
function initCart() {
    const savedCart = localStorage.getItem('katinatCart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
        updateCartCount();
    }
}

// Save cart to localStorage
function saveCart() {
    localStorage.setItem('katinatCart', JSON.stringify(cart));
}

// Update cart count display
function updateCartCount() {
    cartCount = cart.reduce((total, item) => total + item.quantity, 0);
    const cartCountElement = document.querySelector('.cart-count');
    if (cartCountElement) {
        cartCountElement.textContent = cartCount;
    }
}

// Add item to cart
function addToCart(name, price) {
    const existingItem = cart.find(item => item.name === name);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            name: name,
            price: price,
            quantity: 1
        });
    }
    
    updateCartCount();
    saveCart();
    showAddToCartNotification(name);
}

// Show notification when item added to cart
function showAddToCartNotification(itemName) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'cart-notification';
    notification.innerHTML = `
        <i class="material-icons">check_circle</i>
        <span>Đã thêm "${itemName}" vào giỏ hàng</span>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: #27ae60;
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        z-index: 3000;
        animation: slideInRight 0.3s ease-out;
        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
    `;
    
    document.body.appendChild(notification);
    
    // Remove notification after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease-in';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Open cart modal
function openCart() {
    const modal = document.getElementById('cartModal');
    if (modal) {
        modal.style.display = 'block';
        renderCartItems();
    }
}

// Close cart modal
function closeCart() {
    const modal = document.getElementById('cartModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// Render cart items
function renderCartItems() {
    const cartItemsContainer = document.getElementById('cartItems');
    const totalPriceElement = document.getElementById('totalPrice');
    const finalPriceElement = document.getElementById('finalPrice');
    const discountElement = document.getElementById('discountAmount');
    
    if (!cartItemsContainer) return;
    
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = `
            <div class="empty-cart">
                <i class="material-icons">shopping_cart</i>
                <p>Giỏ hàng của bạn đang trống</p>
            </div>
        `;
        if (totalPriceElement) {
            totalPriceElement.textContent = '0đ';
        }
        if (finalPriceElement) {
            finalPriceElement.textContent = '0đ';
        }
        return;
    }
    
    let cartHTML = '';
    let total = 0;
    
    cart.forEach((item, index) => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        
        cartHTML += `
            <div class="cart-item">
                <div class="item-info">
                    <div class="item-name">${item.name}</div>
                    <div class="item-price">${formatPrice(item.price)}</div>
                </div>
                <div class="quantity-controls">
                    <button class="qty-btn" onclick="updateQuantity(${index}, -1)">-</button>
                    <span class="quantity">${item.quantity}</span>
                    <button class="qty-btn" onclick="updateQuantity(${index}, 1)">+</button>
                </div>
                <button class="remove-item" onclick="removeFromCart(${index})">
                    <i class="material-icons">delete</i>
                </button>
            </div>
        `;
    });
    
    cartItemsContainer.innerHTML = cartHTML;
    
    // Calculate discount
    if (appliedPromo) {
        discountAmount = Math.floor(total * appliedPromo.discount);
        if (discountElement) {
            discountElement.textContent = `Giảm giá (${appliedPromo.code}): -${formatPrice(discountAmount)}`;
            discountElement.style.display = 'block';
        }
    } else {
        discountAmount = 0;
        if (discountElement) {
            discountElement.style.display = 'none';
        }
    }
    
    const finalTotal = total - discountAmount;
    
    if (totalPriceElement) {
        totalPriceElement.textContent = formatPrice(total);
    }
    if (finalPriceElement) {
        finalPriceElement.textContent = formatPrice(finalTotal);
    }
}

// Update item quantity
function updateQuantity(index, change) {
    if (cart[index]) {
        cart[index].quantity += change;
        
        if (cart[index].quantity <= 0) {
            cart.splice(index, 1);
        }
        
        updateCartCount();
        saveCart();
        renderCartItems();
    }
}

// Remove item from cart
function removeFromCart(index) {
    cart.splice(index, 1);
    updateCartCount();
    saveCart();
    renderCartItems();
}

// Format price
function formatPrice(price) {
    return new Intl.NumberFormat('vi-VN').format(price) + 'đ';
}

// Open checkout modal
function openCheckout() {
    if (cart.length === 0) {
        alert('Giỏ hàng của bạn đang trống!');
        return;
    }
    
    closeCart();
    const checkoutModal = document.getElementById('checkoutModal');
    if (checkoutModal) {
        checkoutModal.style.display = 'block';
        renderOrderSummary();
    }
}

// Close checkout modal
function closeCheckout() {
    const modal = document.getElementById('checkoutModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// Render order summary
function renderOrderSummary() {
    const orderSummary = document.querySelector('.order-summary');
    if (!orderSummary) return;
    
    let summaryHTML = '<h4><i class="material-icons">receipt</i> Tóm tắt đơn hàng</h4>';
    let total = 0;
    
    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        
        summaryHTML += `
            <div class="summary-item">
                <span>${item.name} x${item.quantity}</span>
                <span>${formatPrice(itemTotal)}</span>
            </div>
        `;
    });
    
    // Add discount if applied
    if (appliedPromo) {
        const discount = Math.floor(total * appliedPromo.discount);
        summaryHTML += `
            <div class="summary-item" style="color: #27ae60;">
                <span>Giảm giá (${appliedPromo.code})</span>
                <span>-${formatPrice(discount)}</span>
            </div>
        `;
        total -= discount;
    }
    
    const deliveryFee = 15000;
    const finalTotal = total + deliveryFee;
    
    summaryHTML += `
        <div class="summary-item">
            <span>Phí giao hàng</span>
            <span>${formatPrice(deliveryFee)}</span>
        </div>
        <div class="final-total">
            Tổng cộng: ${formatPrice(finalTotal)}
        </div>
    `;
    
    orderSummary.innerHTML = summaryHTML;
}

// Menu category filtering
function showCategory(category) {
    const sections = document.querySelectorAll('.menu-section');
    const buttons = document.querySelectorAll('.category-btn');
    
    // Update active button
    buttons.forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    
    // Show/hide sections
    sections.forEach(section => {
        if (category === 'all' || section.dataset.category === category) {
            section.style.display = 'block';
        } else {
            section.style.display = 'none';
        }
    });
}

// Handle checkout form submission
function handleCheckout(event) {
    event.preventDefault();
    
    const form = event.target;
    const formData = new FormData(form);
    
    // Validate required fields
    const requiredFields = ['customerName', 'customerPhone'];
    let isValid = true;
    
    requiredFields.forEach(field => {
        const input = form.querySelector(`#${field}`);
        if (!input.value.trim()) {
            input.style.borderColor = '#e74c3c';
            isValid = false;
        } else {
            input.style.borderColor = '#e0e0e0';
        }
    });
    
    if (!isValid) {
        alert('Vui lòng điền đầy đủ thông tin bắt buộc!');
        return;
    }
    
    // Simulate order processing
    const submitBtn = form.querySelector('.btn-primary');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Đang xử lý...';
    submitBtn.disabled = true;
    
    setTimeout(() => {
        // Get customer info
        const customerInfo = {
            name: form.querySelector('#customerName').value,
            phone: form.querySelector('#customerPhone').value,
            email: form.querySelector('#customerEmail').value,
            address: form.querySelector('#customerAddress').value,
            paymentMethod: form.querySelector('input[name="paymentMethod"]:checked').value
        };
        
        // Calculate order total
        let orderTotal = 0;
        cart.forEach(item => {
            orderTotal += item.price * item.quantity;
        });
        
        if (appliedPromo) {
            orderTotal -= Math.floor(orderTotal * appliedPromo.discount);
        }
        orderTotal += 15000; // Delivery fee
        
        // Create order data
        const orderData = {
            orderId: 'KT' + Date.now(),
            timestamp: new Date().toLocaleString('vi-VN'),
            customer: customerInfo,
            items: [...cart],
            promo: appliedPromo,
            total: orderTotal
        };
        
        // Save to localStorage for admin view
        let orders = JSON.parse(localStorage.getItem('katinatOrders') || '[]');
        orders.push(orderData);
        localStorage.setItem('katinatOrders', JSON.stringify(orders));
        
        // Log to console for debugging
        console.log('New Order:', orderData);
        
        // Show success modal
        showSuccessModal(customerInfo);
        
        // Clear cart
        cart = [];
        appliedPromo = null;
        discountAmount = 0;
        updateCartCount();
        saveCart();
        
        // Close checkout modal
        closeCheckout();
        
        // Reset form
        form.reset();
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }, 2000);
}

// Close modal when clicking outside
window.onclick = function(event) {
    const cartModal = document.getElementById('cartModal');
    const checkoutModal = document.getElementById('checkoutModal');
    
    if (event.target === cartModal) {
        closeCart();
    }
    
    if (event.target === checkoutModal) {
        closeCheckout();
    }
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Slideshow functionality
let slideIndex = 1;

function changeSlide(n) {
    showSlide(slideIndex += n);
}

function currentSlide(n) {
    showSlide(slideIndex = n);
}

function showSlide(n) {
    const slides = document.querySelectorAll('.hero-slide');
    const dots = document.querySelectorAll('.dot');
    
    if (n > slides.length) { slideIndex = 1 }
    if (n < 1) { slideIndex = slides.length }
    
    slides.forEach(slide => slide.classList.remove('active'));
    dots.forEach(dot => dot.classList.remove('active'));
    
    if (slides[slideIndex - 1]) {
        slides[slideIndex - 1].classList.add('active');
    }
    if (dots[slideIndex - 1]) {
        dots[slideIndex - 1].classList.add('active');
    }
}

// Auto slideshow
function autoSlide() {
    slideIndex++;
    showSlide(slideIndex);
}

// Promotion modal functions
function closePromoModal() {
    const overlay = document.getElementById('promoOverlay');
    overlay.style.display = 'none';
}

function usePromoCode() {
    showNotification('Mã khuyến mãi TET2025 đã được áp dụng!', 'success');
    closePromoModal();
}

// Success modal functions
function showSuccessModal(customerInfo) {
    const modal = document.getElementById('successModal');
    const deliveryTime = document.getElementById('deliveryTime');
    const deliveryAddress = document.getElementById('deliveryAddress');
    
    // Calculate delivery time
    const now = new Date();
    const deliveryStart = new Date(now.getTime() + 15 * 60000);
    const deliveryEnd = new Date(now.getTime() + 20 * 60000);
    
    deliveryTime.textContent = `${deliveryStart.getHours()}:${deliveryStart.getMinutes().toString().padStart(2, '0')} - ${deliveryEnd.getHours()}:${deliveryEnd.getMinutes().toString().padStart(2, '0')}`;
    
    if (customerInfo && customerInfo.address) {
        deliveryAddress.textContent = customerInfo.address;
    }
    
    modal.classList.remove('hidden');
    modal.classList.add('flex');
}

function closeSuccessModal() {
    const modal = document.getElementById('successModal');
    modal.classList.add('hidden');
    modal.classList.remove('flex');
}

// Notification function
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    const bgColor = type === 'success' ? 'from-green-500 to-green-600' : 'from-sky-500 to-sky-600';
    
    notification.className = `fixed top-20 right-4 bg-gradient-to-r ${bgColor} text-white px-6 py-3 rounded-xl shadow-lg z-50 transform transition-all duration-300 translate-x-full`;
    notification.style.boxShadow = '0 0 20px rgba(34, 197, 94, 0.3)';
    notification.innerHTML = `
        <div class="flex items-center gap-2">
            <i class="material-icons">${type === 'success' ? 'check_circle' : 'info'}</i>
            <span>${message}</span>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.remove('translate-x-full');
    }, 100);
    
    setTimeout(() => {
        notification.classList.add('translate-x-full');
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// News slider functionality
let newsSlideIndex = 1;

function changeNewsSlide(n) {
    showNewsSlide(newsSlideIndex += n);
}

function currentNewsSlide(n) {
    showNewsSlide(newsSlideIndex = n);
}

function showNewsSlide(n) {
    const slides = document.querySelectorAll('.news-slide');
    const dots = document.querySelectorAll('.news-dot');
    
    if (n > slides.length) { newsSlideIndex = 1 }
    if (n < 1) { newsSlideIndex = slides.length }
    
    slides.forEach(slide => slide.classList.remove('active'));
    dots.forEach(dot => dot.classList.remove('active'));
    
    if (slides[newsSlideIndex - 1]) {
        slides[newsSlideIndex - 1].classList.add('active');
    }
    if (dots[newsSlideIndex - 1]) {
        dots[newsSlideIndex - 1].classList.add('active');
    }
}

// Auto news slideshow
function autoNewsSlide() {
    newsSlideIndex++;
    showNewsSlide(newsSlideIndex);
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    initCart();
    
    // Show promo modal without blur
    // Modal will show automatically on page load
    
    // Add event listener for checkout form
    const checkoutForm = document.getElementById('checkoutForm');
    if (checkoutForm) {
        checkoutForm.addEventListener('submit', handleCheckout);
    }
    
    // Start auto slideshow
    setInterval(autoSlide, 5000);
    
    // Start auto news slideshow
    if (document.querySelector('.news-slider')) {
        setInterval(autoNewsSlide, 4000);
    }
});

// Search functionality
function handleSearch() {
    const searchInput = document.querySelector('.search-box input');
    const searchTerm = searchInput.value.toLowerCase().trim();
    
    if (!searchTerm) return;
    
    // If on menu page, filter menu items
    if (window.location.pathname.includes('menu.html')) {
        const menuItems = document.querySelectorAll('.menu-item');
        
        menuItems.forEach(item => {
            const itemName = item.querySelector('h3').textContent.toLowerCase();
            const itemDescription = item.querySelector('p').textContent.toLowerCase();
            
            if (itemName.includes(searchTerm) || itemDescription.includes(searchTerm)) {
                item.style.display = 'block';
            } else {
                item.style.display = 'none';
            }
        });
    }
}

// Apply promo code
function applyPromo() {
    const promoInput = document.getElementById('promoInput');
    const promoMessage = document.getElementById('promoMessage');
    const promoCode = promoInput.value.trim().toUpperCase();
    
    // Valid promo codes
    const validPromos = {
        'TET2025': { discount: 0.2, name: 'Giảm giá Tết 2025' },
        'KATINAT20': { discount: 0.15, name: 'Giảm giá 15%' },
        'WELCOME10': { discount: 0.1, name: 'Chào mừng 10%' }
    };
    
    if (validPromos[promoCode]) {
        appliedPromo = {
            code: promoCode,
            discount: validPromos[promoCode].discount,
            name: validPromos[promoCode].name
        };
        
        promoMessage.textContent = `Đã áp dụng mã ${promoCode} - ${validPromos[promoCode].name}`;
        promoMessage.style.display = 'block';
        promoMessage.style.color = '#27ae60';
        
        renderCartItems();
    } else {
        promoMessage.textContent = 'Mã giảm giá không hợp lệ!';
        promoMessage.style.display = 'block';
        promoMessage.style.color = '#e74c3c';
    }
}

// Add enhanced search event listeners
document.addEventListener('DOMContentLoaded', function() {
    const searchBtn = document.querySelector('.search-btn');
    const searchInput = document.querySelector('.search-box input');
    const mobileSearchBtn = document.querySelector('.mobile-search .search-btn');
    const mobileSearchInput = document.querySelector('.mobile-search input');
    
    // Desktop search
    if (searchBtn) {
        searchBtn.addEventListener('click', handleSearch);
    }
    
    if (searchInput) {
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                handleSearch();
            }
        });
    }
    
    // Mobile search
    if (mobileSearchBtn) {
        mobileSearchBtn.addEventListener('click', handleMobileSearch);
    }
    
    if (mobileSearchInput) {
        mobileSearchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                handleMobileSearch();
            }
        });
        
        // Add input animation
        mobileSearchInput.addEventListener('focus', function() {
            this.parentElement.style.transform = 'scale(1.02)';
        });
        
        mobileSearchInput.addEventListener('blur', function() {
            this.parentElement.style.transform = 'scale(1)';
        });
    }
    
    // Add touch feedback for mobile buttons
    const mobileButtons = document.querySelectorAll('.mobile-menu-btn, .search-toggle-btn, .cart-btn');
    mobileButtons.forEach(button => {
        button.addEventListener('touchstart', function() {
            this.style.transform = 'scale(0.95)';
        });
        
        button.addEventListener('touchend', function() {
            this.style.transform = 'scale(1)';
        });
        
        button.addEventListener('touchcancel', function() {
            this.style.transform = 'scale(1)';
        });
    });
});
// Responsive scaling handler with smooth navigation transitions
function handleResponsiveScaling() {
    const width = window.innerWidth;
    const body = document.body;
    const nav = document.querySelector('.nav');
    const navLinks = document.querySelectorAll('.nav-link');
    
    // Remove existing classes
    body.classList.remove('mobile', 'tablet', 'desktop', 'large-desktop');
    
    // Add appropriate class
    if (width >= 1200) {
        body.classList.add('large-desktop');
    } else if (width >= 992) {
        body.classList.add('desktop');
    } else if (width >= 769) {
        body.classList.add('tablet');
    } else {
        body.classList.add('mobile');
    }
    
    // Handle navigation transitions
    if (nav && navLinks.length > 0) {
        // Add transition class for smooth animation
        nav.classList.add('nav-transitioning');
        
        navLinks.forEach((link, index) => {
            const icon = link.querySelector('i');
            const text = link.querySelector('span');
            
            if (icon && text) {
                // Add staggered animation delay
                link.style.transitionDelay = `${index * 0.05}s`;
                
                if (width <= 768) {
                    // Mobile: Show icons and text
                    icon.style.display = 'block';
                    text.style.display = 'block';
                    link.classList.add('nav-mobile-mode');
                    link.classList.remove('nav-desktop-mode');
                } else {
                    // Desktop: Show only text
                    icon.style.display = 'none';
                    text.style.display = 'block';
                    link.classList.add('nav-desktop-mode');
                    link.classList.remove('nav-mobile-mode');
                }
            }
        });
        
        // Remove transition class after animation completes
        setTimeout(() => {
            nav.classList.remove('nav-transitioning');
            navLinks.forEach(link => {
                link.style.transitionDelay = '';
            });
        }, 500);
    }
    
    // Optimize animations for mobile
    if (width <= 768) {
        const animatedElements = document.querySelectorAll('.animate__animated');
        animatedElements.forEach(el => {
            el.style.animationDuration = '0.5s';
            el.style.animationDelay = '0.1s';
        });
    }
    
    // Handle mobile menu visibility
    handleMobileMenuVisibility(width);
}

// Handle mobile menu visibility and transitions
function handleMobileMenuVisibility(width) {
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const searchToggleBtn = document.querySelector('.search-toggle-btn');
    const searchBox = document.querySelector('.search-box');
    const mobileSearch = document.querySelector('.mobile-search');
    
    if (width <= 768) {
        // Mobile mode
        if (mobileMenuBtn) mobileMenuBtn.style.display = 'block';
        if (searchToggleBtn) searchToggleBtn.style.display = 'block';
        if (searchBox) searchBox.style.display = 'none';
    } else {
        // Desktop mode
        if (mobileMenuBtn) mobileMenuBtn.style.display = 'none';
        if (searchToggleBtn) searchToggleBtn.style.display = 'none';
        if (searchBox) searchBox.style.display = 'flex';
        if (mobileSearch) mobileSearch.classList.remove('active');
    }
}

// Smooth navigation transition function
function smoothNavTransition() {
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach((link, index) => {
        link.classList.add('nav-transition');
        
        setTimeout(() => {
            link.classList.remove('nav-transition');
        }, 400 + (index * 50));
    });
}

// Toggle mobile menu with enhanced animations
function toggleMobileMenu() {
    const nav = document.getElementById('mobileNav');
    const body = document.body;
    const menuBtn = document.querySelector('.mobile-menu-btn');
    
    if (nav && menuBtn) {
        const isShowing = nav.classList.contains('show');
        
        if (!isShowing) {
            // Show menu
            nav.classList.add('show');
            body.classList.add('menu-open');
            menuBtn.innerHTML = '<i class="material-icons">close</i>';
            
            // Add staggered animation to nav links
            const navLinks = nav.querySelectorAll('.nav-link');
            navLinks.forEach((link, index) => {
                link.style.animationDelay = `${index * 0.1}s`;
                link.style.animation = 'fadeInScale 0.3s ease forwards';
            });
            
            // Add subtle vibration on mobile devices
            if (navigator.vibrate) {
                navigator.vibrate([50, 50, 50]);
            }
        } else {
            // Hide menu
            nav.classList.remove('show');
            body.classList.remove('menu-open');
            menuBtn.innerHTML = '<i class="material-icons">menu</i>';
            
            // Reset animations
            const navLinks = nav.querySelectorAll('.nav-link');
            navLinks.forEach(link => {
                link.style.animation = '';
                link.style.animationDelay = '';
            });
        }
    }
}

// Enhanced cart button interaction
function openCart() {
    const modal = document.getElementById('cartModal');
    const cartBtn = document.querySelector('.cart-btn');
    
    if (modal) {
        modal.style.display = 'block';
        renderCartItems();
        
        // Add cart button animation
        if (cartBtn) {
            cartBtn.style.animation = 'cartBounce 0.3s ease';
            setTimeout(() => {
                cartBtn.style.animation = '';
            }, 300);
        }
        
        // Add subtle vibration on mobile devices
        if (navigator.vibrate) {
            navigator.vibrate(100);
        }
    }
}

// Toggle mobile search with enhanced UX
function toggleSearch() {
    const mobileSearch = document.getElementById('mobileSearch');
    const searchToggleBtn = document.querySelector('.search-toggle-btn');
    
    if (mobileSearch && searchToggleBtn) {
        const isActive = mobileSearch.classList.contains('active');
        
        if (!isActive) {
            // Show search
            mobileSearch.classList.add('active');
            searchToggleBtn.classList.add('active');
            
            // Focus input after animation
            setTimeout(() => {
                const input = mobileSearch.querySelector('input');
                if (input) {
                    input.focus();
                    // Add subtle vibration on mobile devices
                    if (navigator.vibrate) {
                        navigator.vibrate(50);
                    }
                }
            }, 200);
        } else {
            // Hide search
            mobileSearch.classList.remove('active');
            searchToggleBtn.classList.remove('active');
            
            // Clear input
            const input = mobileSearch.querySelector('input');
            if (input) {
                input.blur();
            }
        }
    }
}

// Handle mobile search input
function handleMobileSearch() {
    const mobileSearchInput = document.querySelector('.mobile-search input');
    const searchTerm = mobileSearchInput.value.toLowerCase().trim();
    
    if (!searchTerm) {
        showNotification('Vui lòng nhập từ khóa tìm kiếm', 'info');
        return;
    }
    
    // Show search feedback
    showNotification(`Đang tìm kiếm: "${searchTerm}"`, 'info');
    
    // If on menu page, filter menu items
    if (window.location.pathname.includes('menu.html')) {
        const menuItems = document.querySelectorAll('.menu-item');
        let foundItems = 0;
        
        menuItems.forEach(item => {
            const itemName = item.querySelector('h3').textContent.toLowerCase();
            const itemDescription = item.querySelector('p').textContent.toLowerCase();
            
            if (itemName.includes(searchTerm) || itemDescription.includes(searchTerm)) {
                item.style.display = 'block';
                item.style.animation = 'fadeInScale 0.3s ease';
                foundItems++;
            } else {
                item.style.display = 'none';
            }
        });
        
        // Show results feedback
        setTimeout(() => {
            if (foundItems === 0) {
                showNotification('Không tìm thấy sản phẩm nào', 'info');
            } else {
                showNotification(`Tìm thấy ${foundItems} sản phẩm`, 'success');
            }
        }, 300);
    } else {
        // Redirect to menu page with search term
        window.location.href = `menu.html?search=${encodeURIComponent(searchTerm)}`;
    }
    
    // Hide search after searching
    setTimeout(() => {
        toggleSearch();
    }, 1000);
}

// Handle window resize with debouncing for better performance
let resizeTimeout;
window.addEventListener('resize', function() {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        handleResponsiveScaling();
        
        if (window.innerWidth > 768) {
            const nav = document.getElementById('mobileNav');
            const search = document.getElementById('mobileSearch');
            const searchToggleBtn = document.querySelector('.search-toggle-btn');
            const menuBtn = document.querySelector('.mobile-menu-btn');
            const body = document.body;
            
            if (nav) {
                nav.classList.remove('show');
            }
            if (search) {
                search.classList.remove('active');
            }
            if (searchToggleBtn) {
                searchToggleBtn.classList.remove('active');
            }
            if (menuBtn) {
                menuBtn.innerHTML = '<i class="material-icons">menu</i>';
            }
            if (body) {
                body.classList.remove('menu-open');
            }
        }
    }, 100);
});

// Orientation change handler
window.addEventListener('orientationchange', function() {
    setTimeout(handleResponsiveScaling, 100);
});

// Initialize responsive scaling on load
document.addEventListener('DOMContentLoaded', function() {
    handleResponsiveScaling();
});
// Product Options Modal Variables
let currentProduct = {
    name: '',
    price: 0,
    image: '',
    quantity: 1,
    options: {
        size: 'S',
        ice: '100',
        sugar: '100',
        toppings: []
    }
};

// Open product options modal
function openProductOptions(name, price, image) {
    // Reset current product
    currentProduct = {
        name: name,
        price: price,
        image: image,
        quantity: 1,
        options: {
            size: 'S',
            ice: '100',
            sugar: '100',
            toppings: []
        }
    };
    
    // Set modal content
    document.getElementById('productOptionsTitle').textContent = name;
    document.getElementById('productOptionsImage').src = image;
    document.getElementById('productQuantity').value = 1;
    document.getElementById('productTotalPrice').textContent = formatPrice(price);
    
    // Reset form selections
    document.querySelector('input[name="size"][value="S"]').checked = true;
    document.querySelector('input[name="ice"][value="100"]').checked = true;
    document.querySelector('input[name="sugar"][value="100"]').checked = true;
    
    const toppingCheckboxes = document.querySelectorAll('input[name="topping"]');
    toppingCheckboxes.forEach(checkbox => {
        checkbox.checked = false;
    });
    
    // Show modal
    const modal = document.getElementById('productOptionsModal');
    if (modal) {
        modal.style.display = 'block';
    }
}

// Close product options modal
function closeProductOptions() {
    const modal = document.getElementById('productOptionsModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// Increase product quantity
function increaseQuantity() {
    const quantityInput = document.getElementById('productQuantity');
    if (quantityInput.value < 10) {
        quantityInput.value = parseInt(quantityInput.value) + 1;
        currentProduct.quantity = parseInt(quantityInput.value);
        updateProductTotal();
    }
}

// Decrease product quantity
function decreaseQuantity() {
    const quantityInput = document.getElementById('productQuantity');
    if (quantityInput.value > 1) {
        quantityInput.value = parseInt(quantityInput.value) - 1;
        currentProduct.quantity = parseInt(quantityInput.value);
        updateProductTotal();
    }
}

// Update product total price based on options
function updateProductTotal() {
    let totalPrice = currentProduct.price;
    
    // Add size price
    const selectedSize = document.querySelector('input[name="size"]:checked').value;
    currentProduct.options.size = selectedSize;
    
    switch (selectedSize) {
        case 'M':
            totalPrice += 10000;
            break;
        case 'L':
            totalPrice += 15000;
            break;
        case 'special':
            totalPrice += 25000;
            break;
    }
    
    // Add ice option
    const selectedIce = document.querySelector('input[name="ice"]:checked').value;
    currentProduct.options.ice = selectedIce;
    
    // Add sugar option
    const selectedSugar = document.querySelector('input[name="sugar"]:checked').value;
    currentProduct.options.sugar = selectedSugar;
    
    // Add toppings
    const toppingCheckboxes = document.querySelectorAll('input[name="topping"]:checked');
    currentProduct.options.toppings = [];
    
    toppingCheckboxes.forEach(checkbox => {
        currentProduct.options.toppings.push(checkbox.value);
        
        switch (checkbox.value) {
            case 'tran-chau-den':
            case 'tran-chau-trang':
                totalPrice += 10000;
                break;
            case 'thach-tra-xanh':
            case 'pudding':
                totalPrice += 8000;
                break;
            case 'kem-pho-mai':
                totalPrice += 15000;
                break;
        }
    });
    
    // Multiply by quantity
    totalPrice *= currentProduct.quantity;
    
    // Update display
    document.getElementById('productTotalPrice').textContent = formatPrice(totalPrice);
}

// Add to cart with options
function addToCartWithOptions() {
    // Create product name with options
    let productName = currentProduct.name;
    
    // Add size to name
    switch (currentProduct.options.size) {
        case 'S':
            productName += ' (S)';
            break;
        case 'M':
            productName += ' (M)';
            break;
        case 'L':
            productName += ' (L)';
            break;
        case 'special':
            productName += ' (Ly CT tháng)';
            break;
    }
    
    // Add ice and sugar options
    productName += ` - ${currentProduct.options.ice}% đá, ${currentProduct.options.sugar}% đường`;
    
    // Add toppings if any
    if (currentProduct.options.toppings.length > 0) {
        const toppingNames = {
            'tran-chau-den': 'Trân châu đen',
            'tran-chau-trang': 'Trân châu trắng',
            'thach-tra-xanh': 'Thạch trà xanh',
            'pudding': 'Pudding',
            'kem-pho-mai': 'Kem phô mai'
        };
        
        const toppingsList = currentProduct.options.toppings.map(t => toppingNames[t]).join(', ');
        productName += ` + ${toppingsList}`;
    }
    
    // Calculate total price
    let totalPrice = currentProduct.price;
    
    // Add size price
    switch (currentProduct.options.size) {
        case 'M':
            totalPrice += 10000;
            break;
        case 'L':
            totalPrice += 15000;
            break;
        case 'special':
            totalPrice += 25000;
            break;
    }
    
    // Add toppings price
    currentProduct.options.toppings.forEach(topping => {
        switch (topping) {
            case 'tran-chau-den':
            case 'tran-chau-trang':
                totalPrice += 10000;
                break;
            case 'thach-tra-xanh':
            case 'pudding':
                totalPrice += 8000;
                break;
            case 'kem-pho-mai':
                totalPrice += 15000;
                break;
        }
    });
    
    // Add to cart
    const existingItem = cart.find(item => item.name === productName);
    
    if (existingItem) {
        existingItem.quantity += currentProduct.quantity;
    } else {
        cart.push({
            name: productName,
            price: totalPrice,
            quantity: currentProduct.quantity
        });
    }
    
    updateCartCount();
    saveCart();
    showAddToCartNotification(currentProduct.name);
    closeProductOptions();
}

// Add event listeners for product options
document.addEventListener('DOMContentLoaded', function() {
    // Add event listeners for size options
    const sizeOptions = document.querySelectorAll('input[name="size"]');
    sizeOptions.forEach(option => {
        option.addEventListener('change', updateProductTotal);
    });
    
    // Add event listeners for ice options
    const iceOptions = document.querySelectorAll('input[name="ice"]');
    iceOptions.forEach(option => {
        option.addEventListener('change', updateProductTotal);
    });
    
    // Add event listeners for sugar options
    const sugarOptions = document.querySelectorAll('input[name="sugar"]');
    sugarOptions.forEach(option => {
        option.addEventListener('change', updateProductTotal);
    });
    
    // Add event listeners for topping options
    const toppingOptions = document.querySelectorAll('input[name="topping"]');
    toppingOptions.forEach(option => {
        option.addEventListener('change', updateProductTotal);
    });
    
    // Add event listener for quantity input
    const quantityInput = document.getElementById('productQuantity');
    if (quantityInput) {
        quantityInput.addEventListener('change', function() {
            if (this.value < 1) this.value = 1;
            if (this.value > 10) this.value = 10;
            currentProduct.quantity = parseInt(this.value);
            updateProductTotal();
        });
    }
    
    // Close modal when clicking outside
    window.addEventListener('click', function(event) {
        const productOptionsModal = document.getElementById('productOptionsModal');
        if (event.target === productOptionsModal) {
            closeProductOptions();
        }
    });
});