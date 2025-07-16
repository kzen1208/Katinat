// Menu synchronization between admin and website
class MenuSync {
    constructor() {
        this.menuItems = [];
        this.init();
    }

    init() {
        // Load menu from localStorage
        this.loadMenu();
        
        // Listen for menu updates from admin
        window.addEventListener('menuUpdated', (event) => {
            this.menuItems = event.detail;
            this.updateMenuDisplay();
        });

        // Listen for storage changes (when admin updates menu)
        window.addEventListener('storage', (event) => {
            if (event.key === 'katinatMenu') {
                this.loadMenu();
                this.updateMenuDisplay();
            }
        });
    }

    loadMenu() {
        const stored = localStorage.getItem('katinatMenu');
        if (stored) {
            this.menuItems = JSON.parse(stored);
        }
    }

    updateMenuDisplay() {
        // Update menu sections on menu.html
        this.updateMenuSection('tra-sua');
        this.updateMenuSection('ca-phe');
        this.updateMenuSection('tra-trai-cay');
        this.updateMenuSection('dac-biet');
    }

    updateMenuSection(category) {
        const section = document.querySelector(`[data-category="${category}"]`);
        if (!section) return;

        const menuGrid = section.querySelector('.menu-grid');
        if (!menuGrid) return;

        const categoryItems = this.menuItems.filter(item => 
            item.category === category && item.status === 'active'
        );

        menuGrid.innerHTML = categoryItems.map(item => `
            <div class="menu-item animate__animated animate__fadeInUp hover:animate__pulse">
                <img src="${item.image}" alt="${item.name}" onerror="this.src='https://via.placeholder.com/300x200?text=No+Image'">
                <div class="menu-item-info">
                    <h3>${item.name}</h3>
                    <p>${item.description}</p>
                    <div class="price">${item.price.toLocaleString('vi-VN')}đ</div>
                    <button class="add-to-cart-btn" onclick="openProductOptions('${item.name}', ${item.price}, '${item.image}')">
                        Thêm vào giỏ
                    </button>
                </div>
            </div>
        `).join('');
    }

    // Get menu items by category for external use
    getMenuByCategory(category) {
        if (category === 'all') {
            return this.menuItems.filter(item => item.status === 'active');
        }
        return this.menuItems.filter(item => 
            item.category === category && item.status === 'active'
        );
    }

    // Get all active menu items
    getAllActiveItems() {
        return this.menuItems.filter(item => item.status === 'active');
    }
}

// Initialize menu sync when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    window.menuSync = new MenuSync();
    
    // Update menu display after a short delay to ensure DOM is ready
    setTimeout(() => {
        if (window.menuSync) {
            window.menuSync.updateMenuDisplay();
        }
    }, 500);
});

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MenuSync;
}