import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getAllProducts, deleteProduct, createProduct, updateProduct, convertGoogleDriveLink } from '../../api/products';
import { logout } from '../../api/login';
import logoImg from '../../assets/logo.png';
import styles from './index.module.css';
import homeStyles from '../home/index.module.css';
import { useCart } from './Cart/CartContext';
import Cart from './Cart/Cart';
import Sidebar from '../shared/Sidebar';

// Base64 placeholder image (gray background with "No Image" text)
// Không cần external request, work offline
const PLACEHOLDER_IMAGE = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI2Y5ZmFmYiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IiM5Y2EzYWYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5ObyBJbWFnZTwvdGV4dD48L3N2Zz4=';

// SVG Icon Components
const Icon = ({ name, size = 20, color = 'currentColor', ...props }) => {
  const icons = {
    home: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
        <polyline points="9 22 9 12 15 12 15 22"></polyline>
      </svg>
    ),
    bag: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
        <line x1="3" y1="6" x2="21" y2="6"></line>
        <path d="M16 10a4 4 0 0 1-8 0"></path>
      </svg>
    ),
    users: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
        <circle cx="9" cy="7" r="4"></circle>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
      </svg>
    ),
    chart: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <line x1="12" y1="20" x2="12" y2="10"></line>
        <line x1="18" y1="20" x2="18" y2="4"></line>
        <line x1="6" y1="20" x2="6" y2="16"></line>
      </svg>
    ),
    sparkles: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M12 3v4m0 10v4M3 12h4m10 0h4M6.343 6.343l2.828 2.828m5.656 5.656l2.828 2.828M6.343 17.657l2.828-2.828m5.656-5.656l2.828-2.828"></path>
      </svg>
    ),
    logout: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
        <polyline points="16 17 21 12 16 7"></polyline>
        <line x1="21" y1="12" x2="9" y2="12"></line>
      </svg>
    ),
    package: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <line x1="16.5" y1="9.4" x2="7.5" y2="4.21"></line>
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
        <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
        <line x1="12" y1="22.08" x2="12" y2="12"></line>
      </svg>
    ),
    search: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <circle cx="11" cy="11" r="8"></circle>
        <path d="m21 21-4.35-4.35"></path>
      </svg>
    ),
    filter: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
      </svg>
    ),
    plus: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <line x1="12" y1="5" x2="12" y2="19"></line>
        <line x1="5" y1="12" x2="19" y2="12"></line>
      </svg>
    ),
    eye: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
        <circle cx="12" cy="12" r="3"></circle>
      </svg>
    ),
    edit: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
      </svg>
    ),
    trash: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <polyline points="3 6 5 6 21 6"></polyline>
        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
      </svg>
    ),
    x: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
      </svg>
    ),
    fileText: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
        <polyline points="14 2 14 8 20 8"></polyline>
        <line x1="16" y1="13" x2="8" y2="13"></line>
        <line x1="16" y1="17" x2="8" y2="17"></line>
        <polyline points="10 9 9 9 8 9"></polyline>
      </svg>
    ),
    calendar: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
        <line x1="16" y1="2" x2="16" y2="6"></line>
        <line x1="8" y1="2" x2="8" y2="6"></line>
        <line x1="3" y1="10" x2="21" y2="10"></line>
      </svg>
    ),
    shoppingCart: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <circle cx="9" cy="21" r="1"></circle>
        <circle cx="20" cy="21" r="1"></circle>
        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
      </svg>
    ),
    tag: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path>
        <line x1="7" y1="7" x2="7.01" y2="7"></line>
      </svg>
    ),
    invoice: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
        <polyline points="14 2 14 8 20 8"></polyline>
        <line x1="16" y1="13" x2="8" y2="13"></line>
        <line x1="16" y1="17" x2="8" y2="17"></line>
        <polyline points="10 9 9 9 8 9"></polyline>
      </svg>
    ),
  };

  return icons[name] || null;
};

const ProductsPage = () => {
  const navigate = useNavigate();
  const { addToCart, getTotalItems } = useCart();

  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [categories, setCategories] = useState([]);

  // Form State
  const [showFormModal, setShowFormModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [formData, setFormData] = useState({
    ten_tui: '',
    gia_tien: '',
    so_luong_ton: '',
    mo_ta: '',
    danh_muc: '',
  });

  const handleAddProduct = () => {
    setIsEditing(false);
    setFormData({ ten_tui: '', gia_tien: '', so_luong_ton: '', mo_ta: '', danh_muc: '' });
    setImageFile(null);
    setPreviewImage(null);
    setShowFormModal(true);
  };

  const handleEditProduct = (product) => {
    setIsEditing(true);
    setSelectedProduct(product);
    setFormData({
      ten_tui: product.ten_tui,
      gia_tien: product.gia_tien,
      so_luong_ton: product.so_luong_ton,
      mo_ta: product.mo_ta,
      danh_muc: product.danh_muc?.id || ''
    });
    setPreviewImage(convertGoogleDriveLink(product.hinh_anh));
    setImageFile(null);
    setShowFormModal(true);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleSaveProduct = async () => {
    // 1. Validation STRICT
    const errors = [];
    if (!formData.ten_tui) errors.push("Tên túi xách là bắt buộc.");
    if (!formData.gia_tien) errors.push("Giá tiền là bắt buộc.");
    if (!formData.so_luong_ton) errors.push("Số lượng tồn là bắt buộc.");

    // Validate danh_muc: Required only for Edit
    if (isEditing && !formData.danh_muc) {
      errors.push("Vui lòng chọn danh mục.");
    }

    // Validate image: Optional on Edit, Optional on Create (as per user request)
    // if (!isEditing && !imageFile) {
    //     errors.push("Hình ảnh là bắt buộc khi tạo mới."); 
    // }

    if (errors.length > 0) {
      alert(errors.join("\n"));
      return;
    }

    const data = new FormData();
    data.append('ten_tui', formData.ten_tui);
    data.append('gia_tien', formData.gia_tien);
    data.append('so_luong_ton', formData.so_luong_ton);
    data.append('mo_ta', formData.mo_ta || "");

    // Only append danh_muc if editing
    if (isEditing) {
      data.append('danh_muc', formData.danh_muc);
    }

    if (imageFile) {
      data.append('hinh_anh', imageFile);
    }

    setLoading(true);
    try {
      let result;
      if (isEditing) {
        result = await updateProduct(selectedProduct.id, data);
      } else {
        result = await createProduct(data);
      }

      if (result.success) {
        alert(isEditing ? 'Cập nhật thành công!' : 'Thêm mới thành công!');
        setShowFormModal(false);
        fetchProducts();
      } else {
        // Show detailed error if available
        const errorMsg = typeof result.error === 'object'
          ? JSON.stringify(result.error)
          : result.error;
        alert(`Lỗi API: ${errorMsg}`);
      }
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Đã xảy ra lỗi khi lưu sản phẩm. Vui lòng kiểm tra console.');
    } finally {
      setLoading(false);
    }
  };

  const allMenuItems = [
    { id: 'home', icon: 'home', label: 'Trang chủ', path: '/home' },
    { id: 'products', icon: 'bag', label: 'Quản lý túi xách', path: '/products' },
    { id: 'customers', icon: 'users', label: 'Quản lý khách hàng', path: '/customers' },
    { id: 'sales', icon: 'chart', label: 'Quản lý buôn bán', path: '/sales' },
    { id: 'invoices', icon: 'invoice', label: 'Quản lý hóa đơn', path: '/invoices' },
    { id: 'ai-design', icon: 'sparkles', label: 'Thiết kế túi xách bằng AI', path: '/ai-design' },
  ];

  const userInfo = JSON.parse(localStorage.getItem('user_info') || '{}');
  const menuItems = allMenuItems.filter(item => {
    if (userInfo?.role === 'STAFF') {
      return item.id !== 'home' && item.id !== 'invoices';
    }
    return true;
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    if (products.length > 0) {
      const uniqueCats = [];
      const map = new Map();
      for (const p of products) {
        if (p.danh_muc && p.danh_muc.id && !map.has(p.danh_muc.id)) {
          map.set(p.danh_muc.id, true);
          uniqueCats.push(p.danh_muc);
        }
      }
      setCategories(uniqueCats);
    }
  }, [products]);

  useEffect(() => {
    let result = [...products];

    if (searchTerm) {
      result = result.filter(p =>
        p.ten_tui.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory !== 'all') {
      result = result.filter(p => p.danh_muc?.ten_danh_muc === selectedCategory);
    }

    switch (sortBy) {
      case 'price-asc':
        result.sort((a, b) => a.gia_tien - b.gia_tien);
        break;
      case 'name':
        result.sort((a, b) => a.ten_tui.localeCompare(b.ten_tui));
        break;
      case 'price-desc':
        result.sort((a, b) => b.gia_tien - a.gia_tien);
        break;
      case 'stock':
        result.sort((a, b) => a.so_luong_ton - b.so_luong_ton);
        break;
      default:
        break;
    }

    setFilteredProducts(result);
  }, [products, searchTerm, selectedCategory, sortBy]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const result = await getAllProducts();
      if (result && result.success) {
        setProducts(result.data);
      } else if (Array.isArray(result)) {
        setProducts(result);
      } else {
        console.error("Invalid product data", result);
        setProducts([]);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    if (window.confirm('Bạn có chắc muốn đăng xuất?')) {
      await logout();
      navigate('/login');
    }
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Bạn có chắc muốn xóa sản phẩm "${name}"?`)) {
      try {
        const result = await deleteProduct(id);
        if (result.success) {
          setProducts(prev => prev.filter(p => p.id !== id));
          if (selectedProduct?.id === id) closeModal();
        } else {
          alert(`Không thể xóa sản phẩm: ${result.error}`);
        }
      } catch (error) {
        console.error("Error deleting product:", error);
        alert("Không thể xóa sản phẩm. Vui lòng thử lại.");
      }
    }
  };

  const handleViewDetail = (product) => {
    setSelectedProduct(product);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedProduct(null);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const getStockBadgeClass = (stock) => {
    if (stock === 0) return styles.stockOut;
    if (stock < 5) return styles.stockLow;
    return styles.stockGood;
  };

  const handleImageError = (e, product) => {
    console.error(`Image failed to load for product: ${product.ten_tui}`);
    e.target.src = PLACEHOLDER_IMAGE;
  };

  return (
    <div className={homeStyles.homeContainer}>
      {/* Sidebar */}
      <Sidebar activeMenu="products" />

      {/* Main Content */}
      <main className={homeStyles.mainContent}>
        <div className={styles.productsContainer}>
          {/* Header */}
          <div className={styles.pageHeader}>
            <div>
              <h1 className={styles.pageTitle}>Quản lý Túi xách</h1>
              <p className={styles.pageSubtitle}>
                Tổng {filteredProducts.length} sản phẩm
              </p>
            </div>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <button
                className={styles.cartIconBtn}
                onClick={() => setIsCartOpen(true)}
                title="Giỏ hàng"
              >
                <Icon name="shoppingCart" size={24} />
                {getTotalItems() > 0 && (
                  <span className={styles.cartBadge}>{getTotalItems()}</span>
                )}
              </button>
              <button className={styles.btnAdd} onClick={handleAddProduct}>
                <Icon name="plus" size={20} />
                <span>Thêm sản phẩm</span>
              </button>
            </div>
          </div>

          {/* Toolbar - Search, Filter, Sort */}
          <div className={styles.toolbar}>
            {/* Search */}
            <div className={styles.searchBox}>
              <Icon name="search" size={18} color="#6b7280" />
              <input
                type="text"
                placeholder="Tìm kiếm theo tên túi xách..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={styles.searchInput}
              />
            </div>

            {/* Filter & Sort */}
            <div className={styles.filterGroup}>
              {/* Category Filter */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className={styles.selectBox}
              >
                <option value="all">Tất cả danh mục</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.ten_danh_muc}>{cat.ten_danh_muc}</option>
                ))}
              </select>

              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className={styles.selectBox}
              >
                <option value="price-asc">Giá thấp → cao</option>
                <option value="price-desc">Giá cao → thấp</option>
                <option value="name">Tên A-Z</option>
                <option value="stock">Tồn kho</option>
              </select>
            </div>
          </div>

          {/* Products Grid */}
          {loading ? (
            <div className={styles.loading}>Đang tải dữ liệu...</div>
          ) : filteredProducts.length === 0 ? (
            <div className={styles.noData}>Không tìm thấy sản phẩm nào</div>
          ) : (
            <div className={styles.productsGrid}>
              {filteredProducts.map((product) => {
                const imageUrl = convertGoogleDriveLink(product.hinh_anh);

                return (
                  <div key={product.id} className={styles.productCard}>
                    {/* Image Container */}
                    <div className={styles.imageContainer}>
                      <img
                        src={imageUrl}
                        alt={product.ten_tui}
                        className={styles.productImage}
                        onError={(e) => handleImageError(e, product)}
                      />

                      {/* Hover Overlay */}
                      <div className={styles.overlay}>
                        <div className={styles.overlayContent}>
                          <p className={styles.overlayDesc}>
                            <Icon name="fileText" size={14} color="currentColor" />
                            <span>{product.mo_ta.length > 100
                              ? product.mo_ta.substring(0, 100) + '...'
                              : product.mo_ta}</span>
                          </p>
                          <p className={styles.overlayInfo}>
                            <Icon name="calendar" size={14} color="currentColor" />
                            <span>{formatDate(product.ngay_tao)}</span>
                          </p>
                          <p className={styles.overlayInfo}>
                            <Icon name="tag" size={14} color="currentColor" />
                            <span>{product.danh_muc?.ten_danh_muc || 'N/A'}</span>
                          </p>

                          {/* Action Buttons */}
                          <div className={styles.actionButtons}>
                            <button
                              className={`${styles.actionBtn} ${styles.btnView}`}
                              onClick={() => handleViewDetail(product)}
                              title="Xem chi tiết"
                            >
                              <Icon name="eye" size={16} />
                            </button>
                            <button
                              className={`${styles.actionBtn} ${styles.btnEdit}`}
                              onClick={() => handleEditProduct(product)}
                              title="Chỉnh sửa"
                            >
                              <Icon name="edit" size={16} />
                            </button>
                            <button
                              className={`${styles.actionBtn} ${styles.btnDelete}`}
                              onClick={() => handleDelete(product.id, product.ten_tui)}
                              title="Xóa"
                            >
                              <Icon name="trash" size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Product Info */}
                    <div className={styles.productInfo}>
                      <h3 className={styles.productName}>{product.ten_tui}</h3>
                      <p className={styles.productPrice}>{formatCurrency(product.gia_tien)}</p>

                      <div className={styles.productFooter}>
                        <span className={styles.categoryBadge}>
                          {product.danh_muc?.ten_danh_muc}
                        </span>
                        <span className={`${styles.stockBadge} ${getStockBadgeClass(product.so_luong_ton)}`}>
                          Tồn: {product.so_luong_ton}
                        </span>
                      </div>

                      {/* Add to Cart Button - Always visible */}
                      <button
                        className={styles.addToCartBtnCard}
                        onClick={() => {
                          addToCart({
                            id: product.id,
                            ten_tui: product.ten_tui,
                            gia_tien: product.gia_tien,
                            so_luong_ton: product.so_luong_ton,
                            hinh_anh: product.hinh_anh,
                          });
                        }}
                        disabled={product.so_luong_ton === 0}
                        title={product.so_luong_ton === 0 ? 'Hết hàng' : 'Thêm vào giỏ hàng'}
                      >
                        <Icon name="shoppingCart" size={16} />
                        {product.so_luong_ton === 0 ? 'Hết hàng' : 'Thêm vào giỏ'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Modal Chi tiết */}
          {showModal && selectedProduct && (
            <div className={styles.modalOverlay} onClick={closeModal}>
              <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                <button className={styles.modalClose} onClick={closeModal}>
                  <Icon name="x" size={24} />
                </button>

                <div className={styles.modalBody}>
                  <div className={styles.modalImage}>
                    <img
                      src={convertGoogleDriveLink(selectedProduct.hinh_anh)}
                      alt={selectedProduct.ten_tui}
                      onError={(e) => handleImageError(e, selectedProduct)}
                    />
                  </div>

                  <div className={styles.modalInfo}>
                    <h2 className={styles.modalTitle}>{selectedProduct.ten_tui}</h2>
                    <p className={styles.modalPrice}>{formatCurrency(selectedProduct.gia_tien)}</p>

                    <div className={styles.modalSection}>
                      <h4>Mô tả sản phẩm</h4>
                      <p>{selectedProduct.mo_ta}</p>
                    </div>

                    <div className={styles.modalSection}>
                      <h4>Thông tin chi tiết</h4>
                      <div className={styles.detailGrid}>
                        <div className={styles.detailItem}>
                          <span className={styles.detailLabel}>Danh mục:</span>
                          <span>{selectedProduct.danh_muc?.ten_danh_muc}</span>
                        </div>
                        <div className={styles.detailItem}>
                          <span className={styles.detailLabel}>Tồn kho:</span>
                          <span className={getStockBadgeClass(selectedProduct.so_luong_ton)}>
                            {selectedProduct.so_luong_ton} cái
                          </span>
                        </div>
                        <div className={styles.detailItem}>
                          <span className={styles.detailLabel}>Ngày tạo:</span>
                          <span>{formatDate(selectedProduct.ngay_tao)}</span>
                        </div>
                        <div className={styles.detailItem}>
                          <span className={styles.detailLabel}>Mã sản phẩm:</span>
                          <span>#{selectedProduct.id}</span>
                        </div>
                      </div>
                    </div>

                    <div className={styles.modalActions}>
                      <button className={styles.btnModalEdit} onClick={() => { closeModal(); handleEditProduct(selectedProduct); }}>
                        <Icon name="edit" size={18} />
                        Chỉnh sửa
                      </button>
                      <button
                        className={styles.btnModalDelete}
                        onClick={() => {
                          closeModal();
                          handleDelete(selectedProduct.id, selectedProduct.ten_tui);
                        }}
                      >
                        <Icon name="trash" size={18} />
                        Xóa sản phẩm
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Cart Modal */}
      <Cart isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />

      {/* Add/Edit Form Modal */}
      {showFormModal && (
        <div className={styles.modalOverlay} onClick={() => setShowFormModal(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button className={styles.modalClose} onClick={() => setShowFormModal(false)}>
              <Icon name="x" size={24} />
            </button>
            <h2 className={styles.modalTitle} style={{ padding: '32px 32px 0' }}>{isEditing ? 'Cập nhật sản phẩm' : 'Thêm sản phẩm mới'}</h2>

            <div className={styles.modalBody}>
              <div className={styles.formGroup}>
                <label>Tên túi xách <span style={{ color: 'red' }}>*</span></label>
                <input
                  type="text"
                  className={styles.formInput}
                  value={formData.ten_tui}
                  onChange={(e) => setFormData({ ...formData, ten_tui: e.target.value })}
                  placeholder="Nhập tên túi xách"
                />
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Giá tiền <span style={{ color: 'red' }}>*</span></label>
                  <input
                    type="number"
                    className={styles.formInput}
                    value={formData.gia_tien}
                    onChange={(e) => setFormData({ ...formData, gia_tien: e.target.value })}
                    placeholder="VNĐ"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Số lượng tồn <span style={{ color: 'red' }}>*</span></label>
                  <input
                    type="number"
                    className={styles.formInput}
                    value={formData.so_luong_ton}
                    onChange={(e) => setFormData({ ...formData, so_luong_ton: e.target.value })}
                    placeholder="0"
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label>Danh mục <span style={{ color: 'red' }}>*</span></label>
                <select
                  className={styles.formInput}
                  value={formData.danh_muc}
                  onChange={(e) => setFormData({ ...formData, danh_muc: e.target.value })}
                >
                  <option value="">-- Chọn danh mục --</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.ten_danh_muc}</option>
                  ))}
                </select>
              </div>

              <div className={styles.formGroup}>
                <label>Mô tả</label>
                <textarea
                  className={styles.formInput}
                  rows="4"
                  value={formData.mo_ta}
                  onChange={(e) => setFormData({ ...formData, mo_ta: e.target.value })}
                  placeholder="Mô tả chi tiết sản phẩm..."
                ></textarea>
              </div>

              <div className={styles.formGroup}>
                <label>Hình ảnh {!isEditing && <span style={{ color: 'red' }}>*</span>}</label>
                <div className={styles.imageUpload}>
                  {previewImage && (
                    <img src={previewImage} alt="Preview" className={styles.previewImg} />
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                </div>
              </div>

              <div className={styles.modalActions}>
                <button className={styles.btnCancel} onClick={() => setShowFormModal(false)}>Hủy</button>
                <button className={styles.btnSave} onClick={handleSaveProduct}>
                  {isEditing ? 'Lưu thay đổi' : 'Thêm mới'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductsPage;