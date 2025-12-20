import React, { useEffect, useState } from 'react';

const DrawingCanvas = ({ canvasRef, uploadedImage, hasDrawing, setHasDrawing, onClearAll }) => {
  const [isDrawing, setIsDrawing] = useState(false);
  const [brushSize, setBrushSize] = useState(1); // mặc định nhỏ nhất
  const [history, setHistory] = useState([]);

  // Khởi tạo canvas + vẽ ảnh upload nếu có
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const initCanvas = () => {
        const rect = canvas.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;

        const ctx = canvas.getContext('2d');
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.scale(dpr, dpr);
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.strokeStyle = '#000';
        ctx.lineWidth = brushSize;

        // Luôn fill nền trắng trước
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, rect.width, rect.height);
        if (uploadedImage) {
        const img = new Image();
        img.onload = () => {
            // Vẽ ảnh đè lên nền trắng
            ctx.drawImage(img, 0, 0, rect.width, rect.height);
            setHasDrawing(true);
        };
        img.src = uploadedImage;
        } else if (!hasDrawing) {
        // Không cần clearRect nữa vì đã fill trắng
        }
    };

    initCanvas();

    const handleResize = () => {
      initCanvas();
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [canvasRef, uploadedImage, brushSize, hasDrawing, setHasDrawing]);

  // update linewidth
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.lineWidth = brushSize;
  }, [brushSize, canvasRef]);

  const getPos = (e, canvas) => {
    const rect = canvas.getBoundingClientRect();
    const clientX = e.clientX ?? e.touches?.[0]?.clientX;
    const clientY = e.clientY ?? e.touches?.[0]?.clientY;
    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  };

  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    e.preventDefault();
    const ctx = canvas.getContext('2d');
    const { x, y } = getPos(e, canvas);
    setIsDrawing(true);
    setHasDrawing(true);
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    e.preventDefault();
    const ctx = canvas.getContext('2d');
    const { x, y } = getPos(e, canvas);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx.closePath();
      setHistory((prev) => [...prev, canvas.toDataURL()]);
    }
    setIsDrawing(false);
  };

  const handleUndo = () => {
    if (history.length === 0) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    ctx.clearRect(0, 0, rect.width, rect.height);

    const newHistory = [...history];
    newHistory.pop();
    setHistory(newHistory);

    if (newHistory.length > 0) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0, rect.width, rect.height);
      };
      img.src = newHistory[newHistory.length - 1];
    } else if (uploadedImage) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0, rect.width, rect.height);
      };
      img.src = uploadedImage;
    } else {
      setHasDrawing(false);
    }
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    ctx.clearRect(0, 0, rect.width, rect.height);
    setHistory([]);
    setHasDrawing(false);
    onClearAll?.();
  };

  const handleSizeChange = (e) => {
    const value = parseInt(e.target.value);
    setBrushSize(value);
    const handle = document.querySelector('.size_handle');
    if (handle) {
      const percentage = ((value - 1) / 19) * 100;
      handle.style.left = `${percentage}%`;
    }
  };

  return (
    <>
      {/* Thanh tool */}
      <div className="drawing_tools">
        <div className="tools">
          <div className="tool_selection">
            <div className="pen_tool">
              <div className="pen_icon">
                <img
                  className="pen"
                  src="https://seal-img.nos-jd.163yun.com/obj/w5rCgMKVw6DCmGzCmsK-/63720560495/1fb5/6352/eb69/ef42f93194bfb702f4737493d2dde884.png"
                  alt="pen"
                />
              </div>
              <span className="text_5">Pen</span>
            </div>
          </div>
          <div className="brush_settings">
            <div className="size_control">
              <span className="text_6">Size</span>
              <div className="size_slider">
                <input
                  type="range"
                  min="1"
                  max="20"
                  value={brushSize}
                  onChange={handleSizeChange}
                  style={{
                    position: 'absolute',
                    width: '100%',
                    height: '100%',
                    opacity: 0,
                    cursor: 'pointer',
                    zIndex: 1,
                  }}
                />
                <div
                  className="size_handle"
                  style={{ left: `${((brushSize - 1) / 19) * 100}%` }}
                ></div>
              </div>
            </div>
            <div className="actions">
              <div className="undo" onClick={handleUndo} style={{ cursor: 'pointer' }}>
                <img
                  className="undo_2"
                  src="https://seal-img.nos-jd.163yun.com/obj/w5rCgMKVw6DCmGzCmsK-/63720565248/1c2c/1ed9/c101/a14369c5ae7f6755b1378eb8f00c0564.png"
                  alt="undo"
                />
              </div>
              <div className="clear" onClick={handleClear} style={{ cursor: 'pointer' }}>
                <img
                  className="trash_2"
                  src="https://seal-img.nos-jd.163yun.com/obj/w5rCgMKVw6DCmGzCmsK-/63720563444/e384/73f2/a23e/6dc883fe52d0fe157b86354079fb07eb.png"
                  alt="clear"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Khung hình chữ nhật, ở giữa là ô vuông 400×400 */}
      <div className="canvas_area">
        <div
          style={{
            width: '100%',
            padding: '16px 0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background:
              'linear-gradient(90deg, #f3f4f6 0%, #e5e7eb 18%, #e5e7eb 82%, #f3f4f6 100%)',
          }}
        >
          <div
            style={{
              position: 'relative',
              width: 400,
              height: 400,
              borderRadius: 12,
              border: '1px solid #d1d5db',
              backgroundColor: '#ffffff',
              overflow: 'hidden',
              boxShadow: '0 4px 12px rgba(0,0,0,0.04)',
            }}
          >
            <canvas
              ref={canvasRef}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
              style={{
                width: '100%',
                height: '100%',
                cursor: 'crosshair',
                display: 'block',
              }}
            />
            {!hasDrawing && !uploadedImage && (
              <div
                style={{
                  position: 'absolute',
                  left: '50%',
                  top: '50%',
                  transform: 'translate(-50%, -50%)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textAlign: 'center',
                  pointerEvents: 'none',
                  padding: '12px',
                }}
              >
                <img
                  src="https://seal-img.nos-jd.163yun.com/obj/w5rCgMKVw6DCmGzCmsK-/63720561516/8282/8c60/9df7/ad10ba6bea0e23cb12f1448df5f385ad.png"
                  alt="paintbrush"
                  style={{ width: 36, height: 36, marginBottom: 6 }}
                />
                <span
                  style={{ fontSize: 13, fontWeight: 500, marginBottom: 2 }}
                >
                  Start drawing here
                </span>
                <span
                  style={{ fontSize: 11, color: '#6b7280', lineHeight: 1.3 }}
                >
                  Use your mouse or touch to draw
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default DrawingCanvas;
