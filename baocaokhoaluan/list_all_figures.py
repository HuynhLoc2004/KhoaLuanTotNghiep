# -*- coding: utf-8 -*-
import glob, re

for ch in sorted(glob.glob('baocaokhoaluan/thesis_chapter_*.py')):
    with open(ch, 'r', encoding='utf-8') as f:
        content = f.read()
    print(f"=== {ch} ===")
    matches = re.findall(r'add_captioned_image\s*\(\s*doc\s*,\s*["\']([^"\']+)["\']\s*,\s*["\']([^"\']+)["\']', content)
    for img, cap in matches:
        print(f"  {img} | {cap}")
