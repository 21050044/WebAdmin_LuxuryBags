// API Service cho Staff Collection
// Dùng để lưu và quản lý các mẫu thiết kế AI
import config from '../config/config.js';

/**
 * Lấy danh sách bộ sưu tập thiết kế
 * @returns {Promise<{success: boolean, data?: Array, error?: string}>}
 */
export const getStaffCollection = async () => {
    try {
        const accessToken = localStorage.getItem('access_token');
        const apiUrl = config.getApiUrl('/api/staff-collection/');

        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
            },
        });

        if (!response.ok) {
            throw new Error(`Lỗi API: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        return { success: true, data };
    } catch (err) {
        console.error('Error fetching staff collection:', err);
        return { success: false, error: err.message };
    }
};

/**
 * Lưu ảnh vào bộ sưu tập
 * @param {Blob|File} imageFile - File ảnh cần lưu
 * @param {string} note - Ghi chú cho thiết kế (tùy chọn)
 * @returns {Promise<{success: boolean, data?: Object, error?: string}>}
 */
export const saveToCollection = async (imageFile, note = '') => {
    try {
        const accessToken = localStorage.getItem('access_token');
        const apiUrl = config.getApiUrl('/api/staff-collection/');

        const formData = new FormData();
        formData.append('file_anh', imageFile, 'design.png');
        if (note) {
            formData.append('ghi_chu', note);
        }

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
            },
            body: formData,
        });

        if (!response.ok) {
            const text = await response.text();
            console.error('API error:', text);
            throw new Error(`Lỗi API: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        return { success: true, data };
    } catch (err) {
        console.error('Error saving to collection:', err);
        return { success: false, error: err.message };
    }
};

/**
 * Xóa ảnh khỏi bộ sưu tập
 * @param {number|string} id - ID của thiết kế cần xóa
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export const deleteFromCollection = async (id) => {
    try {
        const accessToken = localStorage.getItem('access_token');
        const apiUrl = config.getApiUrl(`/api/staff-collection/${id}/`);

        const response = await fetch(apiUrl, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
            },
        });

        if (!response.ok) {
            throw new Error(`Lỗi API: ${response.status} ${response.statusText}`);
        }

        return { success: true };
    } catch (err) {
        console.error('Error deleting from collection:', err);
        return { success: false, error: err.message };
    }
};
