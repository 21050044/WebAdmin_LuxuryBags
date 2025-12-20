import React from 'react';
import { useNavigate } from 'react-router-dom';
import { logout } from '../../api/login';
import logoImg from '../../assets/logo.png';
import styles from '../home/index.module.css';

// SVG Icon Components
const Icon = ({ name, size = 20, color = 'currentColor', ...props }) => {
    const icons = {
        home: (
            <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                <polyline points="9 22 9 12 15 12 15 22"></polyline>
            </svg>
        ),
        bag: (
            <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <path d="M16 10a4 4 0 0 1-8 0"></path>
            </svg>
        ),
        users: (
            <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
        ),
        chart: (
            <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
                <line x1="12" y1="20" x2="12" y2="10"></line>
                <line x1="18" y1="20" x2="18" y2="4"></line>
                <line x1="6" y1="20" x2="6" y2="16"></line>
            </svg>
        ),
        sparkles: (
            <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
                <path d="M12 3v4m0 10v4M3 12h4m10 0h4M6.343 6.343l2.828 2.828m5.656 5.656l2.828 2.828M6.343 17.657l2.828-2.828m5.656-5.656l2.828-2.828"></path>
            </svg>
        ),
        logout: (
            <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                <polyline points="16 17 21 12 16 7"></polyline>
                <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
        ),
        invoice: (
            <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
                <polyline points="10 9 9 9 8 9"></polyline>
            </svg>
        ),
    };

    return icons[name] || null;
};

// Menu items configuration
const allMenuItems = [
    { id: 'home', icon: 'home', label: 'Trang chủ', path: '/home' },
    { id: 'products', icon: 'bag', label: 'Quản lý túi xách', path: '/products' },
    { id: 'customers', icon: 'users', label: 'Quản lý khách hàng', path: '/customers' },
    { id: 'sales', icon: 'chart', label: 'Thống kê doanh thu', path: '/sales' },
    { id: 'invoices', icon: 'invoice', label: 'Quản lý hóa đơn', path: '/invoices' },
    { id: 'ai-design', icon: 'sparkles', label: 'Thiết kế túi xách bằng AI', path: '/ai-design' },
];

/**
 * Shared Sidebar Component
 * @param {string} activeMenu - Current active menu item id
 */
const Sidebar = ({ activeMenu }) => {
    const navigate = useNavigate();

    // Get user info from localStorage for role-based filtering
    const userInfo = JSON.parse(localStorage.getItem('user_info') || '{}');

    // Filter menu items based on role
    const menuItems = allMenuItems.filter(item => {
        if (userInfo?.role === 'STAFF') {
            return item.id !== 'home' && item.id !== 'sales';
        }
        return true;
    });

    const handleLogout = async () => {
        try {
            const accessToken = localStorage.getItem('access_token');
            const refreshToken = localStorage.getItem('refresh_token');

            if (accessToken && refreshToken) {
                const result = await logout(accessToken, refreshToken);
                if (!result.success) {
                    console.error('Logout API error:', result.error);
                }
            }

            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            localStorage.removeItem('user_info');
            navigate('/login', { replace: true });
        } catch (error) {
            console.error('Logout error:', error);
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            localStorage.removeItem('user_info');
            navigate('/login', { replace: true });
        }
    };

    const handleMenuClick = (path) => {
        navigate(path);
    };

    return (
        <aside className={styles.sidebar}>
            {/* Logo Section */}
            <div className={styles.logoSection}>
                <img src={logoImg} alt="Luxury Bags" className={styles.logo} />
            </div>

            {/* Menu Items */}
            <nav className={styles.menuNav}>
                {menuItems.map((item) => (
                    <div
                        key={item.id}
                        className={`${styles.menuItem} ${activeMenu === item.id ? styles.menuItemActive : ''}`}
                        onClick={() => handleMenuClick(item.path)}
                    >
                        <span className={styles.menuIcon}>
                            <Icon name={item.icon} size={20} />
                        </span>
                        <span className={styles.menuLabel}>{item.label}</span>
                    </div>
                ))}
            </nav>

            {/* Logout Button */}
            <div className={styles.logoutSection}>
                <button className={styles.logoutBtn} onClick={handleLogout}>
                    <span className={styles.menuIcon}>
                        <Icon name="logout" size={20} />
                    </span>
                    <span>Đăng xuất</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
