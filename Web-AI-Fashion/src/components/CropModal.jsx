import React, { useRef, useState, useEffect } from 'react';

const CropModal = ({ src, onApply, onClose }) => {
  const canvasRef = useRef(null);
  const imgRef = useRef(null);

  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const posStartRef = useRef({ x: 0, y: 0 });

  const SIZE = 216; // khung vuông crop

  const draw = (img, p, s) => {
    const canvas = canvasRef.current;
    if (!canvas || !img) return;

    canvas.width = SIZE;
    canvas.height = SIZE;

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, SIZE, SIZE);
    ctx.fillStyle = '#f3f4f6';
    ctx.fillRect(0, 0, SIZE, SIZE);

    const drawWidth = img.width * s;
    const drawHeight = img.height * s;

    ctx.drawImage(img, p.x, p.y, drawWidth, drawHeight);

    ctx.strokeStyle = '#111827';
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, SIZE, SIZE);
  };

  useEffect(() => {
    if (!src) return;
    const img = new Image();
    img.onload = () => {
      imgRef.current = img;

      const initScale = Math.max(SIZE / img.width, SIZE / img.height);
      setScale(initScale);

      const newW = img.width * initScale;
      const newH = img.height * initScale;
      const initPos = {
        x: (SIZE - newW) / 2,
        y: (SIZE - newH) / 2,
      };
      setPos(initPos);
      posStartRef.current = initPos;

      draw(img, initPos, initScale);
    };
    img.src = src;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src]);

  useEffect(() => {
    if (!imgRef.current) return;
    draw(imgRef.current, pos, scale);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pos, scale]);

  const handleMouseDown = (e) => {
    if (!imgRef.current) return;
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX, y: e.clientY };
    posStartRef.current = { ...pos };
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    setPos({
      x: posStartRef.current.x + dx,
      y: posStartRef.current.y + dy,
    });
  };

  const stopDragging = () => {
    setIsDragging(false);
  };

  const handleZoom = (direction) => {
    if (!imgRef.current) return;
    const factor = direction === 'in' ? 1.1 : 0.9;
    const newScale = Math.max(0.1, scale * factor);
    setScale(newScale);
  };

  const handleApplyClick = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');
    onApply(dataUrl);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.4)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
      onMouseUp={stopDragging}
      onMouseLeave={stopDragging}
    >
      <div
        style={{
          background: '#fff',
          borderRadius: 12,
          padding: 20,
          width: 360,
          boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 style={{ margin: 0, marginBottom: 10, fontSize: 16 }}>
          Chỉnh ảnh cho vừa khung 216×216
        </h3>
        <p style={{ margin: 0, marginBottom: 8, fontSize: 12, color: '#6b7280' }}>
          Kéo ảnh bằng chuột, dùng nút phóng to/thu nhỏ bên dưới.
        </p>
        <div
          style={{
            width: SIZE,
            height: SIZE,
            borderRadius: 8,
            border: '1px solid #d1d5db',
            overflow: 'hidden',
            margin: '0 auto',
            cursor: isDragging ? 'grabbing' : 'grab',
          }}
        >
          <canvas
            ref={canvasRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            style={{ width: SIZE, height: SIZE, display: 'block' }}
          />
        </div>

        <div
          style={{
            marginTop: 12,
            display: 'flex',
            justifyContent: 'center',
            gap: 8,
          }}
        >
          <button
            onClick={() => handleZoom('out')}
            style={{
              padding: '4px 8px',
              fontSize: 12,
              borderRadius: 4,
              border: '1px solid #d1d5db',
              background: '#f9fafb',
              cursor: 'pointer',
            }}
          >
            Zoom -
          </button>
          <button
            onClick={() => handleZoom('in')}
            style={{
              padding: '4px 8px',
              fontSize: 12,
              borderRadius: 4,
              border: '1px solid #d1d5db',
              background: '#f9fafb',
              cursor: 'pointer',
            }}
          >
            Zoom +
          </button>
        </div>

        <div
          style={{
            marginTop: 16,
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 8,
          }}
        >
          <button
            onClick={onClose}
            style={{
              padding: '6px 12px',
              fontSize: 12,
              borderRadius: 4,
              border: '1px solid #d1d5db',
              background: '#fff',
              cursor: 'pointer',
            }}
          >
            Hủy
          </button>
          <button
            onClick={handleApplyClick}
            style={{
              padding: '6px 12px',
              fontSize: 12,
              borderRadius: 4,
              border: 'none',
              background: '#111827',
              color: '#fff',
              cursor: 'pointer',
            }}
          >
            Dùng ảnh này
          </button>
        </div>
      </div>
    </div>
  );
};

export default CropModal;
