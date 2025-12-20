// API Service cho Quản lý Túi xách
import config from '../config/config.js';

const API_BASE_URL = `${config.API_BASE_URL}/api`;

// Helper function để lấy token từ localStorage
const getAuthToken = () => {
  return localStorage.getItem('access_token');
};

// Helper function để tạo headers với Bearer Token
const getAuthHeaders = (isMultipart = false) => {
  const token = getAuthToken();
  const headers = {};

  // Nếu không phải multipart (upload file), set Content-Type là json
  // Nếu là multipart, để browser tự set boundary
  if (!isMultipart) {
    headers['Content-Type'] = 'application/json';
  }

  // Chỉ thêm Authorization header nếu có token
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
};

// Lấy danh sách tất cả túi xách
export const getAllProducts = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/tui-xach/`, {
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
    console.error('Error fetching products:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

// Lấy chi tiết 1 sản phẩm theo ID
export const getProductById = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/tui-xach/${id}/`, {
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
    console.error('Error fetching product:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

// Tạo sản phẩm mới
export const createProduct = async (productData) => {
  const isFormData = productData instanceof FormData;
  try {
    const response = await fetch(`${config.API_BASE_URL}${config.API_ENDPOINTS.ADD_PRODUCT}`, {
      method: 'POST',
      headers: getAuthHeaders(isFormData),
      body: isFormData ? productData : JSON.stringify(productData),
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
    console.error('Error creating product:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

// Cập nhật sản phẩm
export const updateProduct = async (id, productData) => {
  const isFormData = productData instanceof FormData;
  try {
    const response = await fetch(`${API_BASE_URL}/tui-xach/${id}/`, {
      method: 'PATCH', // Dùng PATCH để cập nhật một phần hoặc toàn bộ tùy backend
      headers: getAuthHeaders(isFormData),
      body: isFormData ? productData : JSON.stringify(productData),
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
    console.error('Error updating product:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

// Xóa sản phẩm
export const deleteProduct = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/tui-xach/${id}/`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || errorData.detail || `HTTP error! status: ${response.status}`);
    }

    return {
      success: true,
      message: 'Xóa sản phẩm thành công',
    };
  } catch (error) {
    console.error('Error deleting product:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Convert Google Drive link sang direct image link có thể embed được
 * 
 * QUAN TRỌNG:
 * - Link /file/d/FILE_ID/view là PREVIEW PAGE, KHÔNG thể dùng trong <img> tag
 * - Phải dùng /uc?id=FILE_ID để embed trực tiếp
 * 
 * @param {string} url - Google Drive URL từ API
 * @returns {string} - Direct image URL có thể embed
 */
export const convertGoogleDriveLink = (url) => {
  // Nếu không phải Google Drive link, trả về nguyên gốc
  if (!url || !url.includes('drive.google.com')) {
    return url;
  }

  // Extract file ID from Google Drive URL
  // Hỗ trợ các format:
  // 1. https://drive.google.com/file/d/FILE_ID/view?usp=sharing
  // 2. https://drive.google.com/file/d/FILE_ID/view?usp=drivesdk  
  // 3. https://drive.google.com/d/FILE_ID/view
  // 4. https://drive.google.com/open?id=FILE_ID

  // Method 1: Match /file/d/FILE_ID hoặc /d/FILE_ID
  const fileIdMatch = url.match(/\/(?:file\/)?d\/([a-zA-Z0-9_-]+)/);

  if (fileIdMatch && fileIdMatch[1]) {
    const fileId = fileIdMatch[1];

    // GIẢI PHÁP 1: Dùng CORS Proxy (temporary solution)
    // ⚠️ WARNING: Chỉ dùng cho development/testing
    // Production nên migrate sang Imgur hoặc upload lên server riêng

    const googleDriveUrl = `https://drive.google.com/uc?id=${fileId}`;

    // Option A: Dùng images.weserv.nl proxy (khuyến khích)
    return `https://images.weserv.nl/?url=${encodeURIComponent(googleDriveUrl)}`;

    // Option B: Dùng corsproxy.io (backup)
    // return `https://corsproxy.io/?${encodeURIComponent(googleDriveUrl)}`;

    // Option C: Direct link (bị 403)
    // return googleDriveUrl;
  }

  // Method 2: Match ?id=FILE_ID (open link format)
  const idParamMatch = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);

  if (idParamMatch && idParamMatch[1]) {
    const googleDriveUrl = `https://drive.google.com/uc?id=${idParamMatch[1]}`;
    return `https://images.weserv.nl/?url=${encodeURIComponent(googleDriveUrl)}`;
  }

  // Fallback: Bỏ query params và trả về
  return url.split('?')[0];
};

/**
 * Get thumbnail URL for Google Drive image
 * Useful for preview/list views where you want smaller images
 * 
 * @param {string} url - Google Drive URL
 * @param {number} size - Thumbnail width (default 400)
 * @returns {string} - Thumbnail URL
 */
export const getGoogleDriveThumbnail = (url, size = 400) => {
  if (!url || !url.includes('drive.google.com')) {
    return url;
  }

  const fileIdMatch = url.match(/\/(?:file\/)?d\/([a-zA-Z0-9_-]+)/);

  if (fileIdMatch && fileIdMatch[1]) {
    return `https://drive.google.com/thumbnail?id=${fileIdMatch[1]}&sz=w${size}`;
  }

  return url;
};