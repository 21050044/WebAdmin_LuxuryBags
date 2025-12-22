import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts';
import logoImg from '../../assets/logo.png';
import styles from './index.module.css';
import { logout } from '../../api/login';
import { getDashboardData } from '../../api/dashboard';
import { getGoogleDriveThumbnail } from '../../api/products';
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
    package: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <line x1="16.5" y1="9.4" x2="7.5" y2="4.21"></line>
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
        <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
        <line x1="12" y1="22.08" x2="12" y2="12"></line>
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
    refresh: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <polyline points="23 4 23 10 17 10"></polyline>
        <polyline points="1 20 1 14 7 14"></polyline>
        <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
      </svg>
    ),
    trendingUp: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
        <polyline points="17 6 23 6 23 12"></polyline>
      </svg>
    ),
    trendingDown: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <polyline points="23 18 13.5 8.5 8.5 13.5 1 6"></polyline>
        <polyline points="17 18 23 18 23 12"></polyline>
      </svg>
    ),
    dollarSign: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <line x1="12" y1="1" x2="12" y2="23"></line>
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
      </svg>
    ),
    shoppingCart: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <circle cx="9" cy="21" r="1"></circle>
        <circle cx="20" cy="21" r="1"></circle>
        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
      </svg>
    ),
    clock: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <circle cx="12" cy="12" r="10"></circle>
        <polyline points="12 6 12 12 16 14"></polyline>
      </svg>
    ),
    award: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <circle cx="12" cy="8" r="7"></circle>
        <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline>
      </svg>
    ),
    alertCircle: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="8" x2="12" y2="12"></line>
        <line x1="12" y1="16" x2="12.01" y2="16"></line>
      </svg>
    ),
  };

  return icons[name] || null;
};

const HomePage = () => {
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState(() => {
    const stored = localStorage.getItem('user_info');
    return stored ? JSON.parse(stored) : null;
  });
  const [greeting, setGreeting] = useState('');

  // Dashboard data state (API mới)
  const [dashboardData, setDashboardData] = useState({
    overviewToday: {
      doanhThu: 0,
      donMoiOnline: 0,
      tongDonHang: 0,
    },
    growthChart: {
      labels: [],
      data: [],
      growthRate: 0,
    },
    revenueAnalysis: {
      online: { revenue: 0, orders: 0 },
      offline: { revenue: 0, orders: 0 },
    },
    topProducts: {
      bestSellers: [],
      slowSellers: [],
    },
  });

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Fetch dashboard data function
  const fetchDashboardData = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      const result = await getDashboardData();
      if (result.success) {
        setDashboardData(result.data);
        setLastUpdated(new Date());
      } else {
        setError(result.error || 'Không thể tải dữ liệu dashboard');
      }
    } catch (err) {
      setError('Đã xảy ra lỗi khi tải dữ liệu');
      console.error('Dashboard fetch error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Initial load & visibility change listener
  useEffect(() => {
    // User info is already initialized

    const hour = new Date().getHours();
    if (hour < 12) {
      setGreeting('Chào buổi sáng');
    } else if (hour < 18) {
      setGreeting('Chào buổi chiều');
    } else {
      setGreeting('Chào buổi tối');
    }

    // Fetch data lần đầu
    fetchDashboardData();

    // Visibility change listener - refresh khi user quay lại tab
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchDashboardData(true);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [fetchDashboardData]);

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

  const handleRefresh = () => {
    fetchDashboardData(true);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const formatShortCurrency = (amount) => {
    if (amount >= 1000000000) {
      return `${(amount / 1000000000).toFixed(1)}B`;
    } else if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(1)}M`;
    } else if (amount >= 1000) {
      return `${(amount / 1000).toFixed(0)}K`;
    }
    return amount.toString();
  };

  const formatTime = (date) => {
    if (!date) return '';
    return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  };

  // Prepare data for Growth Chart (Area Chart - 7 ngày)
  const growthChartData = dashboardData.growthChart.labels.map((label, index) => ({
    name: label,
    revenue: dashboardData.growthChart.data[index],
  }));

  // Prepare data for Revenue Pie Chart
  const totalRevenue = dashboardData.revenueAnalysis.online.revenue + dashboardData.revenueAnalysis.offline.revenue;
  const revenuePieData = [
    {
      name: 'Online',
      value: dashboardData.revenueAnalysis.online.revenue,
      orders: dashboardData.revenueAnalysis.online.orders,
      color: '#3b82f6',
    },
    {
      name: 'Tại quầy',
      value: dashboardData.revenueAnalysis.offline.revenue,
      orders: dashboardData.revenueAnalysis.offline.orders,
      color: '#10b981',
    },
  ];

  // Growth rate display
  const growthRate = dashboardData.growthChart.growthRate;
  const isPositiveGrowth = growthRate > 0;
  const isNeutralGrowth = growthRate === 0;

  // Custom tooltip for currency
  const CustomCurrencyTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className={styles.customTooltip}>
          <p className={styles.tooltipLabel}>{label}</p>
          <p className={styles.tooltipValue}>
            {formatCurrency(payload[0].value)}
          </p>
        </div>
      );
    }
    return null;
  };

  // Get rank class
  const getRankClass = (index) => {
    if (index === 0) return styles.gold;
    if (index === 1) return styles.silver;
    if (index === 2) return styles.bronze;
    return styles.normal;
  };

  // Pie chart colors
  const PIE_COLORS = ['#7c3aed', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#8b5cf6', '#06b6d4'];

  // Prepare data for Best Sellers Pie Chart
  const bestSellersPieData = dashboardData.topProducts.bestSellers.map((product, index) => ({
    name: product.tenTui,
    fullName: product.tenTui,
    value: product.daBan,
    color: PIE_COLORS[index % PIE_COLORS.length],
  }));

  // Prepare data for Slow Sellers Pie Chart  
  const slowSellersPieData = dashboardData.topProducts.slowSellers.map((product, index) => ({
    name: product.tenTui,
    fullName: product.tenTui,
    value: product.tonKho,
    color: PIE_COLORS[index % PIE_COLORS.length],
  }));

  return (
    <div className={styles.homeContainer}>
      {/* Sidebar */}
      <Sidebar activeMenu="home" />

      {/* Main Content */}
      <main className={styles.mainContent}>
        {/* Header */}
        <header className={styles.header}>
          <div className={styles.greetingSection}>
            <h1 className={styles.greetingTitle}>
              {greeting}, {userInfo?.ho_va_ten || userInfo?.username || 'Người dùng'}! 👋
            </h1>
            <p className={styles.greetingSubtitle}>
              Tổng quan hoạt động cửa hàng hôm nay
            </p>
          </div>
          <div className={styles.headerRight}>
            <div className={styles.userAvatar}>
              {(userInfo?.ho_va_ten || userInfo?.username || 'U').charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        {/* Loading & Error States */}
        {loading ? (
          <div className={styles.loadingContainer}>
            <p>Đang tải dữ liệu...</p>
          </div>
        ) : error ? (
          <div className={styles.errorContainer}>
            <p>Lỗi: {error}</p>
            <button className={styles.refreshBtn} onClick={() => fetchDashboardData()}>
              Thử lại
            </button>
          </div>
        ) : (
          <>
            {/* Overview Cards - Hôm nay */}
            <div className={styles.overviewGrid}>
              <div className={`${styles.overviewCard} ${styles.revenue}`}>
                <div className={styles.overviewCardIcon}>
                  <Icon name="dollarSign" size={22} />
                </div>
                <p className={styles.overviewCardLabel}>Doanh thu hôm nay</p>
                <h3 className={styles.overviewCardValue}>
                  {formatCurrency(dashboardData.overviewToday.doanhThu)}
                </h3>
              </div>

              <div className={`${styles.overviewCard} ${styles.orders}`}>
                <div className={styles.overviewCardIcon}>
                  <Icon name="shoppingCart" size={22} />
                </div>
                <p className={styles.overviewCardLabel}>Tổng đơn hôm nay</p>
                <h3 className={styles.overviewCardValue}>
                  {dashboardData.overviewToday.tongDonHang} đơn
                </h3>
              </div>

              <div className={`${styles.overviewCard} ${styles.pending}`}>
                <div className={styles.overviewCardIcon}>
                  <Icon name="clock" size={22} />
                </div>
                <p className={styles.overviewCardLabel}>Đơn online chờ duyệt</p>
                <h3 className={styles.overviewCardValue}>
                  {dashboardData.overviewToday.donMoiOnline} đơn
                </h3>
              </div>
            </div>

            {/* Growth Chart - 7 ngày */}
            <div className={styles.chartCard}>
              <div className={styles.chartHeader}>
                <div className={styles.chartHeaderWithBadge}>
                  <h3 className={styles.chartTitle}>Doanh thu 7 ngày gần nhất</h3>
                  <div className={`${styles.growthBadge} ${isNeutralGrowth ? styles.neutral : isPositiveGrowth ? styles.positive : styles.negative}`}>
                    <Icon
                      name={isPositiveGrowth ? 'trendingUp' : 'trendingDown'}
                      size={14}
                    />
                    {isPositiveGrowth ? '+' : ''}{growthRate}% so hôm qua
                  </div>
                </div>
              </div>

              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={growthChartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis
                    dataKey="name"
                    stroke="#6b7280"
                    style={{ fontSize: '13px', fontWeight: 500 }}
                  />
                  <YAxis
                    stroke="#6b7280"
                    style={{ fontSize: '13px', fontWeight: 500 }}
                    tickFormatter={(value) => formatShortCurrency(value)}
                  />
                  <Tooltip content={<CustomCurrencyTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#7c3aed"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorRevenue)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Revenue Analysis & Top Products - 2 columns */}
            <div className={styles.chartsRow}>
              {/* Revenue Pie Chart */}
              <div className={styles.chartCard}>
                <h3 className={styles.chartTitle}>Phân tích nguồn thu tháng này</h3>
                <div className={styles.revenuePieContainer}>
                  <ResponsiveContainer width={200} height={200}>
                    <PieChart>
                      <Pie
                        data={revenuePieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {revenuePieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value) => formatCurrency(value)}
                      />
                    </PieChart>
                  </ResponsiveContainer>

                  <div className={styles.revenueLegend}>
                    {revenuePieData.map((item, index) => (
                      <div key={index} className={styles.legendItem}>
                        <div className={styles.legendDot} style={{ backgroundColor: item.color }}></div>
                        <div className={styles.legendInfo}>
                          <span className={styles.legendLabel}>{item.name}</span>
                          <span className={styles.legendValue}>{formatCurrency(item.value)}</span>
                          <span className={styles.legendOrders}>{item.orders} đơn hàng</span>
                        </div>
                      </div>
                    ))}
                    <div className={styles.legendItem} style={{ marginTop: '8px', paddingTop: '12px', borderTop: '1px solid #e5e7eb' }}>
                      <div className={styles.legendInfo}>
                        <span className={styles.legendLabel}>Tổng cộng</span>
                        <span className={styles.legendValue}>{formatCurrency(totalRevenue)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Top Best Sellers - Pie Chart */}
              <div className={styles.chartCard}>
                <h3 className={styles.chartTitle}>
                  <Icon name="award" size={18} color="#f59e0b" /> Top sản phẩm bán chạy
                </h3>
                {bestSellersPieData.length > 0 ? (
                  <div className={styles.revenuePieContainer}>
                    <ResponsiveContainer width={160} height={160}>
                      <PieChart>
                        <Pie
                          data={bestSellersPieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={0}
                          outerRadius={70}
                          dataKey="value"
                          stroke="#fff"
                          strokeWidth={1}
                        >
                          {bestSellersPieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value, name, props) => [`${value} sản phẩm`, props.payload.fullName]} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className={styles.revenueLegend}>
                      {bestSellersPieData.map((item, index) => (
                        <div key={index} className={styles.legendItem}>
                          <div className={styles.legendDot} style={{ backgroundColor: item.color }}></div>
                          <div className={styles.legendInfo}>
                            <span className={styles.legendLabel}>{item.name}</span>
                            <span className={styles.legendOrders}>Đã bán: {item.value}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p style={{ color: '#9ca3af', textAlign: 'center', padding: '20px' }}>
                    Chưa có dữ liệu
                  </p>
                )}
              </div>
            </div>

            {/* Slow Sellers - Pie Chart */}
            <div className={styles.chartCard}>
              <h3 className={styles.chartTitle}>
                <Icon name="alertCircle" size={18} color="#ef4444" /> Sản phẩm bán chậm (cần quan tâm)
              </h3>
              {slowSellersPieData.length > 0 ? (
                <div className={styles.revenuePieContainer}>
                  <ResponsiveContainer width={160} height={160}>
                    <PieChart>
                      <Pie
                        data={slowSellersPieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={0}
                        outerRadius={70}
                        dataKey="value"
                        stroke="#fff"
                        strokeWidth={1}
                      >
                        {slowSellersPieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value, name, props) => [`Tồn kho: ${value}`, props.payload.fullName]} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className={styles.revenueLegend}>
                    {slowSellersPieData.map((item, index) => (
                      <div key={index} className={styles.legendItem}>
                        <div className={styles.legendDot} style={{ backgroundColor: item.color }}></div>
                        <div className={styles.legendInfo}>
                          <span className={styles.legendLabel}>{item.name}</span>
                          <span className={styles.legendOrders}>Tồn kho: {item.value}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p style={{ color: '#9ca3af', textAlign: 'center', padding: '20px' }}>
                  Chưa có dữ liệu
                </p>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default HomePage;