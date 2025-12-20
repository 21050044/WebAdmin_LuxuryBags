import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logoImg from '../../assets/logo.png';
import { login } from '../../api/login';

const LoginPage = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    // Reset error
    setError('');

    // Validation
    if (!username.trim()) {
      setError('Vui lòng nhập tên đăng nhập');
      return;
    }

    if (!password.trim()) {
      setError('Vui lòng nhập mật khẩu');
      return;
    }

    setLoading(true);

    try {
      const result = await login(username, password);

      if (result.success) {
        // Lưu token vào localStorage
        localStorage.setItem('access_token', result.data.access);
        localStorage.setItem('refresh_token', result.data.refresh);
        localStorage.setItem('user_info', JSON.stringify({
          user_id: result.data.user_id,
          username: result.data.username,
          email: result.data.email,
          ho_va_ten: result.data.ho_va_ten || result.data.full_name,
          role: result.data.role,
          is_admin: result.data.is_admin,
        }));

        // Redirect hoặc thông báo thành công
        console.log('Đăng nhập thành công!', result.data);
        // Điều hướng dựa trên role - STAFF không có quyền truy cập trang chủ
        if (result.data.role === 'STAFF') {
          navigate('/products', { replace: true });
        } else {
          navigate('/home', { replace: true });
        }
      } else {
        setError(result.error || 'Đăng nhập thất bại. Vui lòng thử lại.');
      }
    } catch (err) {
      setError('Đã xảy ra lỗi. Vui lòng thử lại sau.');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <style>{`
        /* Reset & Base */
        * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Inter', sans-serif; }
        
        .login-container {
          display: flex;
          width: 100%;
          min-height: 100vh;
          background: #fff;
        }

        /* --- LEFT SECTION (FIXED & REDESIGNED) --- */
        .left-section {
          width: 50%;
          /* Sử dụng gradient tối hơn một chút để làm nổi bật logo trắng */
          background: linear-gradient(135deg, #7c3aed 0%, #2563eb 100%);
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          padding: 60px;
          position: relative;
          color: white;
          overflow: hidden;
        }

        .brand-wrapper {
          display: flex;
          flex-direction: column;
          align-items: center; /* Căn giữa toàn bộ nội dung bên trái */
          max-width: 420px;
          width: 100%;
          gap: 60px; /* Tăng khoảng cách giữa Logo và Features */
        }

        /* Header mới: Logo lớn ở giữa + Subtitle bên dưới */
        .brand-header {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          width: 100%;
        }

        /* Style cho ảnh logo chính */
        .main-logo-img {
          width: 460px; /* Kích thước lớn để dễ đọc text trong ảnh */
          height: auto;
          object-fit: contain;
          margin-bottom: 20px;
          /* QUAN TRỌNG: Chuyển logo sang màu trắng để nổi bật trên nền tối. 
             Nếu bạn muốn giữ màu gốc của logo, hãy xóa dòng filter này. */
          filter: brightness(0) invert(1); 
          transition: transform 0.3s ease;
        }
        
        .main-logo-img:hover {
          transform: scale(1.02); /* Hiệu ứng zoom nhẹ khi hover */
        }

        .brand-subtitle {
          font-family: 'Inter', sans-serif;
          font-size: 14px;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 4px; /* Khoảng cách chữ rộng tạo cảm giác sang trọng */
          opacity: 0.8;
        }

        /* Features List - Căn trái lại cho dễ đọc */
        .features-list {
          display: flex;
          flex-direction: column;
          gap: 25px;
          padding-left: 20px;
          /* Đường viền mờ hơn và mảnh hơn */
          border-left: 1px solid rgba(255,255,255,0.15); 
          align-self: flex-start; /* Đưa khối features về bên trái */
          margin-left: auto;
          margin-right: auto;
        }

        .feature-item {
          display: flex;
          align-items: center;
          gap: 15px;
          font-size: 16px;
          font-weight: 400; /* Giảm độ đậm font để thanh thoát hơn */
          letter-spacing: 0.5px;
          transition: all 0.3s;
        }
        
        .feature-item:hover {
          transform: translateX(10px);
          opacity: 1;
          text-shadow: 0 0 10px rgba(255,255,255,0.3);
        }

        .feature-icon {
          width: 24px;
          height: 24px;
          /* Icon không nền, chỉ có viền để tinh tế hơn */
          background: transparent;
          border: 1px solid rgba(255,255,255,0.3);
          border-radius: 50%; /* Đổi sang hình tròn */
          padding: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        /* --- RIGHT SECTION (FORM - Giữ nguyên như cũ) --- */
        .right-section {
          width: 50%;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 60px 100px;
        }
        @media (max-width: 1200px) {
             .right-section { padding: 60px 50px; }
        }

        .form-wrapper {
          max-width: 420px;
          width: 100%;
          margin: 0 auto;
        }

        .form-header {
          margin-bottom: 40px;
        }

        .form-title {
          font-family: 'Playfair Display', serif;
          font-size: 42px;
          font-weight: 700;
          color: #111827;
          margin-bottom: 12px;
        }

        .form-subtitle {
          color: #6b7280;
          font-size: 16px;
          line-height: 1.5;
        }

        .input-group {
          margin-bottom: 24px;
        }

        .label {
          display: block;
          color: #374151;
          font-weight: 600;
          margin-bottom: 8px;
          font-size: 15px;
        }

        .input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }

        .input-field {
          width: 100%;
          height: 56px;
          border: 1.5px solid #e5e7eb;
          border-radius: 12px;
          padding: 0 20px 0 48px;
          font-size: 16px;
          color: #111827;
          outline: none;
          transition: all 0.2s;
        }

        .input-field:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
        }

        .field-icon {
          position: absolute;
          left: 16px;
          width: 20px;
          height: 20px;
          opacity: 0.5;
        }

        .toggle-password {
          position: absolute;
          right: 16px;
          cursor: pointer;
          opacity: 0.5;
          width: 20px;
        }

        .form-options {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 32px;
        }

        .remember-me {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #4b5563;
          font-size: 14px;
          cursor: pointer;
        }
        
        .custom-checkbox {
          width: 18px;
          height: 18px;
          border: 2px solid #d1d5db;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }

        .remember-me input:checked + .custom-checkbox {
          background: #3b82f6;
          border-color: #3b82f6;
        }

        .forgot-link {
          color: #3b82f6;
          font-weight: 600;
          font-size: 14px;
          text-decoration: none;
        }

        .btn-submit {
          width: 100%;
          height: 56px;
          background: #3b82f6;
          color: white;
          border: none;
          border-radius: 12px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s;
        }

        .btn-submit:hover {
          background: #2563eb;
        }

        .btn-submit:disabled {
          background: #9ca3af;
          cursor: not-allowed;
        }

        .error-message {
          background: #fee2e2;
          color: #dc2626;
          padding: 12px 16px;
          border-radius: 8px;
          font-size: 14px;
          margin-bottom: 20px;
          border: 1px solid #fecaca;
        }

        .footer {
          margin-top: 40px;
          text-align: center;
          font-size: 13px;
          color: #9ca3af;
        }

        /* Responsive */
        @media (max-width: 968px) {
          .left-section { display: none; }
          .right-section { width: 100%; padding: 40px 20px; }
        }
      `}</style>

      {/* --- LEFT SECTION UPDATED --- */}
      <div className="left-section">
        <div className="brand-wrapper">
          {/* Header Block Mới: Chỉ chứa Ảnh Logo lớn và Subtitle */}
          <div className="brand-header">
            <img
              src={logoImg}
              alt="Luxury Bags Logo"
              className="main-logo-img"
            />
            <p className="brand-subtitle">Management System</p>
          </div>

          {/* Features Block */}
          <div className="features-list">
            <FeatureItem text="Quản lý sản phẩm toàn diện" />
            <FeatureItem text="Chăm sóc khách hàng VIP" />
            <FeatureItem text="Báo cáo doanh thu Real-time" />
            <FeatureItem text="Bảo mật hệ thống đa lớp" />
          </div>
        </div>
      </div>

      {/* --- RIGHT SECTION (Giữ nguyên) --- */}
      <div className="right-section">
        <div className="form-wrapper">
          <div className="form-header">
            <h2 className="form-title">Đăng nhập</h2>
            <p className="form-subtitle">Chào mừng trở lại! Vui lòng nhập thông tin.</p>
          </div>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <div className="input-group">
            <label className="label">Tên đăng nhập</label>
            <div className="input-wrapper">
              <img src="https://img.icons8.com/ios/50/9ca3af/user--v1.png" className="field-icon" alt="user" />
              <input
                type="text"
                className="input-field"
                placeholder="Nhập tên đăng nhập..."
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleLogin();
                  }
                }}
              />
            </div>
          </div>

          <div className="input-group">
            <label className="label">Mật khẩu</label>
            <div className="input-wrapper">
              <img src="https://img.icons8.com/ios/50/9ca3af/lock--v1.png" className="field-icon" alt="lock" />
              <input
                type="password"
                className="input-field"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleLogin();
                  }
                }}
              />
              <img src="https://img.icons8.com/ios/50/9ca3af/hide.png" className="toggle-password" alt="view" />
            </div>
          </div>

          <div className="form-options">
            <label className="remember-me">
              <input type="checkbox" hidden />
              <div className="custom-checkbox">
                <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                  <path d="M1.5 4L3.5 6L8.5 1.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <span>Ghi nhớ tôi</span>
            </label>
            <a href="#" className="forgot-link">Quên mật khẩu?</a>
          </div>

          <button
            className="btn-submit"
            onClick={handleLogin}
            disabled={loading}
          >
            {loading ? 'Đang xử lý...' : 'Đăng nhập'}
          </button>

          <div className="footer">
            <p>© 2025 Luxury Bags Management. All rights reserved.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Sub-component for Cleaner Code (Updated Icon style)
const FeatureItem = ({ text }) => (
  <div className="feature-item">
    <div className="feature-icon">
      {/* Sử dụng icon check đơn giản hơn, nét mảnh hơn */}
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12"></polyline>
      </svg>
    </div>
    <span>{text}</span>
  </div>
);

export default LoginPage;