# -*- coding: utf-8 -*-
import glob, re, os

for ch in sorted(glob.glob('baocaokhoaluan/thesis_chapter_*.py')):
    with open(ch, 'r', encoding='utf-8') as f:
        text = f.read()
    matches = re.findall(r'add_figure_placeholder\s*\(\s*doc\s*,\s*["\']([^"\']+)["\']\s*,\s*["\']([^"\']+)["\']', text)
    print(f"=== {os.path.basename(ch)} ({len(matches)} figures) ===")
    for fid, ftitle in matches:
        print(f"  Hình {fid:5s}: {ftitle}")
