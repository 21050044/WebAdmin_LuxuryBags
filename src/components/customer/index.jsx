import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { logout } from '../../api/login';
import {
  getAllCustomers,
  searchCustomers,
  createCustomer,
  updateCustomer,
  deleteCustomer
} from '../../api/customer';
import logoImg from '../../assets/logo.png';
import styles from './index.module.css';
import homeStyles from '../home/index.module.css';
import Sidebar from '../shared/Sidebar';

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
    search: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <circle cx="11" cy="11" r="8"></circle>
        <path d="m21 21-4.35-4.35"></path>
      </svg>
    ),
    plus: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <line x1="12" y1="5" x2="12" y2="19"></line>
        <line x1="5" y1="12" x2="19" y2="12"></line>
      </svg>
    ),
    edit: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
      </svg>
    ),
    trash: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <polyline points="3 6 5 6 21 6"></polyline>
        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
      </svg>
    ),
    phone: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
      </svg>
    ),
    mail: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
        <polyline points="22,6 12,13 2,6"></polyline>
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
    x: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
      </svg>
    ),
  };

  return icons[name] || null;
};

// Helper function để map data từ API sang format của component
const mapApiDataToState = (apiData) => {
  if (!apiData || !Array.isArray(apiData)) return [];

  return apiData.map(item => ({
    id: item.id, // ID thật từ backend (số)
    name: item.ho_ten || '',
    phone: item.so_dien_thoai || '',
    email: item.email || '',
    address: item.dia_chi || '',
    totalSpent: parseInt(item.tong_chi_tieu) || 0, // Convert string to number
    joinDate: item.ngay_tham_gia ? new Date(item.ngay_tham_gia).toLocaleDateString('vi-VN') : '',
    status: 'active' // Default status
  }));
};

const CustomerPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [userInfo, setUserInfo] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: ''
  });

  // Load danh sách khách hàng từ API
  const loadCustomers = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('[Customer] Đang tải danh sách khách hàng...');
      const result = await getAllCustomers();
      console.log('[Customer] API Response:', result);

      if (result.success) {
        const mappedData = mapApiDataToState(result.data);
        console.log('[Customer] Mapped Data:', mappedData);
        setCustomers(mappedData);
        setFilteredCustomers(mappedData);
      } else {
        console.error('[Customer] API Error:', result.error);
        setError(result.error || 'Không thể tải danh sách khách hàng');
      }
    } catch (err) {
      console.error('[Customer] Error loading customers:', err);
      setError('Đã xảy ra lỗi khi tải danh sách khách hàng');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const storedUserInfo = localStorage.getItem('user_info');
    if (storedUserInfo) {
      setUserInfo(JSON.parse(storedUserInfo));
    }

    // Load data từ API
    loadCustomers();
  }, []);

  // Hàm tìm kiếm khách hàng - chỉ gọi khi ấn Enter
  const handleSearch = async () => {
    if (searchTerm.trim()) {
      setLoading(true);
      try {
        const result = await searchCustomers(searchTerm);
        if (result.success) {
          // Lọc theo tên hoặc số điện thoại
          const filtered = result.data.filter(customer =>
            customer.ho_ten?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            customer.so_dien_thoai?.includes(searchTerm)
          );
          const mappedData = mapApiDataToState(filtered);
          setFilteredCustomers(mappedData);
        } else {
          setError(result.error || 'Không thể tìm kiếm khách hàng');
        }
      } catch (err) {
        console.error('Error searching customers:', err);
      } finally {
        setLoading(false);
      }
    } else {
      setFilteredCustomers(customers);
    }
  };

  // Xử lý khi nhấn phím trong ô tìm kiếm
  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };


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

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const handleAddCustomer = () => {
    setEditingCustomer(null);
    setFormData({ name: '', email: '', phone: '', address: '' });
    setShowAddModal(true);
  };

  const handleEditCustomer = (customer) => {
    setEditingCustomer(customer);
    setFormData({
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      address: customer.address
    });
    setShowAddModal(true);
  };

  const handleDeleteCustomer = async (customerId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa khách hàng này?')) {
      setLoading(true);
      try {
        const result = await deleteCustomer(customerId);
        if (result.success) {
          // Reload danh sách sau khi xóa thành công
          await loadCustomers();
        } else {
          alert('Lỗi khi xóa khách hàng: ' + (result.error || 'Unknown error'));
        }
      } catch (err) {
        console.error('Error deleting customer:', err);
        alert('Đã xảy ra lỗi khi xóa khách hàng');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSaveCustomer = async () => {
    // Validate: API yêu cầu ho_ten và so_dien_thoai bắt buộc
    if (!formData.name || !formData.phone) {
      alert('Vui lòng điền đầy đủ thông tin bắt buộc (Họ tên và Số điện thoại)');
      return;
    }

    setLoading(true);
    try {
      // Chuẩn bị data theo format API
      const apiData = {
        ho_ten: formData.name,
        so_dien_thoai: formData.phone,
        email: formData.email || '',
        dia_chi: formData.address || ''
      };

      let result;
      if (editingCustomer) {
        // Update existing customer
        result = await updateCustomer(editingCustomer.id, apiData);
      } else {
        // Add new customer
        result = await createCustomer(apiData);
      }

      if (result.success) {
        // Reload danh sách sau khi lưu thành công
        await loadCustomers();
        setShowAddModal(false);
        setFormData({ name: '', email: '', phone: '', address: '' });
        setEditingCustomer(null);
      } else {
        alert('Lỗi: ' + (result.error || 'Không thể lưu thông tin khách hàng'));
      }
    } catch (err) {
      console.error('Error saving customer:', err);
      alert('Đã xảy ra lỗi khi lưu thông tin khách hàng');
    } finally {
      setLoading(false);
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

  const menuItems = allMenuItems.filter(item => {
    if (userInfo?.role === 'STAFF') {
      return item.id !== 'home' && item.id !== 'invoices';
    }
    return true;
  });

  return (
    <div className={homeStyles.homeContainer}>
      {/* Sidebar */}
      <Sidebar activeMenu="customers" />

      {/* Main Content */}
      <main className={homeStyles.mainContent}>
        <header className={styles.header}>
          <div>
            <h1 className={styles.pageTitle}>Quản lý khách hàng</h1>
            <p className={styles.pageSubtitle}>Quản lý thông tin và lịch sử mua hàng của khách hàng</p>
          </div>
          <button className={styles.addButton} onClick={handleAddCustomer}>
            <Icon name="plus" size={18} />
            Thêm khách hàng
          </button>
        </header>

        {/* Top 5 Khách hàng chi tiêu nhiều nhất - Biểu đồ */}
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '16px 18px',
          marginBottom: '20px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
          border: '1px solid #f0f0f0'
        }}>
          <h3 style={{
            fontSize: '15px',
            fontWeight: '600',
            marginBottom: '14px',
            color: '#1f2937',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <span style={{ fontSize: '16px' }}>🏆</span>
            Top 5 Khách hàng chi tiêu nhiều nhất
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {(() => {
              const topCustomers = customers
                .sort((a, b) => b.totalSpent - a.totalSpent)
                .slice(0, 5);

              const maxSpent = topCustomers.length > 0 ? topCustomers[0].totalSpent : 1;

              return topCustomers.map((customer, index) => {
                const percentage = (customer.totalSpent / maxSpent) * 100;
                const colors = [
                  { bg: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)', solid: '#FFD700', text: '#854d0e' },  // Gold - vàng rực rỡ
                  { bg: 'linear-gradient(135deg, #C0C0C0 0%, #A8A8A8 100%)', solid: '#A8A8A8', text: '#374151' },  // Silver - bạc sáng
                  { bg: 'linear-gradient(135deg, #CD7F32 0%, #B87333 100%)', solid: '#CD7F32', text: '#ffffff' },  // Bronze - đồng đậm
                  { bg: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)', solid: '#8b5cf6', text: '#ffffff' },  // Violet
                  { bg: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)', solid: '#ec4899', text: '#ffffff' }   // Pink
                ];

                return (
                  <div key={customer.id}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '5px'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: 0 }}>
                        <span style={{
                          width: '28px',
                          height: '28px',
                          borderRadius: '50%',
                          background: colors[index].bg,
                          color: colors[index].text,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: '700',
                          fontSize: '13px',
                          flexShrink: 0,
                          boxShadow: index < 3 ? '0 2px 6px rgba(0,0,0,0.15)' : 'none'
                        }}>
                          {index + 1}
                        </span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{
                            fontWeight: '500',
                            color: '#374151',
                            fontSize: '13px',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }}>
                            {customer.name}
                          </div>
                          <div style={{
                            fontSize: '11px',
                            color: '#9ca3af'
                          }}>
                            {customer.phone}
                          </div>
                        </div>
                      </div>
                      <div style={{
                        fontWeight: '600',
                        color: '#1f2937',
                        fontSize: '13px',
                        marginLeft: '12px',
                        flexShrink: 0
                      }}>
                        {formatCurrency(customer.totalSpent)}
                      </div>
                    </div>

                    {/* Bar chart */}
                    <div style={{
                      width: '100%',
                      height: '6px',
                      background: '#f3f4f6',
                      borderRadius: '3px',
                      overflow: 'hidden',
                      position: 'relative'
                    }}>
                      <div style={{
                        width: `${percentage}%`,
                        height: '100%',
                        background: colors[index].bg,
                        borderRadius: '3px',
                        transition: 'width 0.8s ease-out'
                      }} />
                    </div>
                  </div>
                );
              });
            })()}

            {customers.length === 0 && (
              <div style={{
                textAlign: 'center',
                padding: '24px 16px',
                color: '#9ca3af',
                fontSize: '13px'
              }}>
                📊 Chưa có dữ liệu khách hàng
              </div>
            )}
          </div>
        </div>

        {/* Add keyframe animation for shine effect */}
        <style>{`
          @keyframes shine {
            0% { left: -100%; }
            20% { left: 100%; }
            100% { left: 100%; }
          }
        `}</style>

        {/* Search and Filter */}
        <div className={styles.searchSection}>
          <div className={styles.searchBox}>
            <Icon name="search" size={20} color="#6b7280" />
            <input
              type="text"
              placeholder="Nhập tên hoặc số điện thoại để tìm kiếm (Enter để tìm)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              className={styles.searchInput}
              disabled={loading}
            />
          </div>
        </div>

        {/* Loading Indicator */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '20px', color: '#6b7280' }}>
            Đang tải...
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div style={{
            padding: '15px',
            margin: '10px 0',
            background: '#fee2e2',
            color: '#dc2626',
            borderRadius: '8px',
            border: '1px solid #fecaca'
          }}>
            {error}
          </div>
        )}

        {/* Customers Table */}
        <div className={styles.tableCard}>
          <div className={styles.tableWrapper}>
            <table className={styles.dataTable}>
              <thead>
                <tr>
                  <th>Mã KH</th>
                  <th>Họ tên</th>
                  <th>Email</th>
                  <th>Số điện thoại</th>
                  <th>Địa chỉ</th>
                  <th>Tổng chi tiêu</th>
                  <th>Ngày tham gia</th>
                  <th>Trạng thái</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="9" className={styles.noData}>Đang tải...</td>
                  </tr>
                ) : filteredCustomers.length === 0 ? (
                  <tr>
                    <td colSpan="9" className={styles.noData}>Không tìm thấy khách hàng nào</td>
                  </tr>
                ) : (
                  filteredCustomers.map((customer) => (
                    <tr key={customer.id}>
                      <td>{customer.id}</td>
                      <td className={styles.nameCell}>{customer.name}</td>
                      <td>
                        <div className={styles.emailCell}>
                          <Icon name="mail" size={14} color="#6b7280" />
                          {customer.email}
                        </div>
                      </td>
                      <td>
                        <div className={styles.phoneCell}>
                          <Icon name="phone" size={14} color="#6b7280" />
                          {customer.phone}
                        </div>
                      </td>
                      <td className={styles.addressCell} title={customer.address}>{customer.address || '-'}</td>
                      <td className={styles.amountCell}>{formatCurrency(customer.totalSpent)}</td>
                      <td>{customer.joinDate}</td>
                      <td>
                        <span className={`${styles.statusBadge} ${customer.status === 'active' ? styles.statusActive : styles.statusInactive}`}>
                          {customer.status === 'active' ? 'Hoạt động' : 'Không hoạt động'}
                        </span>
                      </td>
                      <td>
                        <div className={styles.actionButtons}>
                          <button
                            className={styles.actionBtn}
                            onClick={() => handleEditCustomer(customer)}
                            title="Sửa"
                          >
                            <Icon name="edit" size={16} />
                          </button>
                          <button
                            className={`${styles.actionBtn} ${styles.deleteBtn}`}
                            onClick={() => handleDeleteCustomer(customer.id)}
                            title="Xóa"
                          >
                            <Icon name="trash" size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add/Edit Modal */}
        {showAddModal && (
          <div className={styles.modalOverlay}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
              <div className={styles.modalHeader}>
                <h2 className={styles.modalTitle}>
                  {editingCustomer ? 'Sửa thông tin khách hàng' : 'Thêm khách hàng mới'}
                </h2>
                <button
                  className={styles.closeBtn}
                  onClick={() => setShowAddModal(false)}
                  title="Đóng"
                >
                  <Icon name="x" size={20} />
                </button>
              </div>
              <div className={styles.modalForm}>
                <div className={styles.formGroup}>
                  <label>Họ tên *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Nhập họ tên"
                    disabled={loading}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="Nhập email"
                    disabled={loading}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Số điện thoại *</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="Nhập số điện thoại"
                    disabled={loading}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Địa chỉ</label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Nhập địa chỉ"
                    disabled={loading}
                  />
                </div>
              </div>
              <div className={styles.modalActions}>
                <button className={styles.cancelButton} onClick={() => setShowAddModal(false)} disabled={loading}>
                  Hủy
                </button>
                <button className={styles.saveButton} onClick={handleSaveCustomer} disabled={loading}>
                  {loading ? 'Đang xử lý...' : (editingCustomer ? 'Cập nhật' : 'Thêm mới')}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default CustomerPage;

