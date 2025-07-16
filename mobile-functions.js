// Mobile-specific functions
function toggleMobileMenu() {
    const sidebarOverlay = document.getElementById('sidebarOverlay');
    sidebarOverlay.classList.toggle('active');
    
    // Toggle body scroll
    document.body.classList.toggle('menu-open');
}

function closeSidebar() {
    const sidebarOverlay = document.getElementById('sidebarOverlay');
    sidebarOverlay.classList.remove('active');
    document.body.classList.remove('menu-open');
}

function toggleSearch() {
    const mobileSearch = document.getElementById('mobileSearch');
    
    if (mobileSearch) {
        mobileSearch.classList.toggle('active');
        
        if (mobileSearch.classList.contains('active')) {
            mobileSearch.style.maxHeight = '80px';
            mobileSearch.style.opacity = '1';
            const input = mobileSearch.querySelector('input');
            if (input) input.focus();
        } else {
            mobileSearch.style.maxHeight = '0';
            mobileSearch.style.opacity = '0';
        }
    }
}

// Handle mobile search
function handleMobileSearch() {
    const searchInput = document.querySelector('.mobile-search input');
    const searchTerm = searchInput.value.toLowerCase().trim();
    
    if (!searchTerm) return;
    
    // Redirect to menu page with search
    window.location.href = `menu.html?search=${encodeURIComponent(searchTerm)}`;
}

// Add event listeners for mobile search
document.addEventListener('DOMContentLoaded', function() {
    const mobileSearchBtn = document.querySelector('.mobile-search .search-btn');
    const mobileSearchInput = document.querySelector('.mobile-search input');
    
    if (mobileSearchBtn) {
        mobileSearchBtn.addEventListener('click', handleMobileSearch);
    }
    
    if (mobileSearchInput) {
        mobileSearchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                handleMobileSearch();
            }
        });
    }
});

// Copy promo code function
function copyPromoCode() {
    const promoCode = document.getElementById('promoCode').textContent;
    navigator.clipboard.writeText(promoCode).then(() => {
        showNotification('Đã sao chép mã khuyến mãi!', 'success');
    });
}

// Initialize mobile functions
document.addEventListener('DOMContentLoaded', function() {
    // Auto-show promo modal after 2 seconds
    setTimeout(() => {
        const promoOverlay = document.getElementById('promoOverlay');
        if (promoOverlay) {
            promoOverlay.style.display = 'flex';
        }
    }, 2000);
    
    // Ensure cart function works
    const cartBtn = document.querySelector('.cart-btn');
    if (cartBtn && !cartBtn.onclick) {
        cartBtn.addEventListener('click', openCart);
    }
    
    // Close sidebar when clicking on overlay
    const sidebarOverlay = document.getElementById('sidebarOverlay');
    if (sidebarOverlay) {
        sidebarOverlay.addEventListener('click', function(e) {
            if (e.target === sidebarOverlay) {
                closeSidebar();
            }
        });
    }
    
    // Close sidebar on escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeSidebar();
        }
    });
});