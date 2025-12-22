import config from '../config/config';

/**
 * Lấy access token từ localStorage
 */
const getAccessToken = () => {
  return localStorage.getItem('access_token');
};

/**
 * API lấy dữ liệu dashboard summary
 * @returns {Promise} Promise chứa dữ liệu dashboard
 */
export const getDashboardData = async () => {
  try {
    const token = getAccessToken();
    if (!token) {
      throw new Error('Không tìm thấy access token');
    }

    const response = await fetch(config.getApiUrl(config.API_ENDPOINTS.DASHBOARD), {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    // Map data từ API mới
    return {
      success: true,
      data: {
        // Overview hôm nay
        overviewToday: {
          doanhThu: data.overview_today?.doanh_thu || 0,
          donMoiOnline: data.overview_today?.don_moi_online || 0,
          tongDonHang: data.overview_today?.tong_don_hang || 0,
        },
        // Dữ liệu biểu đồ 7 ngày
        growthChart: {
          labels: data.growth_chart?.labels || [],
          data: data.growth_chart?.data || [],
          growthRate: data.growth_chart?.growth_rate || 0,
        },
        // Phân tích nguồn thu
        revenueAnalysis: {
          online: {
            revenue: data.revenue_analysis?.ONLINE?.revenue || 0,
            orders: data.revenue_analysis?.ONLINE?.orders || 0,
          },
          offline: {
            revenue: data.revenue_analysis?.OFFLINE?.revenue || 0,
            orders: data.revenue_analysis?.OFFLINE?.orders || 0,
          },
        },
        // Top sản phẩm
        topProducts: {
          bestSellers: Array.isArray(data.top_products?.best_sellers)
            ? data.top_products.best_sellers.map(p => ({
              id: p.id,
              tenTui: p.ten_tui,
              daBan: p.da_ban,
              tonKho: p.ton_kho,
              anhDaiDien: p.anh_dai_dien,
            }))
            : [],
          slowSellers: Array.isArray(data.top_products?.slow_sellers)
            ? data.top_products.slow_sellers.map(p => ({
              id: p.id,
              tenTui: p.ten_tui,
              daBan: p.da_ban,
              tonKho: p.ton_kho,
              anhDaiDien: p.anh_dai_dien,
            }))
            : [],
        },
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Đã xảy ra lỗi khi lấy dữ liệu dashboard',
    };
  }
};
