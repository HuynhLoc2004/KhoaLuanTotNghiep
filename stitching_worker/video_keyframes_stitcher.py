import os
import sys
import argparse
import json

# Chuyển hướng xử lý sang stitcher.py (Pipeline Equirectangular 2:1 chuyên nghiệp)
# Loại bỏ hoàn toàn viền đen răng cưa và mép lượn sóng
try:
    from stitcher import run_stitch_video
except ImportError:
    script_dir = os.path.dirname(os.path.abspath(__file__))
    if script_dir not in sys.path:
        sys.path.insert(0, script_dir)
    from stitcher import run_stitch_video

def main():
    parser = argparse.ArgumentParser(description="Trích xuất Keyframe từ Video và ghép ảnh 360° Equirectangular chuẩn 2:1")
    parser.add_argument("--video", required=True, help="Đường dẫn file video đầu vào")
    parser.add_argument("--output", required=True, help="Đường dẫn file ảnh 360 đầu ra")
    parser.add_argument("--keyframes", "--max-keyframes", dest="max_keyframes", type=int, default=20, help="Số lượng keyframe tối đa")
    parser.add_argument("--width", type=int, default=0, help="Độ rộng mong muốn (tùy chọn)")
    args = parser.parse_args()

    max_kf = args.max_keyframes if args.max_keyframes > 0 else 20
    res = run_stitch_video(args.video, args.output, target_width=args.width, target_count=max_kf)
    print(json.dumps(res, ensure_ascii=False))

if __name__ == "__main__":
    main()

