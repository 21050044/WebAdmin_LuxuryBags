import React, { useState, useEffect } from 'react';
import { useCart } from '../../components/product/Cart/CartContext';
import { convertGoogleDriveLink } from '../../api/products';
import { getAllInvoices, confirmInvoice, cancelInvoice, approveInvoice, startShippingInvoice, confirmDeliverySuccess } from '../../api/invoice';
import styles from './InvoiceManager.module.css';
import { useLocation, useNavigate } from 'react-router-dom';
import { logout } from '../../api/login';
import logoImg from '../../assets/logo.png';
import homeStyles from '../home/index.module.css';
import Sidebar from '../shared/Sidebar';

// Icon Helper
const Icon = ({ name, size = 18, className, color = 'currentColor', ...props }) => {
    const icons = {
        // Existing icons
        search: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>,
        fileText: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>,
        check: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>,
        x: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>,
        user: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>,
        phone: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>,
        mapPin: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>,
        calendar: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>,
        clock: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>,

        // Sidebar icons
        home: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>,
        bag: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>,
        users: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>,
        chart: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="20" x2="12" y2="10"></line><line x1="18" y1="20" x2="18" y2="4"></line><line x1="6" y1="20" x2="6" y2="16"></line></svg>,
        invoice: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>,
        sparkles: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v4m0 10v4M3 12h4m10 0h4M6.343 6.343l2.828 2.828m5.656 5.656l2.828 2.828M6.343 17.657l2.828-2.828m5.656-5.656l2.828-2.828"></path></svg>,
        truck: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg>,
        logout: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
    };
    return <span className={className}>{icons[name]}</span> || null;
};

const InvoiceManager = () => {
    const { updateInvoiceStatus } = useCart();
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);

    const [selectedInvoice, setSelectedInvoice] = useState(null);
    const [filterStatus, setFilterStatus] = useState('ALL');
    const [filterType, setFilterType] = useState('ALL'); // ONLINE, OFFLINE, ALL
    const [searchTerm, setSearchTerm] = useState('');

    // Navigation & Sidebar State
    const navigate = useNavigate();
    const location = useLocation();

    // Fetch Invoices from API
    const fetchInvoices = async () => {
        // Không set loading=true ở đây nữa để tránh nháy, chỉ dùng initial state

        try {
            // Gọi API với filter params
            const result = await getAllInvoices({
                loai: filterType,
                trang_thai: filterStatus,
                search: searchTerm,
            });
            if (result.success) {
                // Map API data to component state structure (API mới)
                const mappedInvoices = result.data.map(inv => ({
                    id: inv.ma_hoa_don,
                    pk: inv.id, // ID thực tế trong DB để gọi API
                    type: inv.loai_hoa_don, // ONLINE hoặc OFFLINE
                    status: getStatusDisplay(inv.trang_thai), // Convert code → display
                    statusCode: inv.trang_thai, // CHO_THANH_TOAN, HOAN_THANH, DA_HUY, CHO_XAC_NHAN, DANG_GIAO
                    date: inv.ngay_tao,
                    total: inv.tong_tien_hang,
                    discount: inv.giam_gia || 0,
                    finalTotal: inv.thanh_tien,
                    note: inv.ghi_chu || '',
                    customer: {
                        name: inv.ho_ten_nguoi_nhan || inv.ten_khach_hang || 'Khách vãng lai',
                        phone: inv.sdt_nguoi_nhan || inv.sdt_khach_hang || '---',
                        address: inv.dia_chi_giao_hang || '',
                    },
                    items: (inv.chi_tiet || []).map(item => ({
                        id: item.tui_xach || item.id,
                        name: item.ten_san_pham || item.tui_xach?.ten_tui || 'Sản phẩm',
                        image: item.anh_dai_dien || item.tui_xach?.hinh_anh || null,
                        price: item.don_gia_luc_ban,
                        quantity: item.so_luong,
                        subtotal: item.thanh_tien || (item.don_gia_luc_ban * item.so_luong)
                    }))
                }));
                setInvoices(mappedInvoices);

                // Update selected invoice if it exists
                if (selectedInvoice) {
                    const updatedSelected = mappedInvoices.find(inv => inv.id === selectedInvoice.id);
                    if (updatedSelected) {
                        setSelectedInvoice(updatedSelected);
                    } else {
                        setSelectedInvoice(null);
                    }
                } else if (mappedInvoices.length > 0) {
                    // Nếu chưa chọn gì và có list mới, chọn cái đầu (Logic cũ đã bỏ, nhưng nếu muốn auto-select thì thêm lại ở đây)
                    // Hiện tại giữ nguyên logic là không auto-select nếu user không yêu cầu
                }
            } else {
                setError(result.error);
            }
        } catch (err) {
            setError('Lỗi kết nối server');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // Helper: Convert status code to display text
    const getStatusDisplay = (code) => {
        const statusMap = {
            'CHO_XAC_NHAN': 'Chờ xác nhận',
            'DA_XAC_NHAN': 'Đã xác nhận',
            'DANG_GIAO': 'Đang vận chuyển',
            'HOAN_THANH': 'Đã hoàn thành',
            'DA_HUY': 'Đã hủy',
            'CHO_THANH_TOAN': 'Chờ thanh toán', // Giữ lại cho đơn cũ/offline nếu cần
        };
        return statusMap[code] || code;
    };

    // Re-fetch khi filter thay đổi
    useEffect(() => {
        fetchInvoices();
    }, [filterType, filterStatus]);

    useEffect(() => {
        // Nếu được redirect từ Cart với 1 invoiceId cụ thể, tự động chọn nó
        if (location.state?.newInvoiceId && invoices.length > 0) {
            const target = invoices.find(inv => inv.id === location.state.newInvoiceId);
            if (target) setSelectedInvoice(target);
        }
    }, [location.state, invoices]);

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

    const allMenuItems = [
        { id: 'home', icon: 'home', label: 'Trang chủ', path: '/home' },
        { id: 'products', icon: 'bag', label: 'Quản lý túi xách', path: '/products' },
        { id: 'customers', icon: 'users', label: 'Quản lý khách hàng', path: '/customers' },
        { id: 'sales', icon: 'chart', label: 'Quản lý buôn bán', path: '/sales' },
        { id: 'invoices', icon: 'invoice', label: 'Quản lý hóa đơn', path: '/invoices' },
        { id: 'ai-design', icon: 'sparkles', label: 'Thiết kế túi xách bằng AI', path: '/ai-design' },
    ];

    const userInfo = JSON.parse(localStorage.getItem('user_info') || '{}');
    const menuItems = allMenuItems.filter(item => {
        if (userInfo?.role === 'STAFF') {
            return item.id !== 'home' && item.id !== 'invoices';
        }
        return true;
    });

    const formatCurrency = (amount) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

    const formatDate = (dateString) => {
        if (!dateString) return '---';
        try {
            // Parse ISO 8601 format (e.g., "2025-12-20T07:55:02.374543Z")
            const date = new Date(dateString);
            if (isNaN(date.getTime())) {
                // If invalid, return as-is
                return dateString;
            }
            // Format to Vietnamese style: DD/MM/YYYY HH:mm
            const day = String(date.getDate()).padStart(2, '0');
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const year = date.getFullYear();
            const hours = String(date.getHours()).padStart(2, '0');
            const minutes = String(date.getMinutes()).padStart(2, '0');
            return `${day}/${month}/${year} ${hours}:${minutes}`;
        } catch (e) {
            return dateString;
        }
    };

    // Filter Logic (search đã được gửi lên API, nhưng có thể filter thêm client-side)
    const filteredInvoices = invoices.filter(inv => {
        const matchSearch = searchTerm === '' ||
            inv.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            inv.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            inv.customer.phone.includes(searchTerm);
        return matchSearch;
    });

    const getStatusColor = (status) => {
        // Map theo display text hoặc code (ở đây prop inv.status đã convert sang text display rồi, nhưng selectedInvoice có thể dùng code)
        // Tuy nhiên hàm fetchInvoices đã map inv.status = getStatusDisplay(code).
        // Nên tham số đầu vào ở đây là Text hiển thị (ví dụ "Chờ xác nhận").
        // Dựa vào text để map class CSS.

        switch (status) {
            case 'Chờ thanh toán': return styles.statusPending;
            case 'Chờ xác nhận': return styles.statusPending; // Màu vàng
            case 'Đã xác nhận': return styles.statusConfirmed; // Màu xanh dương
            case 'Đang vận chuyển': return styles.statusShipping; // Màu tím
            case 'Đã hoàn thành': return styles.statusCompleted; // Màu xanh lá
            case 'Đã hủy': return styles.statusCancelled; // Màu đỏ
            default: return '';
        }
    };

    const handleAction = async (action) => {
        if (!selectedInvoice) return;
        let result = { success: false, error: 'Unknown action' };

        // Confirmation before action
        if (action === 'pay' && !window.confirm('Xác nhận đã nhận tiền cho hóa đơn này?')) return;
        if (action === 'cancel' && !window.confirm('CẢNH BÁO: Bạn có chắc chắn muốn HỦY hóa đơn này? Hành động không thể hoàn tác.')) return;
        if (action === 'approve' && !window.confirm('Xác nhận duyệt đơn hàng này (Đơn sẽ chuyển sang Đã Xác Nhận / Đóng Gói)?')) return;
        if (action === 'ship' && !window.confirm('Xác nhận chuyển đơn hàng sang Đang Vận Chuyển?')) return;
        if (action === 'complete' && !window.confirm('Xác nhận đơn hàng đã giao thành công và hoàn tất?')) return;

        setSubmitting(true);
        try {
            if (action === 'pay') {
                result = await confirmInvoice(selectedInvoice.pk);
            } else if (action === 'cancel') {
                result = await cancelInvoice(selectedInvoice.pk);
            } else if (action === 'approve') {
                result = await approveInvoice(selectedInvoice.pk);
            } else if (action === 'ship') {
                result = await startShippingInvoice(selectedInvoice.pk);
            } else if (action === 'complete') {
                result = await confirmDeliverySuccess(selectedInvoice.pk);
            }

            if (result.success) {
                alert('Thao tác thành công!');
                fetchInvoices(); // Reload data
            } else {
                alert(`Lỗi: ${result.error}`);
            }
        } catch (err) {
            console.error(err);
            alert('Có lỗi xảy ra khi xử lý yêu cầu.');
        } finally {
            setSubmitting(false);
        }
    };

    // Main Content Component
    const InvoiceContent = () => {
        if (loading) {
            return <div className={styles.loadingState}>Đang tải dữ liệu...</div>;
        }

        if (error) {
            return <div className={styles.errorState}>Lỗi: {error}</div>;
        }



        return (
            <div className={styles.pageWrapper}>
                {/* HORIZONTAL TOOLBAR */}
                <div className={styles.toolbar}>
                    <h2 className={styles.pageTitle}>Quản lý hóa đơn</h2>
                    <div className={styles.toolbarFilters}>
                        <div className={styles.searchBox}>
                            <Icon name="search" className={styles.searchIcon} />
                            <input
                                type="text"
                                placeholder="Tìm theo Mã, Tên, SĐT..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && fetchInvoices()}
                            />
                        </div>

                        <div className={styles.filterGroup}>
                            <label className={styles.filterLabel}>Loại đơn:</label>
                            <select
                                className={styles.filterSelect}
                                value={filterType}
                                onChange={(e) => setFilterType(e.target.value)}
                            >
                                <option value="ALL">Tất cả</option>
                                <option value="ONLINE">Online</option>
                                <option value="OFFLINE">Tại quầy</option>
                            </select>
                        </div>

                        <div className={styles.filterGroup}>
                            <label className={styles.filterLabel}>Trạng thái:</label>
                            <select
                                className={styles.filterSelect}
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                            >
                                <option value="ALL">Tất cả</option>
                                <option value="CHO_XAC_NHAN">Chờ duyệt</option>
                                <option value="DA_XAC_NHAN">Đã xác nhận</option>
                                <option value="DANG_GIAO">Đang vận chuyển</option>
                                <option value="HOAN_THANH">Hoàn thành</option>
                                <option value="DA_HUY">Đã hủy</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* MASTER-DETAIL CONTAINER */}
                <div className={styles.container}>
                    {/* LEFT SIDEBAR: LIST */}
                    <div className={styles.sidebar}>
                        <div className={styles.invoiceList}>
                            {filteredInvoices.map(inv => (
                                <div
                                    key={inv.id}
                                    className={`${styles.invoiceCard} ${selectedInvoice?.id === inv.id ? styles.activeCard : ''}`}
                                    onClick={() => setSelectedInvoice(inv)}
                                >
                                    <div className={styles.cardHeader}>
                                        <span className={styles.cardId}>{inv.id}</span>
                                        <span className={styles.cardDate}>{formatDate(inv.date)}</span>
                                    </div>
                                    <div className={styles.cardBody}>
                                        <h4 className={styles.cardName}>{inv.customer.name}</h4>
                                        <span className={styles.cardTotal}>{formatCurrency(inv.finalTotal || inv.total)}</span>
                                    </div>
                                    <div className={styles.cardFooter}>
                                        <span className={`${styles.badge} ${inv.type === 'ONLINE' ? styles.badgeOnline : styles.badgeOffline}`}
                                            style={{ marginRight: '6px', fontSize: '11px' }}>
                                            {inv.type === 'ONLINE' ? 'Online' : 'Quầy'}
                                        </span>
                                        <span className={`${styles.badge} ${getStatusColor(inv.status)}`}>
                                            {inv.status}
                                        </span>
                                    </div>
                                </div>
                            ))}
                            {filteredInvoices.length === 0 && (
                                <div className={styles.noResult}>Không tìm thấy hóa đơn phù hợp</div>
                            )}
                        </div>
                    </div>

                    {/* MAIN CONTENT: DETAIL */}
                    <div className={styles.mainContent}>
                        {selectedInvoice ? (
                            <div className={styles.detailWrapper}>
                                {/* Header Detail */}
                                <div className={styles.detailHeader}>
                                    <div>
                                        <h1 className={styles.detailTitle}>Hóa đơn {selectedInvoice.id}</h1>
                                        <div className={styles.detailMeta}>
                                            <span className={styles.metaItem}>
                                                <Icon name="calendar" /> {formatDate(selectedInvoice.date)}
                                            </span>
                                            <span className={`${styles.badge} ${getStatusColor(selectedInvoice.status)}`}>
                                                {selectedInvoice.status}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    {(selectedInvoice.statusCode === 'CHO_THANH_TOAN' || selectedInvoice.statusCode === 'CHO_XAC_NHAN' || selectedInvoice.statusCode === 'DA_XAC_NHAN' || selectedInvoice.statusCode === 'DANG_GIAO') && (
                                        <div className={styles.actionButtons}>
                                            <button className={styles.btnCancel} onClick={() => handleAction('cancel')}>
                                                <Icon name="x" /> Hủy đơn
                                            </button>

                                            {selectedInvoice.statusCode === 'CHO_THANH_TOAN' && (
                                                <button className={styles.btnPay} onClick={() => handleAction('pay')}>
                                                    <Icon name="check" /> Thanh toán
                                                </button>
                                            )}

                                            {selectedInvoice.statusCode === 'CHO_XAC_NHAN' && (
                                                <button className={styles.btnPay} onClick={() => handleAction('approve')}>
                                                    <Icon name="check" /> Duyệt đơn
                                                </button>
                                            )}

                                            {selectedInvoice.statusCode === 'DA_XAC_NHAN' && (
                                                <button className={styles.btnPay} onClick={() => handleAction('ship')}>
                                                    <Icon name="truck" /> Giao hàng
                                                </button>
                                            )}

                                            {selectedInvoice.statusCode === 'DANG_GIAO' && (
                                                <button className={styles.btnPay} onClick={() => handleAction('complete')} style={{ backgroundColor: '#28a745' }}>
                                                    <Icon name="check" /> Hoàn thành
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>

                                <div className={styles.detailBody}>
                                    {/* Customer Info */}
                                    <div className={styles.section}>
                                        <h3 className={styles.sectionTitle}>Thông tin khách hàng</h3>
                                        <div className={styles.customerCard}>
                                            <div className={styles.customerRow}>
                                                <Icon name="user" />
                                                <div>
                                                    <span className={styles.label}>Họ tên:</span>
                                                    <span className={styles.value}>{selectedInvoice.customer.name}</span>
                                                </div>
                                            </div>
                                            <div className={styles.customerRow}>
                                                <Icon name="phone" />
                                                <div>
                                                    <span className={styles.label}>SĐT:</span>
                                                    <span className={styles.value}>{selectedInvoice.customer.phone}</span>
                                                </div>
                                            </div>
                                            <div className={styles.customerRow}>
                                                <Icon name="mapPin" />
                                                <div>
                                                    <span className={styles.label}>Địa chỉ:</span>
                                                    <span className={styles.value}>{selectedInvoice.customer.address}</span>
                                                </div>
                                            </div>
                                            {selectedInvoice.customer.note && (
                                                <div className={`${styles.customerRow} ${styles.noteRow}`}>
                                                    <span className={styles.label}>Ghi chú:</span>
                                                    <p className={styles.noteContent}>{selectedInvoice.customer.note}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Products List */}
                                    <div className={styles.section}>
                                        <h3 className={styles.sectionTitle}>Chi tiết sản phẩm</h3>
                                        <table className={styles.productTable}>
                                            <thead>
                                                <tr>
                                                    <th>Sản phẩm</th>
                                                    <th className="text-right">Đơn giá</th>
                                                    <th className="text-center">SL</th>
                                                    <th className="text-right">Thành tiền</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {selectedInvoice.items.map((item, idx) => (
                                                    <tr key={idx}>
                                                        <td>
                                                            <div className={styles.productCell}>
                                                                <div className={styles.productImg}>
                                                                    <img
                                                                        src={convertGoogleDriveLink(item.image)}
                                                                        onError={(e) => e.target.src = 'https://via.placeholder.com/40'}
                                                                        alt=""
                                                                    />
                                                                </div>
                                                                <div className={styles.productInfo}>
                                                                    <span className={styles.productName}>{item.name}</span>
                                                                    <span className={styles.sku}>ID: {item.id}</span>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="text-right">{formatCurrency(item.price)}</td>
                                                        <td className="text-center">{item.quantity}</td>
                                                        <td className="text-right font-bold">{formatCurrency(item.subtotal)}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                            <tfoot>
                                                <tr>
                                                    <td colSpan="3" className="text-right">Tạm tính:</td>
                                                    <td className="text-right">{formatCurrency(selectedInvoice.total)}</td>
                                                </tr>
                                                <tr>
                                                    <td colSpan="3" className="text-right">Giảm giá:</td>
                                                    <td className="text-right">{formatCurrency(selectedInvoice.discount)}</td>
                                                </tr>
                                                <tr className={styles.totalRow}>
                                                    <td colSpan="3" className="text-right">Tổng cộng:</td>
                                                    <td className={styles.finalTotal}>{formatCurrency(selectedInvoice.finalTotal || (selectedInvoice.total - selectedInvoice.discount))}</td>
                                                </tr>
                                            </tfoot>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className={styles.selectPrompt}>
                                <p>Chọn một hóa đơn để xem chi tiết</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className={homeStyles.homeContainer}>
            {submitting && <div className={styles.loadingOverlay}>Đang xử lý...</div>}
            {/* Sidebar */}
            <Sidebar activeMenu="invoices" />

            {/* Main Content Wrapper */}
            <main className={homeStyles.mainContent}>
                {InvoiceContent()}
            </main>
        </div>
    );
};

export default InvoiceManager;