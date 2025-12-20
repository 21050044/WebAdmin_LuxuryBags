import config from '../config/config';

/**
 * Lấy access token từ localStorage
 */
const getAccessToken = () => {
    return localStorage.getItem('access_token');
};

/**
 * API lấy tổng quan doanh thu (Kỳ này vs Kỳ trước)
 * Endpoint: /api/thong-ke/tong_quan/
 */
export const getSalesOverview = async (params = {}) => {
    try {
        const token = getAccessToken();
        if (!token) throw new Error('Không tìm thấy access token');

        const url = new URL(config.getApiUrl(`${config.API_ENDPOINTS.SALES_STATS}tong_quan/`));
        if (params.from_date) url.searchParams.append('from_date', params.from_date);
        if (params.to_date) url.searchParams.append('to_date', params.to_date);

        const response = await fetch(url.toString(), {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Lỗi lấy dữ liệu tổng quan');

        return { success: true, data };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

/**
 * API lấy biểu đồ cột (Doanh thu theo ngày)
 * Endpoint: /api/thong-ke/bieu_do_cot/
 */
export const getRevenueChart = async (params = {}) => {
    try {
        const token = getAccessToken();
        if (!token) throw new Error('Không tìm thấy access token');

        const url = new URL(config.getApiUrl(`${config.API_ENDPOINTS.SALES_STATS}bieu_do_cot/`));
        if (params.from_date) url.searchParams.append('from_date', params.from_date);
        if (params.to_date) url.searchParams.append('to_date', params.to_date);

        const response = await fetch(url.toString(), {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Lỗi lấy dữ liệu biểu đồ cột');

        return { success: true, data: data.data };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

/**
 * API lấy biểu đồ tròn (Tỷ trọng danh mục)
 * Endpoint: /api/thong-ke/bieu_do_tron/
 */
export const getCategoryChart = async (params = {}) => {
    try {
        const token = getAccessToken();
        if (!token) throw new Error('Không tìm thấy access token');

        const url = new URL(config.getApiUrl(`${config.API_ENDPOINTS.SALES_STATS}bieu_do_tron/`));
        if (params.from_date) url.searchParams.append('from_date', params.from_date);
        if (params.to_date) url.searchParams.append('to_date', params.to_date);

        const response = await fetch(url.toString(), {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Lỗi lấy dữ liệu biểu đồ tròn');

        return { success: true, data: data.data };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

/**
 * API lấy dữ liệu xuất Excel
 * Endpoint: /api/thong-ke/du_lieu_xuat_excel/
 */
export const getExportData = async (params = {}) => {
    try {
        const token = getAccessToken();
        if (!token) throw new Error('Không tìm thấy access token');

        const url = new URL(config.getApiUrl(`${config.API_ENDPOINTS.SALES_STATS}du_lieu_xuat_excel/`));
        if (params.from_date) url.searchParams.append('from_date', params.from_date);
        if (params.to_date) url.searchParams.append('to_date', params.to_date);

        const response = await fetch(url.toString(), {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Lỗi lấy dữ liệu xuất Excel');

        return { success: true, data: data.export_data || [] }; // API trả về { success: true, export_data: [...] }
    } catch (error) {
        return { success: false, error: error.message };
    }
};

/**
 * API lấy danh sách đơn hàng
 * @param {Object} params - Các tham số lọc: search, trang_thai, page
 * @returns {Promise} Promise chứa danh sách đơn hàng
 */
export const getOrders = async (params = {}) => {
    try {
        const token = getAccessToken();
        if (!token) {
            throw new Error('Không tìm thấy access token');
        }

        // Xây dựng URL với query params
        const url = new URL(config.getApiUrl(config.API_ENDPOINTS.ORDER_LIST));
        if (params.search) url.searchParams.append('search', params.search);
        if (params.trang_thai && params.trang_thai !== 'all') url.searchParams.append('trang_thai', params.trang_thai);
        if (params.page && params.page > 1) url.searchParams.append('page', params.page);

        const response = await fetch(url.toString(), {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.detail || errorData.message || `HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        return {
            success: true,
            data: data,
        };
    } catch (error) {
        return {
            success: false,
            error: error.message || 'Đã xảy ra lỗi khi lấy danh sách đơn hàng',
        };
    }
};

/**
 * API lấy chi tiết đơn hàng
 * @param {string} orderId - Mã hóa đơn (LXB-...)
 * @returns {Promise} Promise chứa chi tiết đơn hàng
 */
export const getOrderDetail = async (orderId) => {
    try {
        const token = getAccessToken();
        if (!token) {
            throw new Error('Không tìm thấy access token');
        }

        const url = `${config.getApiUrl(config.API_ENDPOINTS.ORDER_DETAIL)}${orderId}/`;

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.detail || errorData.message || `HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        return {
            success: true,
            data: data,
        };
    } catch (error) {
        return {
            success: false,
            error: error.message || 'Đã xảy ra lỗi khi lấy chi tiết đơn hàng',
        };
    }
};
