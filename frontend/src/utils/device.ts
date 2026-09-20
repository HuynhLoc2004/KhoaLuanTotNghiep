/**
 * Nhận biết thiết bị có camera gốc chụp được qua thuộc tính `capture` hay không.
 *
 * Thẻ `<input type="file" capture="environment">` chỉ mở thẳng ứng dụng máy ảnh
 * trên điện thoại/máy tính bảng. Trên máy tính để bàn và laptop, trình duyệt bỏ
 * qua thuộc tính này và rơi về hộp thoại chọn file, khiến nút "Chụp camera"
 * trông y hệt nút "Chọn từ máy".
 */
export const supportsNativeCameraCapture = (): boolean => {
  if (typeof window === 'undefined' || typeof document === 'undefined') return false;

  const hasCaptureAttribute = 'capture' in document.createElement('input');
  const hasCoarsePointer = window.matchMedia
    ? window.matchMedia('(pointer: coarse)').matches
    : false;
  const hasTouch = (navigator.maxTouchPoints ?? 0) > 0;

  return hasCaptureAttribute && hasCoarsePointer && hasTouch;
};

/** Máy có webcam điều khiển được qua WebRTC hay không. */
export const supportsWebcam = (): boolean =>
  typeof navigator !== 'undefined' && !!navigator.mediaDevices?.getUserMedia;
