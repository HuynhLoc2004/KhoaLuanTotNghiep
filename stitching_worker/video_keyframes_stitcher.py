import cv2
import numpy as np
import os
import sys
import argparse
import json

sys.stdout.reconfigure(encoding='utf-8')

def extract_and_stitch(video_path, output_path, max_keyframes=24):
    if not os.path.exists(video_path):
        return {"success": False, "message": f"Không tìm thấy file video: {video_path}"}

    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        return {"success": False, "message": "Không thể mở file video bằng OpenCV"}

    fps = cap.get(cv2.CAP_PROP_FPS) or 30.0
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    w_orig = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    h_orig = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    duration_sec = total_frames / float(fps) if fps > 0 else 0

    if total_frames < 10:
        cap.release()
        return {"success": False, "message": "Video quá ngắn để ghép toàn cảnh 360°"}

    # Xác định số lượng khung hình tối ưu trải đều 100% thời lượng video (từ 0s đến hết video)
    # 20 - 24 khung hình trải đều là tỷ lệ vàng: đủ gối đầu 60-70% khắp 360 độ và OpenCV hội tụ trong vài giây
    target_kfs = max(18, min(24, max_keyframes if max_keyframes > 0 else int(duration_sec / 2.0)))
    segment_size = total_frames / float(target_kfs)

    det_w = 360
    det_h = int(h_orig * (det_w / float(w_orig)))

    keyframes = []

    for seg_i in range(target_kfs):
        start_frame = int(seg_i * segment_size)
        end_frame = int((seg_i + 1) * segment_size)
        # Khảo sát 5 vị trí trong phân đoạn này để chọn khung hình sắc nét nhất (chống nhòe do lia nhanh)
        candidates = np.linspace(start_frame, max(start_frame, end_frame - 1), 5, dtype=int)
        best_frame = None
        best_sharpness = -1.0

        for c_idx in candidates:
            cap.set(cv2.CAP_PROP_POS_FRAMES, int(c_idx))
            ret, frame = cap.read()
            if not ret:
                continue
            small = cv2.resize(frame, (det_w, det_h))
            gray = cv2.cvtColor(small, cv2.COLOR_BGR2GRAY)
            sharp = float(cv2.Laplacian(gray, cv2.CV_64F).var())
            if sharp > best_sharpness:
                best_sharpness = sharp
                best_frame = frame

        if best_frame is not None:
            keyframes.append(best_frame)

    cap.release()

    if len(keyframes) < 3:
        return {"success": False, "message": "Không đủ khung hình sắc nét từ video để ghép 360°"}

    stitcher = cv2.Stitcher_create(cv2.Stitcher_PANORAMA)
    # Giữ nguyên 100% độ phân giải gốc của camera
    try:
        stitcher.setCompositingResol(-1)
        stitcher.setRegistrationResol(0.5)
        stitcher.setPanoConfidenceThresh(0.6)
    except Exception:
        pass

    status, pano = stitcher.stitch(keyframes)

    if status != cv2.Stitcher_OK and len(keyframes) > 10:
        # Fallback thông minh: Lấy bước nhảy cách 1 frame (vẫn trải đều 100% video từ đầu đến cuối)
        stride_frames = keyframes[::2]
        if len(stride_frames) >= 8:
            status, pano = stitcher.stitch(stride_frames)

    if status == cv2.Stitcher_OK and pano is not None:
        # Cắt bớt viền đen uốn cong để ảnh thành hình chữ nhật phẳng đẹp
        gray = cv2.cvtColor(pano, cv2.COLOR_BGR2GRAY)
        _, thresh = cv2.threshold(gray, 2, 255, cv2.THRESH_BINARY)
        contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        if contours:
            c = max(contours, key=cv2.contourArea)
            x, y, w, h = cv2.boundingRect(c)
            # Cắt bớt 2% biên trên dưới để loại bỏ mép cong
            my = int(h * 0.02)
            mx = int(w * 0.01)
            y1 = min(y + my, pano.shape[0] - 10)
            y2 = max(y + h - my, y1 + 10)
            x1 = min(x + mx, pano.shape[1] - 10)
            x2 = max(x + w - mx, x1 + 10)
            if y2 > y1 and x2 > x1:
                pano = pano[y1:y2, x1:x2]

        os.makedirs(os.path.dirname(os.path.abspath(output_path)), exist_ok=True)
        cv2.imwrite(output_path, pano, [int(cv2.IMWRITE_JPEG_QUALITY), 96])
        ph, pw = pano.shape[:2]
        aspect = round(pw / float(ph), 2) if ph > 0 else 2.0
        vaov = 70.0
        haov = min(360.0, round(vaov * aspect, 1))
        return {
            "success": True,
            "keyframes_count": len(keyframes),
            "width": pw,
            "height": ph,
            "aspectRatio": aspect,
            "haov": haov,
            "vaov": vaov,
            "output": output_path
        }
    else:
        return {"success": False, "message": f"Thuật toán ghép không thể hội tụ (mã lỗi: {status})"}

def main():
    parser = argparse.ArgumentParser(description="Trích xuất Keyframe từ Video và ghép ảnh 360°")
    parser.add_argument("--video", required=True, help="Đường dẫn file video đầu vào")
    parser.add_argument("--output", required=True, help="Đường dẫn file ảnh 360 đầu ra")
    parser.add_argument("--keyframes", "--max-keyframes", dest="max_keyframes", type=int, default=20, help="Số lượng keyframe tối đa")
    parser.add_argument("--width", type=int, default=0, help="Độ rộng mong muốn (tùy chọn)")
    args = parser.parse_args()

    max_kf = args.max_keyframes if args.max_keyframes > 0 else 20
    res = extract_and_stitch(args.video, args.output, max_kf)
    print(json.dumps(res, ensure_ascii=False))

if __name__ == "__main__":
    main()
