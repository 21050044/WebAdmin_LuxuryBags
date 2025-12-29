const config = {

  API_BASE_URL: 'https://indicated-climbing-marketing-explanation.trycloudflare.com',

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