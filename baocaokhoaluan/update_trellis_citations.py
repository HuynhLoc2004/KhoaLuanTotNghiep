# -*- coding: utf-8 -*-
"""
Update TRELLIS citations, Hugging Face Spaces references and diagrams.
"""
import os

# 1. Update thesis_references_appendices.py
ref_path = r"baocaokhoaluan\thesis_references_appendices.py"
with open(ref_path, "r", encoding="utf-8") as f:
    lines = f.readlines()

new_lines = []
for l in lines:
    if "arxiv.org/abs/2412.01506" in l:
        new_lines.append(
            '        (29, \'J. Xiang, Z. Lv, S. Long, Y. Deng, K. Chen, and B. Dai (Microsoft Research), "TRELLIS: Structured 3D Latents for Scalable and Versatile 3D Generation," arXiv preprint arXiv:2412.01506, Dec. 2024. Hugging Face: https://huggingface.co/spaces/trellis-community/TRELLIS. GitHub: https://github.com/microsoft/TRELLIS. Available: https://arxiv.org/abs/2412.01506. [Accessed: 25/10/2026].\'),\n'
        )
    elif "huggingface.co/docs" in l and "(30," in l:
        new_lines.append(
            '        (30, \'Hugging Face Inc. & Trellis Community, "TRELLIS Image-to-3D Asset Generation on Hugging Face Spaces with ZeroGPU," 2024. Available: https://huggingface.co/spaces/trellis-community/TRELLIS. [Accessed: 24/10/2026].\'),\n'
        )
    else:
        new_lines.append(l)

with open(ref_path, "w", encoding="utf-8") as f:
    f.writelines(new_lines)
print("Updated thesis_references_appendices.py")

# 2. Update TAI_LIEU_THAM_KHAO.md
doc_ref_path = r"baocaokhoaluan\TAI_LIEU_THAM_KHAO.md"
if os.path.exists(doc_ref_path):
    with open(doc_ref_path, "r", encoding="utf-8") as f:
        md_text = f.read()
    
    old_item = '[7] J. Xiang et al., "TRELLIS: Structured 3D Latents for Scalable and Versatile 3D Generation," *arXiv preprint arXiv:2412.01506*, 2024.'
    new_item = '[7] J. Xiang, Z. Lv, S. Long, Y. Deng, K. Chen, and B. Dai (Microsoft Research), "TRELLIS: Structured 3D Latents for Scalable and Versatile 3D Generation," *arXiv preprint arXiv:2412.01506*, Dec. 2024. Hugging Face Space: https://huggingface.co/spaces/trellis-community/TRELLIS. GitHub: https://github.com/microsoft/TRELLIS.'
    
    if old_item in md_text:
        md_text = md_text.replace(old_item, new_item)
        with open(doc_ref_path, "w", encoding="utf-8") as f:
            f.write(md_text)
        print("Updated TAI_LIEU_THAM_KHAO.md")

# 3. Update KICH_BAN_SLIDE_BAO_VE_KLTN_15PHUT.md
slide_script_path = r"baocaokhoaluan\KICH_BAN_SLIDE_BAO_VE_KLTN_15PHUT.md"
if os.path.exists(slide_script_path):
    with open(slide_script_path, "r", encoding="utf-8") as f:
        script_text = f.read()

    # Ensure Microsoft Research and Hugging Face Spaces are highlighted in slide 9
    old_desc = "sử dụng Deep Learning trên cụm GPU HuggingFace"
    new_desc = "sử dụng mô hình TRELLIS do Microsoft Research phát triển, triển khai trên Hugging Face Spaces (trellis-community/TRELLIS) với GPU A100"
    if old_desc in script_text:
        script_text = script_text.replace(old_desc, new_desc)
        with open(slide_script_path, "w", encoding="utf-8") as f:
            f.write(script_text)
        print("Updated KICH_BAN_SLIDE_BAO_VE_KLTN_15PHUT.md")
