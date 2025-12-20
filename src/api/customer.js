// API Service cho Quản lý Khách hàng
import config from '../config/config.js';

console.log('Loading api/customer.js');


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

// 1. Lấy danh sách tất cả khách hàng
export const getAllCustomers = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/khach-hang/`, {
            method: 'GET',
            headers: getAuthHeaders(),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return {
            success: true,
            data: data,
        };
    } catch (error) {
        console.error('Error fetching customers:', error);
        return {
            success: false,
            error: error.message,
        };
    }
};

// 2. Tìm kiếm khách hàng (theo SĐT, tên, email...)
export const searchCustomers = async (query) => {
    try {
        const response = await fetch(`${API_BASE_URL}/khach-hang/?search=${encodeURIComponent(query)}`, {
            method: 'GET',
            headers: getAuthHeaders(),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return {
            success: true,
            data: data,
        };
    } catch (error) {
        console.error('Error searching customers:', error);
        return {
            success: false,
            error: error.message,
        };
    }
};

// 3. Xem chi tiết 1 khách hàng
export const getCustomerById = async (id) => {
    try {
        const response = await fetch(`${API_BASE_URL}/khach-hang/${id}/`, {
            method: 'GET',
            headers: getAuthHeaders(),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return {
            success: true,
            data: data,
        };
    } catch (error) {
        console.error('Error fetching customer details:', error);
        return {
            success: false,
            error: error.message,
        };
    }
};

// 4. Thêm khách hàng mới
export const createCustomer = async (customerData) => {
    try {
        const response = await fetch(`${API_BASE_URL}/khach-hang/`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(customerData),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return {
            success: true,
            data: data,
        };
    } catch (error) {
        console.error('Error creating customer:', error);
        return {
            success: false,
            error: error.message,
        };
    }
};

// 5. Cập nhật thông tin khách hàng
export const updateCustomer = async (id, customerData) => {
    try {
        const response = await fetch(`${API_BASE_URL}/khach-hang/${id}/`, {
            method: 'PATCH',
            headers: getAuthHeaders(),
            body: JSON.stringify(customerData),
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
        console.error('Error updating customer:', error);
        return {
            success: false,
            error: error.message,
        };
    }
};

// 6. Xóa khách hàng
export const deleteCustomer = async (id) => {
    try {
        const response = await fetch(`${API_BASE_URL}/khach-hang/${id}/`, {
            method: 'DELETE',
            headers: getAuthHeaders(),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.detail || errorData.message || `HTTP error! status: ${response.status}`);
        }

        // DELETE có thể không trả về data
        return {
            success: true,
        };
    } catch (error) {
        console.error('Error deleting customer:', error);
        return {
            success: false,
            error: error.message,
        };
    }
};
