import sys
import os
import traceback

def remove_background(input_path: str, output_path: str) -> bool:
    try:
        from PIL import Image
        import rembg

        if not os.path.exists(input_path):
            print(f"[remove_bg] Input file does not exist: {input_path}", file=sys.stderr)
            return False

        img = Image.open(input_path).convert("RGB")
        
        # Sử dụng rembg tách nền với u2net / u2netp
        session = rembg.new_session("u2netp")
        result = rembg.remove(img, session=session)

        # Cắt cúp ôm sát biên dạng hiện vật (tight crop around alpha bounding box)
        bbox = result.getbbox()
        if bbox:
            # Thêm lề nhỏ (padding) 2% để không sát mép hiện vật
            w, h = result.size
            pad_x = int(w * 0.02)
            pad_y = int(h * 0.02)
            crop_box = (
                max(0, bbox[0] - pad_x),
                max(0, bbox[1] - pad_y),
                min(w, bbox[2] + pad_x),
                min(h, bbox[3] + pad_y)
            )
            result = result.crop(crop_box)

        os.makedirs(os.path.dirname(os.path.abspath(output_path)), exist_ok=True)
        result.save(output_path, "PNG", optimize=True)
        print(f"[remove_bg] SUCCESS: {output_path}")
        return True
    except Exception as e:
        print(f"[remove_bg] ERROR: {e}\n{traceback.format_exc()}", file=sys.stderr)
        return False

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python remove_bg.py <input_path> <output_path>")
        sys.exit(1)

    in_file = sys.argv[1]
    out_file = sys.argv[2]
    ok = remove_background(in_file, out_file)
    sys.exit(0 if ok else 1)
