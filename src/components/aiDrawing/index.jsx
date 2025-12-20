import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { generateAIArt } from '../../api/aiGenerate';
import { saveToCollection, getStaffCollection, deleteFromCollection } from '../../api/staffCollection';
import { convertGoogleDriveLink } from '../../api/products';
import { logout } from '../../api/login';
import styles from './index.module.css';
import homeStyles from '../home/index.module.css';
import Sidebar from '../shared/Sidebar';

// SVG Icons (Tái sử dụng code cũ nhưng tối ưu lại)
const Icon = ({ name, size = 20, color = 'currentColor' }) => {
  const icons = {
    brush: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><path d="M12 19l7-7 3 3-7 7-3-3z" /><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" /><path d="M2 2l7.586 7.586" /><circle cx="11" cy="11" r="2" /></svg>,
    upload: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>,
    sparkles: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><path d="M12 3v4m0 10v4M3 12h4m10 0h4M6.343 6.343l2.828 2.828m5.656 5.656l2.828 2.828M6.343 17.657l2.828-2.828m5.656-5.656l2.828-2.828" /></svg>,
    download: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>,
    gallery: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></svg>,
    trash: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>,
    close: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>,
    eraser: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><path d="M20 20H7L3 16c-.6-.6-.6-1.5 0-2.1l10-10c.6-.6 1.5-.6 2.1 0l5.9 5.9c.6.6.6 1.5 0 2.1L14 19" /><path d="M7 20l-4-4" /></svg>
  };
  return icons[name] || null;
};

// Component Crop Modal (Giữ nguyên logic cũ)
const CropModal = ({ src, onApply, onClose }) => {
  const canvasRef = useRef(null);
  const [cropSize] = useState(216);

  useEffect(() => {
    if (!src || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.onload = () => {
      const size = Math.min(img.width, img.height);
      const x = (img.width - size) / 2;
      const y = (img.height - size) / 2;
      canvas.width = cropSize;
      canvas.height = cropSize;
      ctx.drawImage(img, x, y, size, size, 0, 0, cropSize, cropSize);
    };
    img.src = src;
  }, [src, cropSize]);

  const handleApply = () => {
    if (canvasRef.current) {
      onApply(canvasRef.current.toDataURL('image/png'));
    }
  };

  return (
    <div className={styles.modal_overlay}>
      <div className={styles.modal_content} style={{ width: '400px', height: 'auto', padding: '20px' }}>
        <h3 style={{ margin: '0 0 16px', textAlign: 'center' }}>Cắt ảnh (Crop)</h3>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
          <canvas ref={canvasRef} style={{ border: '1px solid #e5e7eb', borderRadius: '4px' }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
          <button onClick={onClose} className={styles.btn_outline} style={{ height: '32px', fontSize: '13px', padding: '0 12px' }}>Hủy</button>
          <button onClick={handleApply} className={styles.btn_primary} style={{ width: 'auto', height: '32px', fontSize: '13px', padding: '0 12px' }}>Sử dụng</button>
        </div>
      </div>
    </div>
  );
};

// Component Drawing Canvas (Đã tối ưu layout)
const DrawingCanvas = ({ canvasRef, uploadedImage, setHasDrawing, onClearAll }) => {
  const [isDrawing, setIsDrawing] = useState(false);
  const [brushSize, setBrushSize] = useState(2);
  const [isEraser, setIsEraser] = useState(false);

  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    canvas.width = 500;
    canvas.height = 500;
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (uploadedImage) {
      const img = new Image();
      img.onload = () => ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      img.src = uploadedImage;
    }
  }, [uploadedImage]);

  const startDrawing = (e) => {
    setIsDrawing(true);
    const ctx = canvasRef.current.getContext('2d');
    ctx.beginPath();
    const rect = canvasRef.current.getBoundingClientRect();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const ctx = canvasRef.current.getContext('2d');
    const rect = canvasRef.current.getBoundingClientRect();
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.strokeStyle = isEraser ? '#ffffff' : '#000000';
    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    ctx.stroke();
    setHasDrawing(true);
  };

  return (
    <>
      <div className={styles.canvas_wrapper}>
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={() => setIsDrawing(false)}
          onMouseLeave={() => setIsDrawing(false)}
          style={{ width: '500px', height: '500px', cursor: 'crosshair' }}
        />
      </div>

      {/* Floating Toolbar */}
      <div className={styles.floating_tools}>
        <div
          className={styles.tool_item}
          onClick={() => setIsEraser(false)}
          style={{
            background: !isEraser ? '#e5e7eb' : 'transparent',
            padding: '6px 10px',
            borderRadius: '6px'
          }}
        >
          <Icon name="brush" size={16} />
          <span style={{ fontSize: '12px', fontWeight: 600 }}>Cọ vẽ</span>
        </div>
        <div
          className={styles.tool_item}
          onClick={() => setIsEraser(true)}
          style={{
            background: isEraser ? '#e5e7eb' : 'transparent',
            padding: '6px 10px',
            borderRadius: '6px'
          }}
        >
          <Icon name="eraser" size={16} />
          <span style={{ fontSize: '12px', fontWeight: 600 }}>Tẩy</span>
        </div>
        <input
          type="range"
          min="1"
          max="30"
          value={brushSize}
          onChange={(e) => setBrushSize(Number(e.target.value))}
          className={styles.size_slider}
          title="Kích thước"
        />
        <div className={styles.tool_item} onClick={onClearAll} style={{ color: '#ef4444' }}>
          <Icon name="trash" size={16} color="#ef4444" />
          <span style={{ fontSize: '12px', fontWeight: 600 }}>Xóa hết</span>
        </div>
      </div>
    </>
  );
};

// Component Gallery Modal
const GalleryModal = ({ isOpen, onClose, collection, loading, onRefresh, onDelete }) => {
  if (!isOpen) return null;

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa mẫu này?')) return;
    const result = await deleteFromCollection(id);
    if (result.success) {
      onRefresh(); // Reload list after delete
    } else {
      alert('Lỗi xóa: ' + result.error);
    }
  };

  return (
    <div className={styles.modal_overlay}>
      <div className={styles.modal_content}>
        <div className={styles.modal_header}>
          <div className={styles.modal_title}>Thư viện thiết kế ({collection.length})</div>
          <button onClick={onClose} className={styles.modal_close}>
            <Icon name="close" size={24} />
          </button>
        </div>
        <div className={styles.gallery_grid}>
          {loading ? (
            <p style={{ textAlign: 'center', width: '100%', color: '#6b7280' }}>Đang tải...</p>
          ) : collection.length === 0 ? (
            <p style={{ textAlign: 'center', width: '100%', color: '#9ca3af' }}>Chưa có mẫu nào.</p>
          ) : (
            collection.map((item, index) => (
              <div key={item.id || index} className={styles.gallery_item}>
                <img
                  src={convertGoogleDriveLink(item.drive_url)}
                  className={styles.gallery_img}
                  alt="Design"
                  onError={(e) => e.target.src = 'https://via.placeholder.com/200x200?text=No+Image'}
                />
                {/* Delete button overlay */}
                <button
                  onClick={() => handleDelete(item.id)}
                  style={{
                    position: 'absolute',
                    top: '8px',
                    right: '8px',
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    background: 'rgba(239, 68, 68, 0.9)',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    opacity: 0.7,
                    transition: 'opacity 0.2s',
                  }}
                  onMouseEnter={(e) => e.target.style.opacity = '1'}
                  onMouseLeave={(e) => e.target.style.opacity = '0.7'}
                  title="Xóa"
                >
                  <Icon name="trash" size={14} color="#fff" />
                </button>
              </div>
            ))
          )}
        </div>
        <div style={{ padding: '16px 24px', borderTop: '1px solid #e5e7eb', textAlign: 'right' }}>
          <button className={styles.btn_outline} onClick={onRefresh} style={{ display: 'inline-flex' }}>
            Làm mới danh sách
          </button>
        </div>
      </div>
    </div>
  );
};

const AIDrawingPage = () => {
  const navigate = useNavigate();
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  const [hasDrawing, setHasDrawing] = useState(false);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [generatedResult, setGeneratedResult] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Gallery Logic
  const [showGallery, setShowGallery] = useState(false);
  const [collection, setCollection] = useState([]);
  const [loadingCollection, setLoadingCollection] = useState(false);

  // Crop Logic
  const [cropSource, setCropSource] = useState(null);

  const loadCollection = async () => {
    setLoadingCollection(true);
    try {
      const result = await getStaffCollection();
      if (result.success) setCollection(result.data || []);
    } catch (err) { console.error(err); }
    finally { setLoadingCollection(false); }
  };

  // Load collection lần đầu chỉ để cache, người dùng mở modal mới thấy
  useEffect(() => { loadCollection(); }, []);

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setCropSource(ev.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    if (!hasDrawing && !uploadedImage) return alert('Vui lòng vẽ hoặc tải ảnh lên!');
    setIsGenerating(true);
    try {
      const result = await generateAIArt(canvasRef.current);
      if (result.success) setGeneratedResult(result.data);
      else alert(result.error || 'Lỗi tạo ảnh');
    } catch (err) { console.error(err); }
    finally { setIsGenerating(false); }
  };

  const handleSave = async () => {
    if (!generatedResult) return;
    setIsSaving(true);
    try {
      const res = await fetch(generatedResult);
      const blob = await res.blob();
      const file = new File([blob], 'design.png', { type: 'image/png' });
      const result = await saveToCollection(file, '');
      if (result.success) {
        alert('Đã lưu thành công!');
        loadCollection();
      } else alert(result.error);
    } catch (err) { console.error(err); }
    finally { setIsSaving(false); }
  };

  const handleClear = () => {
    setUploadedImage(null);
    setGeneratedResult(null);
    setHasDrawing(false);
    // Canvas clear logic nằm ở trong DrawingCanvas component qua props nhưng ở đây reset state
    // Để clear thật sự cần trick force update hoặc context, nhưng ở đây setUploadedImage(null) sẽ trigger redraw trắng
  };

  return (
    <div className={homeStyles.homeContainer}>
      <Sidebar activeMenu="ai-design" />

      <main className={homeStyles.mainContent} style={{ padding: 0 }}>
        <div className={styles.studio_container}>

          {/* HEADER */}
          <header className={styles.header}>
            <div className={styles.brand}>
              <Icon name="sparkles" /> AI Design Studio
            </div>
            <div className={styles.header_actions}>
              <button
                className={styles.btn_outline}
                onClick={() => { setShowGallery(true); loadCollection(); }}
              >
                <Icon name="gallery" /> Bộ sưu tập
              </button>
            </div>
          </header>

          {/* MAIN WORKSPACE */}
          <div className={styles.workspace}>

            {/* LEFT: CANVAS */}
            <div className={styles.canvas_section}>
              <DrawingCanvas
                canvasRef={canvasRef}
                uploadedImage={uploadedImage}
                setHasDrawing={setHasDrawing}
                onClearAll={handleClear}
              />
            </div>

            {/* RIGHT: CONTROLS */}
            <div className={styles.control_panel}>

              {/* Block 1: Input */}
              <div className={styles.panel_block}>
                <div className={styles.block_title}>Nguồn Ảnh</div>
                <div className={styles.upload_box} onClick={() => fileInputRef.current?.click()}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                    <Icon name="upload" size={24} color="#6b7280" />
                    <span style={{ fontSize: '13px', color: '#374151' }}>Tải ảnh lên để vẽ đè</span>
                  </div>
                  <input ref={fileInputRef} type="file" hidden accept="image/*" onChange={handleFileUpload} />
                </div>
              </div>

              {/* Block 2: Action */}
              <div className={styles.panel_block}>
                <button
                  className={styles.btn_primary}
                  onClick={handleGenerate}
                  disabled={isGenerating}
                >
                  <Icon name="sparkles" />
                  {isGenerating ? 'Đang sáng tạo...' : 'Tạo Thiết Kế AI'}
                </button>
              </div>

              {/* Block 3: Result */}
              <div className={styles.panel_block} style={{ borderBottom: 'none', flex: 1 }}>
                <div className={styles.block_title}>Kết quả</div>
                <div className={styles.result_box}>
                  {generatedResult ? (
                    <img src={generatedResult} alt="Result" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                  ) : (
                    <div style={{ textAlign: 'center', padding: '20px' }}>
                      <Icon name="sparkles" size={40} color="#e5e7eb" />
                      <p className={styles.placeholder_text}>Kết quả sẽ hiện ở đây</p>
                    </div>
                  )}
                </div>

                {generatedResult && (
                  <button
                    className={styles.btn_primary}
                    style={{ marginTop: '16px', backgroundColor: '#ffffff', color: '#111827', border: '1px solid #e5e7eb' }}
                    onClick={handleSave}
                    disabled={isSaving}
                  >
                    <Icon name="download" /> {isSaving ? 'Đang lưu...' : 'Lưu mẫu này'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* MODALS */}
        {cropSource && (
          <CropModal
            src={cropSource}
            onApply={(url) => { setUploadedImage(url); setHasDrawing(true); setCropSource(null); }}
            onClose={() => setCropSource(null)}
          />
        )}

        <GalleryModal
          isOpen={showGallery}
          onClose={() => setShowGallery(false)}
          collection={collection}
          loading={loadingCollection}
          onRefresh={loadCollection}
        />

      </main>
    </div>
  );
};

export default AIDrawingPage;