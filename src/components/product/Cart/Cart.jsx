import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from './CartContext';
import { convertGoogleDriveLink } from '../../../api/products';
import { searchCustomers } from '../../../api/customer';
import { createInvoice as apiCreateInvoice } from '../../../api/invoice';
import styles from './Cart.module.css';

console.log('Cart.jsx loaded. searchCustomers type:', typeof searchCustomers);

// Icon Components
const Icon = ({ name, size = 20, ...props }) => {
  const icons = {
    shoppingCart: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <circle cx="9" cy="21" r="1"></circle>
        <circle cx="20" cy="21" r="1"></circle>
        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
      </svg>
    ),
    x: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
      </svg>
    ),
    plus: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <line x1="12" y1="5" x2="12" y2="19"></line>
        <line x1="5" y1="12" x2="19" y2="12"></line>
      </svg>
    ),
    minus: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <line x1="5" y1="12" x2="19" y2="12"></line>
      </svg>
    ),
    trash: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <polyline points="3 6 5 6 21 6"></polyline>
        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
      </svg>
    ),
    check: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <polyline points="20 6 9 17 4 12"></polyline>
      </svg>
    ),
    user: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
        <circle cx="12" cy="7" r="4"></circle>
      </svg>
    )
  };

  return icons[name] || null;
};

const Cart = ({ isOpen, onClose }) => {
  const {
    cartItems,
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotalAmount,
    getTotalItems,
    // createInvoice, // Không dùng createInvoice từ context nữa
  } = useCart();

  const navigate = useNavigate();

  const [customerInfo, setCustomerInfo] = useState({
    id: null, // Thêm ID để gửi lên API
    name: '',
    phone: '',
    email: '',
    address: '',
    note: '',
  });

  // State cho tìm kiếm khách hàng
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchTimeoutRef = useRef(null);
  const [isSubmitting, setIsSubmitting] = useState(false); // State loading khi tạo đơn

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCustomerInfo(prev => ({ ...prev, [name]: value }));

    // Logic tìm kiếm khi nhập số điện thoại
    if (name === 'phone') {
      // Reset ID nếu người dùng tự sửa số điện thoại
      setCustomerInfo(prev => ({ ...prev, id: null }));

      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }

      if (value.trim().length >= 2) { // Bắt đầu tìm khi nhập >= 2 ký tự
        searchTimeoutRef.current = setTimeout(async () => {
          if (typeof searchCustomers !== 'function') {
            console.error('CRITICAL ERROR: searchCustomers is not a function!', searchCustomers);
            return;
          }

          try {
            const result = await searchCustomers(value);
            if (result.success && result.data && result.data.length > 0) {
              setSuggestions(result.data);
              setShowSuggestions(true);
            } else {
              setSuggestions([]);
              setShowSuggestions(false);
            }
          } catch (err) {
            console.error('Error calling searchCustomers:', err);
          }
        }, 300); // Debounce 300ms
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }
  };

  const handleSelectCustomer = (customer) => {
    setCustomerInfo({
      id: customer.id, // Lưu ID khách hàng
      name: customer.ho_ten,
      phone: customer.so_dien_thoai,
      email: customer.email || '',
      address: customer.dia_chi || '',
      note: '',
    });
    setSuggestions([]);
    setShowSuggestions(false);
  };

  // Ẩn gợi ý khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = () => setShowSuggestions(false);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const handleConfirmOrder = async () => {
    if (cartItems.length === 0) return;

    setIsSubmitting(true);

    // Prepare payload theo format của QuanLyDonHangViewSet
    const payload = {
      cart_items: cartItems.map(item => ({
        id: item.id,
        quantity: item.quantity
      }))
    };

    // Nếu có khách hàng đã chọn từ gợi ý (có ID)
    if (customerInfo.id) {
      payload.khach_hang_id = customerInfo.id;
    } else if (customerInfo.phone && customerInfo.name) {
      // Nếu nhập khách hàng mới (chưa có ID nhưng có thông tin)
      payload.ho_ten_moi = customerInfo.name;
      payload.sdt_moi = customerInfo.phone;
      payload.dia_chi_moi = customerInfo.address || '';
      payload.email_moi = customerInfo.email || '';
    }

    // Thêm ghi chú nếu có
    if (customerInfo.note) {
      payload.ghi_chu = customerInfo.note;
    }

    try {
      const result = await apiCreateInvoice(payload);

      if (result.success) {
        // Clear cart
        clearCart();

        // Đóng modal
        onClose();

        // Chuyển hướng sang trang InvoiceManager
        // Backend trả về invoice object, ta cần ID của nó
        // Giả sử result.data là object invoice hoặc chứa id
        const newInvoiceId = result.data.id || result.data.ma_hoa_don; // Fallback

        navigate('/invoices', { state: { newInvoiceId: newInvoiceId } });

        // Reset form
        setCustomerInfo({ id: null, name: '', phone: '', email: '', address: '', note: '' });
      } else {
        alert(`Lỗi tạo hóa đơn: ${result.error}`);
      }
    } catch (error) {
      console.error('Lỗi xử lý đơn hàng:', error);
      alert('Đã có lỗi xảy ra khi tạo hóa đơn. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>

        {/* HEADER */}
        <div className={styles.modalHeader}>
          <div className={styles.headerLeft}>
            <Icon name="shoppingCart" size={24} />
            <h2 className={styles.modalTitle}>Giỏ hàng của bạn</h2>
            <span className={styles.itemCount}>({getTotalItems()} sản phẩm)</span>
          </div>
          <button className={styles.closeBtn} onClick={onClose}>
            <Icon name="x" size={24} />
          </button>
        </div>

        {/* BODY */}
        <div className={styles.modalBody}>
          {cartItems.length === 0 ? (
            <div className={styles.emptyCart}>
              <Icon name="shoppingCart" size={64} />
              <p>Giỏ hàng trống</p>
              <span>Hãy thêm sản phẩm vào giỏ hàng để tiếp tục</span>
            </div>
          ) : (
            <div className={styles.cartLayout}>
              {/* Left Column: Items */}
              <div className={styles.cartItemsColumn}>
                {cartItems.map((item) => (
                  <div key={item.id} className={styles.cartItem}>
                    <img
                      src={convertGoogleDriveLink(item.hinh_anh)}
                      alt={item.ten_tui}
                      className={styles.itemImage}
                      onError={(e) => e.target.src = 'https://via.placeholder.com/100?text=No+Image'}
                    />
                    <div className={styles.itemInfo}>
                      <h4 className={styles.itemName}>{item.ten_tui}</h4>
                      <p className={styles.itemPrice}>{formatCurrency(item.gia_tien)}</p>
                      <p className={styles.itemStock}>Kho: {item.so_luong_ton}</p>
                    </div>
                    <div className={styles.itemActions}>
                      <div className={styles.quantityControl}>
                        <button
                          className={styles.quantityBtn}
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                        >
                          <Icon name="minus" size={16} />
                        </button>
                        <span className={styles.quantity}>{item.quantity}</span>
                        <button
                          className={styles.quantityBtn}
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          disabled={item.quantity >= item.so_luong_ton}
                        >
                          <Icon name="plus" size={16} />
                        </button>
                      </div>
                      <p className={styles.itemTotal}>
                        {formatCurrency(item.gia_tien * item.quantity)}
                      </p>
                      <button
                        className={styles.removeBtn}
                        onClick={() => removeFromCart(item.id)}
                      >
                        <Icon name="trash" size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Right Column: Customer Form */}
              <div className={styles.customerFormColumn}>
                <div className={styles.customerForm}>
                  <div className={styles.formHeader}>
                    <Icon name="user" size={20} />
                    <h3>Thông tin giao hàng</h3>
                  </div>

                  {/* Phone Input with Search */}
                  <div className={styles.formGroup}>
                    <label>Số điện thoại <span className={styles.required}>*</span></label>
                    <input
                      type="tel"
                      name="phone"
                      value={customerInfo.phone}
                      onChange={handleInputChange}
                      placeholder="Nhập SĐT để tìm khách hàng..."
                      className={styles.formInput}
                      autoComplete="off"
                      onFocus={(e) => {
                        const phoneVal = customerInfo.phone || '';
                        if (phoneVal.trim().length >= 2) {
                          handleInputChange({ target: { name: 'phone', value: phoneVal } });
                        }
                      }}
                    />
                    {showSuggestions && suggestions.length > 0 && (
                      <div className={styles.suggestionsList}>
                        {suggestions.map((customer) => (
                          <div
                            key={customer.id}
                            className={styles.suggestionItem}
                            onClick={() => handleSelectCustomer(customer)}
                          >
                            <span className={styles.suggestionName}>{customer.ho_ten}</span>
                            <span className={styles.suggestionPhone}>{customer.so_dien_thoai} - {customer.dia_chi}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className={styles.formGroup}>
                    <label>Họ và tên <span className={styles.required}>*</span></label>
                    <input
                      type="text"
                      name="name"
                      value={customerInfo.name}
                      onChange={handleInputChange}
                      placeholder="Nguyễn Văn A"
                      className={styles.formInput}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>Email</label>
                    <input
                      type="email"
                      name="email"
                      value={customerInfo.email}
                      onChange={handleInputChange}
                      placeholder="email@example.com"
                      className={styles.formInput}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Địa chỉ <span className={styles.required}>*</span></label>
                    <input
                      type="text"
                      name="address"
                      value={customerInfo.address}
                      onChange={handleInputChange}
                      placeholder="Số nhà, đường..."
                      className={styles.formInput}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Ghi chú</label>
                    <textarea
                      name="note"
                      value={customerInfo.note}
                      onChange={handleInputChange}
                      className={styles.formTextarea}
                      rows="2"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* FOOTER */}
        {cartItems.length > 0 && (
          <div className={styles.modalFooter}>
            <div className={styles.totalSection}>
              <span className={styles.totalLabel}>Tổng cộng:</span>
              <span className={styles.totalAmount}>{formatCurrency(getTotalAmount())}</span>
            </div>
            <div className={styles.footerActions}>
              <button className={styles.clearBtn} onClick={clearCart}>
                <Icon name="trash" size={18} />
                Xóa giỏ hàng
              </button>
              <button
                className={styles.confirmBtn}
                onClick={handleConfirmOrder}
                disabled={isSubmitting}
              >
                <Icon name="check" size={18} />
                {isSubmitting ? 'Đang xử lý...' : 'Tạo hóa đơn mới'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;