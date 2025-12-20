// API Service cho Quản lý Đơn hàng (API mới: QuanLyDonHangViewSet)
import config from '../config/config.js';

const API_BASE_URL = `${config.API_BASE_URL}/api`;

// Helper function để lấy token từ localStorage
const getAuthToken = () => {
    return localStorage.getItem('access_token');
};

// Helper function để tạo headers với Bearer Token
const getAuthHeaders = () => {
    const token = getAuthToken();
    const headers = {
        'Content-Type': 'application/json',
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
};

/**
 * Lấy danh sách đơn hàng với filter
 * @param {Object} params - { loai: 'ONLINE'|'OFFLINE', trang_thai, search }
 */
export const getAllInvoices = async (params = {}) => {
    try {
        const url = new URL(`${API_BASE_URL}/quan-ly-don-hang/`);

        // Thêm params filter
        if (params.loai && params.loai !== 'ALL') {
            url.searchParams.append('loai', params.loai);
        }
        if (params.trang_thai && params.trang_thai !== 'ALL') {
            url.searchParams.append('trang_thai', params.trang_thai);
        }
        if (params.search) {
            url.searchParams.append('search', params.search);
        }

        const response = await fetch(url.toString(), {
            method: 'GET',
            headers: getAuthHeaders(),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return {
            success: true,
            data: data,
        };
    } catch (error) {
        console.error('Error fetching invoices:', error);
        return {
            success: false,
            error: error.message,
        };
    }
};

/**
 * Tạo đơn hàng mới (Bán tại quầy)
 * @param {Object} orderData - { cart_items: [{id, quantity}], khach_hang_id?, ghi_chu? }
 */
export const createInvoice = async (orderData) => {
    try {
        const response = await fetch(`${API_BASE_URL}/quan-ly-don-hang/`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(orderData),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || data.detail || `Lỗi ${response.status}: Không thể tạo đơn hàng`);
        }

        return {
            success: true,
            data: data,
        };
    } catch (error) {
        console.error('Error creating invoice:', error);
        return {
            success: false,
            error: error.message,
        };
    }
};

/**
 * Xác nhận thanh toán đơn hàng
 * @param {number} id - ID đơn hàng (pk)
 */
export const confirmInvoice = async (id) => {
    try {
        const response = await fetch(`${API_BASE_URL}/quan-ly-don-hang/${id}/xac_nhan_thanh_toan/`, {
            method: 'POST',
            headers: getAuthHeaders(),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || data.detail || `Lỗi ${response.status}: Không thể xác nhận thanh toán`);
        }

        return {
            success: true,
            data: data,
        };
    } catch (error) {
        console.error('Error confirming invoice:', error);
        return {
            success: false,
            error: error.message,
        };
    }
};

/**
 * Duyệt đơn hàng (CHO_XAC_NHAN -> DA_XAC_NHAN)
 * @param {number} id - ID đơn hàng (pk)
 */
export const approveInvoice = async (id) => {
    try {
        const response = await fetch(`${API_BASE_URL}/quan-ly-don-hang/${id}/duyet_don/`, {
            method: 'POST',
            headers: getAuthHeaders(),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || data.detail || `Lỗi ${response.status}: Không thể duyệt đơn hàng`);
        }

        return {
            success: true,
            data: data,
        };
    } catch (error) {
        console.error('Error approving invoice:', error);
        return {
            success: false,
            error: error.message,
        };
    }
};

/**
 * Bắt đầu giao hàng (DA_XAC_NHAN -> DANG_GIAO)
 * @param {number} id - ID đơn hàng (pk)
 */
export const startShippingInvoice = async (id) => {
    try {
        const response = await fetch(`${API_BASE_URL}/quan-ly-don-hang/${id}/bat_dau_giao_hang/`, {
            method: 'POST',
            headers: getAuthHeaders(),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || data.detail || `Lỗi ${response.status}: Không thể bắt đầu giao hàng`);
        }

        return {
            success: true,
            data: data,
        };
    } catch (error) {
        console.error('Error starting shipping:', error);
        return {
            success: false,
            error: error.message,
        };
    }
};

/**
 * Hủy đơn hàng
 * @param {number} id - ID đơn hàng (pk)
 */
export const cancelInvoice = async (id) => {
    try {
        const response = await fetch(`${API_BASE_URL}/quan-ly-don-hang/${id}/huy_don/`, {
            method: 'POST',
            headers: getAuthHeaders(),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || data.detail || `Lỗi ${response.status}: Không thể hủy đơn hàng`);
        }

        return {
            success: true,
            data: data,
        };
    } catch (error) {
        return {
            success: false,
            error: error.message,
        };
    }
};

/**
 * Xác nhận giao hàng thành công (DANG_GIAO -> HOAN_THANH)
 * @param {number} id - ID đơn hàng (pk)
 */
export const confirmDeliverySuccess = async (id) => {
    try {
        const response = await fetch(`${API_BASE_URL}/quan-ly-don-hang/${id}/xac_nhan_giao_thanh_cong/`, {
            method: 'POST',
            headers: getAuthHeaders(),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || data.detail || `Lỗi ${response.status}: Không thể xác nhận giao hàng thành công`);
        }

        return {
            success: true,
            data: data,
        };
    } catch (error) {
        console.error('Error confirming delivery success:', error);
        return {
            success: false,
            error: error.message,
        };
    }
};
