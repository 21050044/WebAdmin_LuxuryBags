import config from '../config/config';

/**
 * API đăng nhập
 * @param {string} username - Tên đăng nhập
 * @param {string} password - Mật khẩu
 * @returns {Promise} Promise chứa dữ liệu response từ server
 */
export const login = async (username, password) => {
  try {
    const response = await fetch(config.getApiUrl(config.API_ENDPOINTS.LOGIN), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username,
        password,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return {
      success: true,
      data: {
        refresh: data.refresh,
        access: data.access,
        user_id: data.user_id,
        username: data.username,
        email: data.email,
        ho_va_ten: data.ho_va_ten,
        full_name: data.full_name,
        role: data.role,
        is_admin: data.is_admin,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Đã xảy ra lỗi khi đăng nhập',
    };
  }
};

/**
 * API đăng xuất
 * @param {string} accessToken - Access token để xác thực (gửi trong header)
 * @param {string} refreshToken - Refresh token để đăng xuất (gửi trong body)
 * @returns {Promise} Promise chứa dữ liệu response từ server
 */
export const logout = async (accessToken, refreshToken) => {
  try {
    // Kiểm tra token có tồn tại không
    if (!accessToken) {
      throw new Error('Access token không tồn tại');
    }
    if (!refreshToken) {
      throw new Error('Refresh token không tồn tại');
    }

    const response = await fetch(config.getApiUrl(config.API_ENDPOINTS.LOGOUT), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        refresh: refreshToken,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || errorData.message || `HTTP error! status: ${response.status}`);
    }

    // Logout API có thể không trả về data, chỉ cần kiểm tra status
    return {
      success: true,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Đã xảy ra lỗi khi đăng xuất',
    };
  }
};

