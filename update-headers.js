// Script để cập nhật tất cả file HTML theo chuẩn index.html
const fs = require('fs');
const path = require('path');

const mobileCSS = `
        @media (max-width: 767px) {
            .header {
                position: relative !important;
            }
            .header-content {
                display: flex !important;
                flex-direction: column !important;
                align-items: center !important;
                padding: 1rem !important;
                gap: 1rem !important;
            }
            .logo {
                order: 1 !important;
            }
            .nav {
                display: none !important;
            }
            .nav.show {
                display: flex !important;
                position: fixed !important;
                bottom: 0 !important;
                left: 0 !important;
                right: 0 !important;
                background: linear-gradient(135deg, #0c4a6e 0%, #075985 100%) !important;
                padding: 0.8rem 0.5rem !important;
                justify-content: space-around !important;
                z-index: 100 !important;
                border-top-left-radius: 20px !important;
                border-top-right-radius: 20px !important;
                box-shadow: 0 -4px 20px rgba(0,0,0,0.15) !important;
            }
            body {
                padding-bottom: 70px !important;
            }
            .nav.show .nav-link {
                display: flex !important;
                flex-direction: column !important;
                align-items: center !important;
                padding: 0.8rem !important;
                border-radius: 12px !important;
                min-width: 48px !important;
                flex: 1 !important;
                max-width: 60px !important;
            }
            .nav.show .nav-link i {
                display: block !important;
                font-size: 1.8rem !important;
            }
            .nav.show .nav-link span {
                display: none !important;
            }
            .header-actions {
                display: flex !important;
                align-items: center !important;
                justify-content: center !important;
                gap: 1rem !important;
                order: 2 !important;
            }
            .mobile-controls {
                display: flex !important;
                align-items: center !important;
                justify-content: center !important;
                order: 2 !important;
            }
            .mobile-menu-btn, .search-toggle-btn, .cart-btn {
                display: inline-flex !important;
                align-items: center !important;
                justify-content: center !important;
                padding: 0.6rem !important;
                border-radius: 12px !important;
                background: rgba(255, 255, 255, 0.1) !important;
                border: 2px solid rgba(255, 255, 255, 0.2) !important;
                min-width: 48px !important;
                min-height: 48px !important;
            }
            .search-box {
                display: none !important;
            }
        }`;

const files = ['promotions.html', 'stores.html', 'news.html', 'community.html'];

files.forEach(filename => {
    const filePath = path.join(__dirname, filename);
    if (fs.existsSync(filePath)) {
        let content = fs.readFileSync(filePath, 'utf8');
        
        // Thêm mobile CSS vào style tag
        content = content.replace(
            /(<style>[\s\S]*?)(<\/style>)/,
            `$1${mobileCSS}$2`
        );
        
        // Cập nhật header structure
        content = content.replace(
            /<button class="mobile-menu-btn[^>]*>[\s\S]*?<\/button>\s*<nav class="nav"/,
            '<nav class="nav"'
        );
        
        content = content.replace(
            /(<\/nav>)\s*(<div class="header-actions"[\s\S]*?<\/div>)/,
            '$1\n                $2\n                <div class="mobile-controls">\n                    <button class="mobile-menu-btn text-white" onclick="toggleMobileMenu()">\n                        <i class="material-icons">menu</i>\n                    </button>\n                </div>'
        );
        
        fs.writeFileSync(filePath, content);
        console.log(`Updated ${filename}`);
    }
});

console.log('All HTML files updated successfully!');