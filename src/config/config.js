// Cấu hình môi trường và API
// LƯU Ý QUAN TRỌNG:
// 1. IP này (192.168.23.32) có thể thay đổi mỗi khi reset modem/máy tính (do DHCP).
//    Hãy kiểm tra lại bằng lệnh 'ipconfig' hoặc 'ifconfig'.
// 2. Đảm bảo Server Django đang chạy lệnh: python manage.py runserver 0.0.0.0:8000
// 3. Đảm bảo Tường lửa (Firewall) đã mở port 8000.

const config = {
  // Cập nhật theo yêu cầu của cậu. 
  // Nếu máy cậu đổi IP, phải vào đây sửa lại ngay lập tức nếu không App sẽ lỗi "Failed to fetch".
  API_BASE_URL: 'https://f804307929ac.ngrok-free.app',

  // API cho AI Generate (port 6000)
  AI_API_BASE_URL: 'http://192.168.23.254:8080',

  // Endpoints
  API_ENDPOINTS: {
    LOGIN: '/api/login/',
    LOGOUT: '/api/logout/',
    AI_GENERATE: '/generate/',
    DASHBOARD: '/api/dashboard/summary/',
    SALES_STATS: '/api/thong-ke/',
    ORDER_LIST: '/api/quan-ly-don-hang/',
    ORDER_DETAIL: '/api/hoadon/',
    PRODUCTS: '/api/tui-xach/',
    ADD_PRODUCT: '/api/tuixach/them-moi/',
  },

  // Hàm helper để lấy full URL
  getApiUrl: (endpoint) => {
    return `${config.API_BASE_URL}${endpoint}`;
  },

  // Hàm helper để lấy full URL cho AI API
  getAiApiUrl: (endpoint) => {
    return `${config.AI_API_BASE_URL}${endpoint}`;
  }
};

export default config;