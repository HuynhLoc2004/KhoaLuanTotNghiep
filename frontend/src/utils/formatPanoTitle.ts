/**
 * Chuẩn hóa tiêu đề hiển thị cho ảnh 360° và gian phòng di sản:
 * Biến các tên file kỹ thuật dạng 'stitched_video_360_1791604501379.jpg' thành
 * tên gọi trang nhã, giàu ý nghĩa văn hóa và nhận diện ngay gian phòng liên kết.
 */
export function formatPanoTitle(
  filename?: string,
  customTitle?: string,
  assignedRooms?: string[],
  createdAt?: string
): string {
  // 1. Nếu ảnh đã được gán cho 1 hoặc nhiều gian phòng, ưu tiên hiển thị tên gian phòng
  if (assignedRooms && assignedRooms.length > 0) {
    const validRooms = assignedRooms.filter(Boolean);
    if (validRooms.length > 0) {
      return `Gian phòng: ${validRooms.join(', ')}`;
    }
  }

  // 2. Nếu có tiêu đề tùy chỉnh được đặt trước và không phải là tên file kỹ thuật
  if (
    customTitle &&
    customTitle.trim().length > 0 &&
    !customTitle.startsWith('stitched_') &&
    !/\.(jpe?g|png|webp|heic)$/i.test(customTitle)
  ) {
    return customTitle.trim();
  }

  const raw = (customTitle || filename || '').trim();
  if (!raw) return 'Không gian toàn cảnh 360°';

  // Trích xuất dấu ấn số timestamp (ví dụ 1791604501379)
  const tsMatch = raw.match(/\d{10,}/);
  let timeLabel = '';
  if (tsMatch) {
    const tsNum = Number(tsMatch[0]);
    if (!isNaN(tsNum) && tsNum > 1000000000000) {
      try {
        const d = new Date(tsNum);
        timeLabel = `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
      } catch (_) {}
    }
  } else if (createdAt) {
    try {
      const d = new Date(createdAt);
      timeLabel = `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
    } catch (_) {}
  }

  // Nhận diện theo nguồn tạo ảnh
  const isVideo = /video/i.test(raw);
  const isRoomMultiAngle = /room/i.test(raw);

  if (isVideo) {
    return timeLabel
      ? `Không gian 360° (Quét video • ${timeLabel})`
      : 'Không gian 360° (Quét từ video)';
  }

  if (isRoomMultiAngle) {
    return timeLabel
      ? `Toàn cảnh di sản 360° (Đa góc • ${timeLabel})`
      : 'Toàn cảnh di sản 360°';
  }

  if (timeLabel) {
    return `Không gian toàn cảnh 360° (${timeLabel})`;
  }

  // Làm sạch chuỗi thông thường: bỏ phần mở rộng file và tiền tố stitched_
  const cleaned = raw
    .replace(/\.[^/.]+$/, '')
    .replace(/^stitched_/, '')
    .replace(/_/g, ' ')
    .trim();

  return cleaned ? `Không gian 360°: ${cleaned}` : 'Không gian toàn cảnh 360°';
}
