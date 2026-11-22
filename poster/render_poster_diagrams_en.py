# -*- coding: utf-8 -*-
"""
render_poster_diagrams_en.py
Generate 100% English Academic Diagrams for the Graduation Poster using Clean Transparent Tech Icons.
Strict rules:
1. NO colored boxes with dense text.
2. Icon bounding boxes strictly capped (max_w <= 1.60, max_h <= 1.35) so wide icons never touch arrows or labels.
3. Generously spaced arrows with clean white pill labels, ZERO arrow overlap.
"""

import os
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import matplotlib.image as mpimg

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
POSTER_ASSETS = os.path.join(BASE_DIR, "assets")
ICONS_DIR = os.path.join(os.path.dirname(BASE_DIR), "baocaokhoaluan", "assets", "icons")
DOCS_ICONS_DIR = os.path.join(os.path.dirname(BASE_DIR), "docs", "diagram_assets")

os.makedirs(POSTER_ASSETS, exist_ok=True)

plt.rcParams['font.sans-serif'] = ['Segoe UI', 'Arial', 'DejaVu Sans']
plt.rcParams['font.family'] = 'sans-serif'

C_TEXT = '#0F172A'       # Slate 900
C_SUB = '#475569'        # Slate 600
C_LINE = '#1E293B'       # Slate 800 for arrows


def get_icon_path(name):
    p1 = os.path.join(ICONS_DIR, name)
    if os.path.exists(p1): return p1
    p2 = os.path.join(DOCS_ICONS_DIR, name)
    if os.path.exists(p2): return p2
    return None


def get_icon_dimensions(icon_name, max_w=1.60, max_h=1.35):
    icon_path = get_icon_path(icon_name)
    if not icon_path or not os.path.exists(icon_path):
        return max_w, max_h
    img = mpimg.imread(icon_path)
    ih, iw = img.shape[:2]
    aspect = iw / ih
    display_w = max_h * aspect
    display_h = max_h
    if display_w > max_w:
        display_w = max_w
        display_h = display_w / aspect
    return display_w, display_h


def draw_clean_icon(ax, x, y, icon_name, title, subtitle='', max_w=1.60, max_h=1.35, y_title=None, y_sub=None):
    icon_path = get_icon_path(icon_name)
    disp_w, disp_h = get_icon_dimensions(icon_name, max_w, max_h)
    
    if icon_path and os.path.exists(icon_path):
        img = mpimg.imread(icon_path)
        ax.imshow(img, extent=[x - disp_w/2, x + disp_w/2, y - disp_h/2, y + disp_h/2],
                  zorder=15, aspect='auto')
    else:
        ax.plot(x, y, 'o', color=C_TEXT, markersize=14, zorder=15)
        
    t_y = y_title if y_title is not None else (y - disp_h / 2.0 - 0.28)
    s_y = y_sub if y_sub is not None else (t_y - 0.36)
    
    ax.text(x, t_y, title, ha='center', va='top', fontsize=9.8, fontweight='bold', color=C_TEXT, zorder=20)
    if subtitle:
        ax.text(x, s_y, subtitle, ha='center', va='top', fontsize=8.2, color=C_SUB, zorder=20)


def draw_clean_arrow(ax, x1, y1, x2, y2, label='', offset_y=0.45, offset_x=0.0, shrinkA=8, shrinkB=8, rad=0.0, is_dashed=False):
    conn = f'arc3,rad={rad}' if rad != 0.0 else 'arc3'
    line_style = '--' if is_dashed else '-'
    
    ax.annotate(
        '', xy=(x2, y2), xytext=(x1, y1),
        arrowprops=dict(
            arrowstyle='-|>',
            color=C_LINE,
            lw=1.5,
            linestyle=line_style,
            shrinkA=shrinkA,
            shrinkB=shrinkB,
            mutation_scale=14,
            connectionstyle=conn
        ),
        zorder=10
    )
    if label:
        mx = (x1 + x2) / 2.0 + offset_x
        my = (y1 + y2) / 2.0 + offset_y
        ax.text(
            mx, my, label, ha='center', va='center',
            fontsize=8.2, fontweight='bold', color=C_TEXT,
            bbox=dict(boxstyle='round,pad=0.22', facecolor='white', edgecolor='#CBD5E1', lw=0.8, alpha=0.98),
            zorder=25
        )


# ==============================================================================
# 1. ENGLISH 3-TIER ARCHITECTURE DIAGRAM WITH REAL TECH ICONS
# ==============================================================================
def gen_architecture_en():
    fig, ax = plt.subplots(figsize=(16.5, 9.2), dpi=300)
    ax.set_xlim(0, 16.5); ax.set_ylim(0, 9.2); ax.axis('off')

    ax.text(8.25, 8.8, '3-TIER HYBRID SYSTEM ARCHITECTURE',
            ha='center', va='center', fontsize=13.0, fontweight='bold', color=C_TEXT)

    ax.text(2.6, 8.0, 'TIER 1: CLIENTS', ha='center', va='center', fontsize=11.0, fontweight='bold', color='#0284C7')
    ax.text(8.25, 8.0, 'TIER 2: SERVICES & QUEUE', ha='center', va='center', fontsize=11.0, fontweight='bold', color='#059669')
    ax.text(13.9, 8.0, 'TIER 3: DATA & CLOUD', ha='center', va='center', fontsize=11.0, fontweight='bold', color='#DC2626')

    ax.plot([5.4, 5.4], [0.6, 8.1], color='#CBD5E1', linestyle='--', lw=1.5)
    ax.plot([11.1, 11.1], [0.6, 8.1], color='#CBD5E1', linestyle='--', lw=1.5)

    # Tier 1
    draw_clean_icon(ax, 2.6, 6.2, 'icon_browser.png', 'Web Client (Visitors)', 'React 18 & WebGL Three.js', max_w=1.5, max_h=1.4, y_title=4.8, y_sub=4.4)
    draw_clean_icon(ax, 2.6, 2.2, 'icon_client.png', 'Museum Administrator', 'Admin CMS Dashboard', max_w=1.4, max_h=1.35, y_title=0.9, y_sub=0.5)

    # Tier 2: Nginx Reverse Proxy & Node.js API
    draw_clean_icon(ax, 8.25, 6.2, 'icon_nginx.png', 'Nginx & Node.js API', 'Reverse Proxy & REST Gateway', max_w=1.5, max_h=1.4, y_title=4.8, y_sub=4.4)
    draw_clean_icon(ax, 8.25, 2.2, 'icon_rabbitmq.png', 'RabbitMQ & Redis', 'Async Tasks & Session Cache', max_w=1.4, max_h=1.35, y_title=0.9, y_sub=0.5)

    # Tier 3: PostgreSQL 16 & PayOS
    draw_clean_icon(ax, 13.9, 6.2, 'icon_postgres.png', 'PostgreSQL 16 & Mongo', 'ACID Tickets, 18 Halls & Items', max_w=1.5, max_h=1.4, y_title=4.8, y_sub=4.4)
    draw_clean_icon(ax, 13.9, 2.2, 'icon_payos.png', 'PayOS & Hugging Face', 'VietQR Napas & TRELLIS 3D', max_w=1.5, max_h=1.35, y_title=0.9, y_sub=0.5)

    draw_clean_arrow(ax, 3.8, 6.2, 7.0, 6.2, label='HTTPS / WSS (Port 443)', offset_y=0.42)
    draw_clean_arrow(ax, 3.8, 2.2, 7.0, 2.2, label='RESTful API (JSON)', offset_y=0.42)

    draw_clean_arrow(ax, 8.25, 5.1, 8.25, 3.4, label='Task Dispatch & Cache', offset_x=1.7, offset_y=0.0)

    draw_clean_arrow(ax, 9.5, 6.2, 12.6, 6.2, label='SQL (pgPool) & Mongoose', offset_y=0.42)
    draw_clean_arrow(ax, 9.5, 2.2, 12.6, 2.2, label='Webhook & ZeroGPU API', offset_y=0.42)

    out = os.path.join(POSTER_ASSETS, "diagram_architecture_3tier_en.png")
    fig.savefig(out, bbox_inches='tight', dpi=300)
    plt.close(fig)
    print("-> Da tao diagram_architecture_3tier_en.png voi Real Tech Icons")


# ==============================================================================
# 2. ENGLISH PANORAMA PROCESS DIAGRAM WITH REAL TECH ICONS
# ==============================================================================
def gen_process_en():
    fig, ax = plt.subplots(figsize=(16.5, 5.5), dpi=300)
    ax.set_xlim(0, 16.5); ax.set_ylim(0, 5.5); ax.axis('off')

    ax.text(8.25, 5.0, 'AUTOMATED 360° PANORAMA STITCHING PIPELINE',
            ha='center', va='center', fontsize=12.5, fontweight='bold', color=C_TEXT)

    xs = [2.0, 6.2, 10.4, 14.6]
    draw_clean_icon(ax, xs[0], 3.2, 'icon_client.png', '1. Source Imagery', 'Video Sweep & Multi-frame', max_w=1.4, max_h=1.35, y_title=1.8, y_sub=1.4)
    draw_clean_icon(ax, xs[1], 3.2, 'icon_wireframe_3d.png', '2. Cylindrical Warp', 'Eliminate Perspective Distortion', max_w=1.4, max_h=1.35, y_title=1.8, y_sub=1.4)
    draw_clean_icon(ax, xs[2], 3.2, 'icon_feature_match.png', '3. SIFT & RANSAC', '128D Descriptors & Outlier Rejection', max_w=1.55, max_h=1.1, y_title=1.8, y_sub=1.4)
    draw_clean_icon(ax, xs[3], 3.2, 'icon_360_grid.png', '4. 8K Panorama', 'Equirectangular WebP 60 FPS', max_w=1.6, max_h=1.35, y_title=1.8, y_sub=1.4)

    draw_clean_arrow(ax, xs[0] + 1.15, 3.2, xs[1] - 1.15, 3.2, label='1. Frame Extraction', offset_y=0.45)
    draw_clean_arrow(ax, xs[1] + 1.15, 3.2, xs[2] - 1.15, 3.2, label='2. Homography Alignment', offset_y=0.45)
    draw_clean_arrow(ax, xs[2] + 1.15, 3.2, xs[3] - 1.15, 3.2, label='3. Multiband Blending', offset_y=0.45)

    out = os.path.join(POSTER_ASSETS, "diagram_stitching_process_en.png")
    fig.savefig(out, bbox_inches='tight', dpi=300)
    plt.close(fig)
    print("-> Da tao diagram_stitching_process_en.png voi Real Tech Icons")


if __name__ == '__main__':
    gen_architecture_en()
    gen_process_en()
