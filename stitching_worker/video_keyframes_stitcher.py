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

    # Lấy mẫu mỗi ~0.3 giây
    sample_interval = max(1, int(fps * 0.3))

    sift = cv2.SIFT_create(nfeatures=600)
    bf = cv2.BFMatcher(cv2.NORM_L2, crossCheck=False)

    det_w = 360
    det_h = int(h_orig * (det_w / float(w_orig)))
    target_dx_min = det_w * 0.22  # ~80px

    keyframes = []
    last_des, last_kp = None, None

    frame_idx = 0
    while frame_idx < total_frames:
        cap.set(cv2.CAP_PROP_POS_FRAMES, frame_idx)
        ret, frame = cap.read()
        if not ret:
            break

        small = cv2.resize(frame, (det_w, det_h))
        gray = cv2.cvtColor(small, cv2.COLOR_BGR2GRAY)
        sharpness = float(cv2.Laplacian(gray, cv2.CV_64F).var())

        # Loại bỏ khung hình bị mờ do rung tay lia nhanh
        if sharpness < 75.0:
            frame_idx += sample_interval
            continue

        kp, des = sift.detectAndCompute(gray, None)
        if des is None or len(des) < 20:
            frame_idx += sample_interval
            continue

        if len(keyframes) == 0:
            keyframes.append((frame_idx, frame))
            last_des, last_kp = des, kp
        else:
            matches = bf.knnMatch(last_des, des, k=2)
            good = [m[0] for m in matches if len(m) == 2 and m[0].distance < 0.75 * m[1].distance]
            if len(good) >= 12:
                pts1 = np.float32([last_kp[m.queryIdx].pt for m in good])
                pts2 = np.float32([kp[m.trainIdx].pt for m in good])
                diffs = pts1 - pts2
                dx = float(np.median(diffs[:, 0]))

                if dx >= target_dx_min:
                    keyframes.append((frame_idx, frame))
                    last_des, last_kp = des, kp

                    if len(keyframes) >= max_keyframes:
                        break

        frame_idx += sample_interval

    cap.release()

    if len(keyframes) < 2:
        return {"success": False, "message": "Không đủ góc nhìn hợp lệ từ video để ghép 360°"}

    images = [k[1] for k in keyframes]

    stitcher = cv2.Stitcher_create(cv2.Stitcher_PANORAMA)
    status, pano = stitcher.stitch(images)

    if status != cv2.Stitcher_OK and len(images) > 8:
        # Thử lại với subset 12 ảnh đầu tiên nếu tập ảnh quá lớn
        status, pano = stitcher.stitch(images[:14])

    if status == cv2.Stitcher_OK and pano is not None:
        os.makedirs(os.path.dirname(os.path.abspath(output_path)), exist_ok=True)
        cv2.imwrite(output_path, pano)
        ph, pw = pano.shape[:2]
        return {
            "success": True,
            "keyframes_count": len(keyframes),
            "width": pw,
            "height": ph,
            "output": output_path
        }
    else:
        return {"success": False, "message": f"Thuật toán ghép không thể hội tụ (mã lỗi: {status})"}

def main():
    parser = argparse.ArgumentParser(description="Trích xuất Keyframe từ Video và ghép ảnh 360°")
    parser.add_argument("--video", required=True, help="Đường dẫn file video đầu vào")
    parser.add_argument("--output", required=True, help="Đường dẫn file ảnh 360 đầu ra")
    parser.add_argument("--max-keyframes", type=int, default=20, help="Số lượng keyframe tối đa")
    args = parser.parse_args()

    res = extract_and_stitch(args.video, args.output, args.max_keyframes)
    print(json.dumps(res, ensure_ascii=False))

if __name__ == "__main__":
    main()
