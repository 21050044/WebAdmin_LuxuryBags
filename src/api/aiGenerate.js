// API Service cho AI Generate
// Gửi canvas đến API /generate/ và nhận ảnh kết quả
import config from '../config/config.js';

/**
 * Generate AI art từ canvas
 * @param {HTMLCanvasElement} canvas - Canvas element chứa hình vẽ hoặc ảnh upload
 * @returns {Promise<{success: boolean, data?: string, error?: string}>}
 */
export const generateAIArt = async (canvas) => {
  if (!canvas) {
    return {
      success: false,
      error: 'Không tìm thấy canvas!',
    };
  }

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

    // 3) Gửi POST tới FastAPI (sử dụng AI API mới)
    const apiUrl = config.getAiApiUrl(config.API_ENDPOINTS.AI_GENERATE);
    const response = await fetch(apiUrl, {
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

    return {
      success: true,
      data: resultUrl,
    };
  } catch (err) {
    console.error('Error generating AI art:', err);
    return {
      success: false,
      error: err.message || 'Có lỗi khi gọi API generate. Kiểm tra console để xem chi tiết.',
    };
  }
};

