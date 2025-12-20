// Updated CartContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';

// Tạo Context
const CartContext = createContext();

// Hook để sử dụng CartContext
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart phải được sử dụng trong CartProvider');
  }
  return context;
};

// CartProvider Component
export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [invoices, setInvoices] = useState([]);

  // Load giỏ hàng và hóa đơn từ localStorage
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem('cart_items');
      if (savedCart) {
        setCartItems(JSON.parse(savedCart));
      }
      const savedInvoices = localStorage.getItem('invoices');
      if (savedInvoices) {
        setInvoices(JSON.parse(savedInvoices));
      }
    } catch (error) {
      console.error('Lỗi khi load dữ liệu từ localStorage:', error);
    }
  }, []);

  // Lưu giỏ hàng và hóa đơn vào localStorage
  useEffect(() => {
    try {
      localStorage.setItem('cart_items', JSON.stringify(cartItems));
      localStorage.setItem('invoices', JSON.stringify(invoices));
    } catch (error) {
      console.error('Lỗi khi lưu dữ liệu vào localStorage:', error);
    }
  }, [cartItems, invoices]);

  // Thêm sản phẩm vào giỏ
  const addToCart = (product) => {
    setCartItems((prevItems) => {
      const existingItem = prevItems.find(item => item.id === product.id);
      if (existingItem) {
        return prevItems.map(item =>
          item.id === product.id
            ? { ...item, quantity: Math.min(item.quantity + 1, product.so_luong_ton) }
            : item
        );
      } else {
        return [...prevItems, { ...product, quantity: 1 }];
      }
    });
  };

  // Xóa sản phẩm khỏi giỏ
  const removeFromCart = (productId) => {
    setCartItems((prevItems) => prevItems.filter(item => item.id !== productId));
  };

  // Cập nhật số lượng sản phẩm
  const updateQuantity = (productId, newQuantity) => {
    setCartItems((prevItems) =>
      prevItems.map(item => {
        if (item.id === productId) {
          const validQuantity = Math.max(1, Math.min(newQuantity, item.so_luong_ton));
          return { ...item, quantity: validQuantity };
        }
        return item;
      })
    );
  };

  // Xóa toàn bộ giỏ hàng
  const clearCart = () => {
    setCartItems([]);
  };

  // Tính tổng số lượng sản phẩm
  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  // Tính tổng tiền
  const getTotalAmount = () => {
    return cartItems.reduce((total, item) => total + (item.gia_tien * item.quantity), 0);
  };

  // Kiểm tra sản phẩm có trong giỏ
  const isInCart = (productId) => {
    return cartItems.some(item => item.id === productId);
  };

  // Lấy số lượng sản phẩm
  const getItemQuantity = (productId) => {
    const item = cartItems.find(item => item.id === productId);
    return item ? item.quantity : 0;
  };

  // Tạo hóa đơn mới
  const createInvoice = (customer, items, total) => {
    // Basic validation
    if (!customer || !items || items.length === 0) return null;

    const newInvoice = {
      id: Date.now().toString(), // Chuyển sang string để tránh lỗi component key
      status: 'Chờ thanh toán', // Initial state
      customer,
      items,
      total,
      discount: 0,
      date: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    setInvoices(prev => [newInvoice, ...prev]); // Add mới nhất lên đầu
    return newInvoice;
  };

  // Cập nhật trạng thái hóa đơn
  const updateInvoiceStatus = (id, newStatus) => {
    // Validate state transition (Simple check)
    // Thực tế nên dùng State Machine library
    setInvoices(prev => prev.map(inv => {
        if (inv.id === id) {
            // Không cho phép sửa hóa đơn đã hủy hoặc đã hoàn thành (Immutability for final states)
            if (inv.status === 'Đã hủy' || inv.status === 'Đã hoàn thành') {
                console.warn("Không thể cập nhật hóa đơn đã đóng");
                return inv; 
            }
            return { 
                ...inv, 
                status: newStatus,
                updatedAt: new Date().toISOString()
            };
        }
        return inv;
    }));
  };

  const value = {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotalItems,
    getTotalAmount,
    isInCart,
    getItemQuantity,
    invoices,
    createInvoice,
    updateInvoiceStatus,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};