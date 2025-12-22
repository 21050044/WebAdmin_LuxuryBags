import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { logout } from '../../api/login';
import { getSalesOverview, getRevenueChart, getCategoryChart, getExportData } from '../../api/sales';
import styles from './index.module.css';
import homeStyles from '../home/index.module.css';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import Sidebar from '../shared/Sidebar';

// SVG Icon Components
const Icon = ({ name, size = 20, color = 'currentColor', ...props }) => {
  const icons = {
    home: (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>),
    bag: (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>),
    users: (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>),
    chart: (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><line x1="12" y1="20" x2="12" y2="10"></line><line x1="18" y1="20" x2="18" y2="4"></line><line x1="6" y1="20" x2="6" y2="16"></line></svg>),
    sparkles: (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M12 3v4m0 10v4M3 12h4m10 0h4M6.343 6.343l2.828 2.828m5.656 5.656l2.828 2.828M6.343 17.657l2.828-2.828m5.656-5.656l2.828-2.828"></path></svg>),
    logout: (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>),
    invoice: (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>),
    calendar: (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>),
    dollar: (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>),
    download: (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>),
    trendingUp: (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>),
  };
  return icons[name] || null;
};

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658'];

const SalesPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  // Date filter: Default last 30 days
  const today = new Date().toISOString().split('T')[0];
  const last30Days = new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0];

  const [dateRange, setDateRange] = useState({
    from: last30Days,
    to: today
  });

  const [overview, setOverview] = useState({
    ky_nay: { doanh_thu: 0, range: '' },
    ky_truoc: { doanh_thu: 0, range: '' },
    tang_truong: 0
  });

  const [revenueData, setRevenueData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);

  useEffect(() => {
    fetchData();
  }, [dateRange]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = { from_date: dateRange.from, to_date: dateRange.to };

      const [ovRes, revRes, catRes] = await Promise.all([
        getSalesOverview(params),
        getRevenueChart(params),
        getCategoryChart(params)
      ]);

      if (ovRes.success) setOverview(ovRes.data);
      if (revRes.success) setRevenueData(revRes.data);
      if (catRes.success) setCategoryData(catRes.data);

    } catch (error) {
      console.error('Lỗi tải dữ liệu thống kê:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const params = { from_date: dateRange.from, to_date: dateRange.to };
      const result = await getExportData(params);

      if (result.success && result.data.length > 0) {
        // Dynamically import xlsx library
        const XLSX = await import('xlsx');

        // Create worksheet from JSON data
        const worksheet = XLSX.utils.json_to_sheet(result.data);

        // Set column widths for better readability
        const columnWidths = [
          { wch: 18 },  // Mã HĐ
          { wch: 18 },  // Ngày GD
          { wch: 20 },  // Khách Hàng
          { wch: 12 },  // SĐT
          { wch: 15 },  // Tổng Tiền
          { wch: 12 },  // Giảm Giá
          { wch: 15 },  // Thực Thu
          { wch: 12 },  // Loại Đơn
          { wch: 12 },  // Người Tạo
        ];
        worksheet['!cols'] = columnWidths;

        // Create workbook and add worksheet
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Báo cáo doanh thu');

        // Generate filename from API response or default
        const fileName = result.fileName || `Bao_Cao_Doanh_Thu_${dateRange.from}_${dateRange.to}.xlsx`;

        // Download file
        XLSX.writeFile(workbook, fileName);
      } else {
        alert('Không có dữ liệu để xuất hoặc lỗi API');
      }
    } catch (error) {
      console.error('Lỗi xuất Excel:', error);
      alert('Đã xảy ra lỗi khi xuất file');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
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

  return (
    <div className={homeStyles.homeContainer}>
      {/* Sidebar */}
      <Sidebar activeMenu="sales" />

      {/* Main Content */}
      <main className={homeStyles.mainContent}>
        <header className={styles.header}>
          <div>
            <h1 className={styles.pageTitle}>Thống kê doanh thu</h1>
            <p className={styles.pageSubtitle}>Theo dõi hiệu quả kinh doanh của cửa hàng</p>
          </div>

          <div className={styles.filterGroup}>
            <div className={styles.datePicker}>
              <label>Từ ngày:</label>
              <input
                type="date"
                value={dateRange.from}
                onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
              />
            </div>
            <div className={styles.datePicker}>
              <label>Đến ngày:</label>
              <input
                type="date"
                value={dateRange.to}
                onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
              />
            </div>
            <button className={styles.exportBtn} onClick={handleExport}>
              <Icon name="download" size={18} />
              Xuất báo cáo (.xlsx)
            </button>
          </div>
        </header>

        {loading ? (
          <div style={{ padding: 20, textAlign: 'center' }}>Đang tải dữ liệu thống kê...</div>
        ) : (
          <>
            {/* Overview Cards */}
            <div className={styles.statsGrid}>
              <div className={styles.statCard}>
                <div className={styles.statIcon} style={{ background: '#dbeafe', color: '#1d4ed8' }}>
                  <Icon name="dollar" size={28} />
                </div>
                <div className={styles.statContent}>
                  <p className={styles.statLabel}>Doanh thu kỳ này</p>
                  <h3 className={styles.statValue}>{formatCurrency(overview.ky_nay?.doanh_thu || 0)}</h3>
                  <p className={styles.statChange}>
                    {overview.ky_nay?.range}
                  </p>
                </div>
              </div>

              <div className={styles.statCard}>
                <div className={styles.statIcon} style={{ background: '#f3f4f6', color: '#4b5563' }}>
                  <Icon name="calendar" size={28} />
                </div>
                <div className={styles.statContent}>
                  <p className={styles.statLabel}>Doanh thu kỳ trước</p>
                  <h3 className={styles.statValue} style={{ color: '#6b7280' }}>{formatCurrency(overview.ky_truoc?.doanh_thu || 0)}</h3>
                  <p className={styles.statChange}>
                    {overview.ky_truoc?.range}
                  </p>
                </div>
              </div>

              <div className={styles.statCard}>
                <div className={styles.statIcon} style={{ background: overview.tang_truong >= 0 ? '#d1fae5' : '#fee2e2', color: overview.tang_truong >= 0 ? '#059669' : '#b91c1c' }}>
                  <Icon name="trendingUp" size={28} style={{ transform: overview.tang_truong < 0 ? 'scaleY(-1)' : 'none' }} />
                </div>
                <div className={styles.statContent}>
                  <p className={styles.statLabel}>Tăng trưởng</p>
                  <h3 className={`${styles.statValue} ${overview.tang_truong >= 0 ? styles.textSuccess : styles.textDanger}`}>
                    {overview.tang_truong > 0 ? '+' : ''}{overview.tang_truong}%
                  </h3>
                  <p className={styles.statChange}>So với kỳ trước</p>
                </div>
              </div>
            </div>

            {/* Charts Section */}
            <div className={styles.chartsRow}>
              {/* Bar Chart: Revenue by Date */}
              <div className={styles.chartCard}>
                <h3 className={styles.chartTitle}>Biểu đồ doanh thu theo ngày</h3>
                <div style={{ width: '100%', height: 300 }}>
                  <ResponsiveContainer>
                    <BarChart data={revenueData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis
                        dataKey="date"
                        tickFormatter={(str) => {
                          const d = new Date(str);
                          return `${d.getDate()}/${d.getMonth() + 1}`;
                        }}
                        fontSize={12}
                      />
                      <YAxis
                        tickFormatter={(val) => val >= 1000000 ? `${val / 1000000}M` : `${val / 1000}k`}
                        fontSize={12}
                      />
                      <Tooltip
                        formatter={(value) => formatCurrency(value)}
                        labelFormatter={(label) => `Ngày: ${label}`}
                      />
                      <Bar dataKey="doanh_thu" fill="#8884d8" name="Doanh thu" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Pie Chart: Revenue by Category */}
              <div className={styles.chartCard} style={{ flex: '0 0 35%' }}>
                <h3 className={styles.chartTitle}>Tỷ trọng danh mục</h3>
                <div style={{ width: '100%', height: 300 }}>
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        fill="#8884d8"
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => formatCurrency(value)} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default SalesPage;
// Base64 placeholder image (gray background with "No Image" text)


