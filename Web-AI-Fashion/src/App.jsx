import React, { useRef, useState } from 'react';
import './index.css';
import CropModal from './components/CropModal';
import DrawingCanvas from './components/DrawingCanvas';

const App = () => {
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  const [hasDrawing, setHasDrawing] = useState(false);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [generatedResult, setGeneratedResult] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const [cropSource, setCropSource] = useState(null);
  const [isCropOpen, setIsCropOpen] = useState(false);

  // Upload ảnh -> mở popup crop
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const imageUrl = event.target.result;
      setCropSource(imageUrl);
      setIsCropOpen(true);
    };
    reader.readAsDataURL(file);
  };

  // Áp dụng ảnh đã crop (216x216) vào canvas
  const handleApplyCrop = (dataUrl) => {
    setUploadedImage(dataUrl);
    setHasDrawing(true);
    setIsCropOpen(false);
    setCropSource(null);
  };

  const handleCancelCrop = () => {
    setIsCropOpen(false);
    setCropSource(null);
  };

  // Gửi canvas đến API /generate/ và nhận ảnh kết quả
  const handleGenerate = async () => {
    if (!hasDrawing && !uploadedImage) {
      alert('Hãy vẽ hoặc dùng một ảnh trước đã!');
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) {
      alert('Không tìm thấy canvas!');
      return;
    }

    setIsGenerating(true);

    try {
      // 1) Lấy blob từ canvas
      const blob = await new Promise((resolve) =>
        canvas.toBlob((b) => resolve(b), 'image/png')
      );

      if (!blob) {
        throw new Error('Không tạo được blob từ canvas');
      }

      // 2) FormData với key "file"
      const formData = new FormData();
      formData.append('file', blob, 'input.png');

      // 3) Gửi POST tới FastAPI
      const response = await fetch('http://192.168.23.31:8080/generate/', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const text = await response.text();
        console.error('API error body:', text);
        throw new Error(`Lỗi API: ${response.status} ${response.statusText}`);
      }

      // 4) Nhận ảnh trả về dạng blob
      const resultBlob = await response.blob();
      const resultUrl = URL.createObjectURL(resultBlob);

      setGeneratedResult(resultUrl);
    } catch (err) {
      console.error(err);
      alert('Có lỗi khi gọi API generate. Kiểm tra console để xem chi tiết.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleClearAll = () => {
    setUploadedImage(null);
    setGeneratedResult(null);
  };

  return (
    <div className="simple_drawing_app">
      {/* Popup crop nếu có */}
      {isCropOpen && cropSource && (
        <CropModal src={cropSource} onApply={handleApplyCrop} onClose={handleCancelCrop} />
      )}

      <div className="header">
        <div className="header_content">
          <div className="logo_section">
            <img
              className="palette"
              src="https://seal-img.nos-jd.163yun.com/obj/w5rCgMKVw6DCmGzCmsK-/63720560369/f534/0a56/1f12/db21dadb7f75d81f1fd3069babf9722b.png"
              alt="palette"
            />
            <span className="text">AI Art Creator</span>
          </div>
          <div
            className="generate_button"
            onClick={handleGenerate}
            style={{ cursor: 'pointer' }}
          >
            <img
              className="wand_sparkles"
              src="https://seal-img.nos-jd.163yun.com/obj/w5rCgMKVw6DCmGzCmsK-/63720564242/79c1/d7d8/64b4/4a83586e6f43f8d170dbe106f539aab7.png"
              alt="wand sparkles"
            />
            <span className="text_1">{isGenerating ? 'Generating...' : 'Generate'}</span>
          </div>
        </div>
      </div>

      <div className="main_content">
        {/* LEFT: upload + vẽ */}
        <div className="drawing_panel">
          <div className="panel_header">
            <span className="text_2">Draw or Upload Image</span>
          </div>
          <div className="content_area">
            {/* Upload */}
            <div className="upload_section">
              <div className="upload_area">
                <div className="upload_content">
                  <img
                    className="upload"
                    src="https://seal-img.nos-jd.163yun.com/obj/w5rCgMKVw6DCmGzCmsK-/63720561381/7cf4/f67d/b790/46e34c0065cf0d2b72e39bcf8cebe3bf.png"
                    alt="upload"
                  />
                  <span className="text_3">Upload image or draw below</span>
                  <span
                    className="text_4"
                    onClick={() => fileInputRef.current?.click()}
                    style={{ cursor: 'pointer' }}
                  >
                    Browse
                  </span>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    style={{ display: 'none' }}
                  />
                </div>
              </div>
            </div>

            {/* Drawing component */}
            <DrawingCanvas
              canvasRef={canvasRef}
              uploadedImage={uploadedImage}
              hasDrawing={hasDrawing}
              setHasDrawing={setHasDrawing}
              onClearAll={handleClearAll}
            />
          </div>
        </div>

        {/* RIGHT: result */}
        <div className="result_panel">
          <div className="panel_header_1">
            <span className="text_9">Generated Result</span>
          </div>
          <div className="result_area">
            <div className="result_container">
              {isGenerating ? (
                <div className="waiting_state">
                  <div className="ai_icon">
                    <img
                      className="bot"
                      src="https://seal-img.nos-jd.163yun.com/obj/w5rCgMKVw6DCmGzCmsK-/63720561566/cf58/1181/6b03/1afda62312010d23bead1d97fb1e77bf.png"
                      alt="bot"
                    />
                  </div>
                  <div className="message">
                    <span className="text_10">Generating...</span>
                    <span className="text_11">Please wait while we create</span>
                    <span className="text_12">your AI art masterpiece</span>
                  </div>
                </div>
              ) : generatedResult ? (
                <img
                  src={generatedResult}
                  alt="Generated result"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                    borderRadius: '8px',
                  }}
                />
              ) : (
                <div className="waiting_state">
                  <div className="ai_icon">
                    <img
                      className="bot"
                      src="https://seal-img.nos-jd.163yun.com/obj/w5rCgMKVw6DCmGzCmsK-/63720561566/cf58/1181/6b03/1afda62312010d23bead1d97fb1e77bf.png"
                      alt="bot"
                    />
                  </div>
                  <div className="message">
                    <span className="text_10">Ready to generate</span>
                    <span className="text_11">
                      Draw something or upload an image,
                    </span>
                    <span className="text_12">
                      then click Generate to create AI art
                    </span>
                  </div>
                  <div className="example_action">
                    <img
                      className="arrow_right"
                      src="https://seal-img.nos-jd.163yun.com/obj/w5rCgMKVw6DCmGzCmsK-/63720563550/682c/e48a/2fb1/a5f509770aa039beb678569cf08315a2.png"
                      alt="arrow right"
                    />
                    <span className="text_13">Click Generate above</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default App;
