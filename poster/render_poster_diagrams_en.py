# -*- coding: utf-8 -*-
"""
Generate English 2D Flat Vector Diagrams (Algomaster Style) specifically for the Academic Poster.
Matches 100% English requirement, crisp dark outlines, and minimal clear labels.
"""

import os
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import matplotlib.patches as patches

POSTER_ASSETS = r"d:\KhoaluanTotNghiep\poster\assets"
os.makedirs(POSTER_ASSETS, exist_ok=True)

plt.rcParams['font.sans-serif'] = ['Segoe UI', 'Arial', 'DejaVu Sans']
plt.rcParams['font.family'] = 'sans-serif'

C_INK = '#1E293B'
C_TEXT = '#0F172A'
C_MUTED = '#64748B'
C_CYAN = '#38BDF8'
C_PURPLE = '#A855F7'
C_GREEN = '#34D399'
C_RED = '#F43F5E'
C_AMBER = '#FBBF24'
C_INDIGO = '#818CF8'


def draw_vector_user(ax, x, y, name, color=C_CYAN, sub=''):
    ax.add_patch(patches.Circle((x, y + 0.42), 0.32, facecolor=color, edgecolor=C_INK, lw=2.0, zorder=10))
    ax.add_patch(patches.FancyBboxPatch((x - 0.45, y - 0.15), 0.90, 0.45,
                                        boxstyle='round,pad=0.08,rounding_size=0.25',
                                        facecolor=color, edgecolor=C_INK, lw=2.0, zorder=9))
    ax.text(x, y - 0.42, name, ha='center', va='top', fontsize=10.5, fontweight='bold', color=C_TEXT, zorder=12)
    if sub:
        ax.text(x, y - 0.68, sub, ha='center', va='top', fontsize=8.5, color=C_MUTED, zorder=12)


def draw_vector_server(ax, x, y, name, color=C_GREEN, sub='', racks=2):
    w = 2.0
    h = 0.55 * racks + 0.35
    ax.add_patch(patches.FancyBboxPatch((x - w/2, y - h/2), w, h,
                                        boxstyle='round,pad=0.05,rounding_size=0.12',
                                        facecolor='#FFFFFF', edgecolor=C_INK, lw=2.0, zorder=8))
    for i in range(racks):
        ry = (y - h/2) + 0.20 + i * 0.52
        ax.add_patch(patches.FancyBboxPatch((x - w/2 + 0.15, ry), w - 0.30, 0.38,
                                            boxstyle='round,pad=0.04,rounding_size=0.08',
                                            facecolor=color, edgecolor=C_INK, lw=1.6, zorder=9))
        ax.add_patch(patches.Circle((x + w/2 - 0.35, ry + 0.19), 0.05, facecolor='#FFFFFF', edgecolor=C_INK, lw=1.0, zorder=11))
        ax.plot([x - w/2 + 0.35, x + 0.3], [ry + 0.19, ry + 0.19], color=C_INK, lw=1.5, zorder=10)

    ax.text(x, y - h/2 - 0.25, name, ha='center', va='top', fontsize=10.5, fontweight='bold', color=C_TEXT, zorder=12)
    if sub:
        ax.text(x, y - h/2 - 0.50, sub, ha='center', va='top', fontsize=8.5, color=C_MUTED, zorder=12)


def draw_vector_db(ax, x, y, name, color=C_RED, sub='', disks=3):
    w = 1.6
    dh = 0.32
    total_h = dh * disks
    base_y = y - total_h / 2
    for i in range(disks):
        cur_y = base_y + i * dh
        ax.add_patch(patches.FancyBboxPatch((x - w/2, cur_y), w, dh,
                                            boxstyle='round,pad=0.04,rounding_size=0.15',
                                            facecolor=color, edgecolor=C_INK, lw=1.8, zorder=8 + i))
        if i == disks - 1:
            ax.add_patch(patches.Circle((x - 0.35, cur_y + dh/2), 0.08, facecolor='#FFFFFF', edgecolor=C_INK, lw=1.0, zorder=15))
            ax.add_patch(patches.RegularPolygon((x + 0.35, cur_y + dh/2), 3, radius=0.09, facecolor='#FFFFFF', edgecolor=C_INK, lw=1.0, zorder=15))

    ax.text(x, y - total_h/2 - 0.25, name, ha='center', va='top', fontsize=10.5, fontweight='bold', color=C_TEXT, zorder=12)
    if sub:
        ax.text(x, y - total_h/2 - 0.50, sub, ha='center', va='top', fontsize=8.5, color=C_MUTED, zorder=12)


def draw_vector_card(ax, x, y, name, color=C_AMBER, sub='', stacked=True):
    w = 1.9
    h = 1.1
    if stacked:
        ax.add_patch(patches.FancyBboxPatch((x - w/2 + 0.12, y - h/2 - 0.10), w, h,
                                            boxstyle='round,pad=0.06,rounding_size=0.25',
                                            facecolor=color, edgecolor=C_INK, lw=1.8, zorder=7))
    ax.add_patch(patches.FancyBboxPatch((x - w/2, y - h/2), w, h,
                                        boxstyle='round,pad=0.06,rounding_size=0.25',
                                        facecolor=color, edgecolor=C_INK, lw=2.0, zorder=8))
    ax.text(x, y, name, ha='center', va='center', fontsize=10.0, fontweight='bold', color=C_TEXT, zorder=12)
    if sub:
        ax.text(x, y - h/2 - 0.25, sub, ha='center', va='top', fontsize=8.5, color=C_MUTED, zorder=12)


def draw_vector_360_sphere(ax, x, y, name, color='#38BDF8', sub=''):
    r = 0.65
    ax.add_patch(patches.Circle((x, y), r, facecolor=color, edgecolor=C_INK, lw=2.0, zorder=8))
    ax.add_patch(patches.Arc((x, y), r*2, r*0.8, angle=0, theta1=0, theta2=360, color=C_INK, lw=1.5, zorder=9))
    ax.plot([x, x], [y - r, y + r], color=C_INK, lw=1.5, zorder=9)
    ax.text(x, y, '360°', ha='center', va='center', fontsize=11, fontweight='bold', color='#FFFFFF', zorder=11,
            bbox=dict(boxstyle='round,pad=0.15', facecolor=C_INK, edgecolor='none'))
    ax.text(x, y - r - 0.25, name, ha='center', va='top', fontsize=10.5, fontweight='bold', color=C_TEXT, zorder=12)
    if sub:
        ax.text(x, y - r - 0.50, sub, ha='center', va='top', fontsize=8.5, color=C_MUTED, zorder=12)


def draw_vector_arrow(ax, x1, y1, x2, y2, label='', rad=0.0, side='top', shrink=22):
    conn = f'arc3,rad={rad}' if rad != 0 else 'arc3'
    ax.annotate('', xy=(x2, y2), xytext=(x1, y1),
                arrowprops=dict(arrowstyle='->,head_width=0.4,head_length=0.6', color=C_INK, lw=1.8,
                                shrinkA=shrink, shrinkB=shrink, connectionstyle=conn), zorder=6)
    if label:
        mx = (x1 + x2) / 2
        my = (y1 + y2) / 2
        offset = 0.20
        lx = mx
        ly = my + offset if side == 'top' else my - offset
        ha = 'center'
        va = 'bottom' if side == 'top' else 'top'
        ax.text(lx, ly, label, ha=ha, va=va, fontsize=9.0, fontweight='bold', color=C_TEXT,
                bbox=dict(boxstyle='round,pad=0.18', facecolor='#FFFFFF', edgecolor='#CBD5E1', lw=0.8, alpha=0.98),
                zorder=15)


# 1. English Architecture Diagram
def gen_architecture_en():
    fig, ax = plt.subplots(figsize=(15.0, 8.5), dpi=300)
    ax.set_xlim(0, 15.0); ax.set_ylim(0, 8.5); ax.axis('off')

    ax.text(7.5, 8.0, '3-TIER HYBRID ARCHITECTURE & COMPONENT TOPOLOGY',
            ha='center', va='center', fontsize=12.0, fontweight='bold', color=C_TEXT)

    ax.text(2.2, 7.2, 'TIER 1: CLIENTS', ha='center', va='center', fontsize=10.5, fontweight='bold', color='#0284C7')
    ax.text(7.5, 7.2, 'TIER 2: SERVICES', ha='center', va='center', fontsize=10.5, fontweight='bold', color='#059669')
    ax.text(12.8, 7.2, 'TIER 3: DATA & CLOUD', ha='center', va='center', fontsize=10.5, fontweight='bold', color='#DC2626')

    ax.axvline(x=4.8, ymin=0.08, ymax=0.82, color='#E2E8F0', linestyle='--', lw=1.5)
    ax.axvline(x=10.2, ymin=0.08, ymax=0.82, color='#E2E8F0', linestyle='--', lw=1.5)

    draw_vector_user(ax, 2.2, 5.5, 'Virtual Visitor', color=C_CYAN, sub='Desktop & Mobile WebGL')
    draw_vector_user(ax, 2.2, 2.3, 'Administrator', color=C_PURPLE, sub='Admin CMS Dashboard')

    draw_vector_server(ax, 7.5, 6.0, 'Web Server (Nginx)', color=C_GREEN, sub='Reverse Proxy & Cache', racks=2)
    draw_vector_server(ax, 7.5, 3.8, 'Backend API (Node.js)', color=C_GREEN, sub='RESTful & Realtime SSE', racks=2)
    draw_vector_card(ax, 7.5, 1.6, '3D & Vision Engine', color=C_AMBER, sub='Python OpenCV & Local CPU')

    draw_vector_db(ax, 12.8, 6.0, 'PostgreSQL 16 DB', color=C_RED, sub='ACID Tickets & Accounts')
    draw_vector_db(ax, 12.8, 3.8, 'MongoDB NoSQL', color='#EA580C', sub='18 Galleries & Artifacts')
    draw_vector_card(ax, 12.8, 1.6, 'Cloud AI Services', color=C_INDIGO, sub='PayOS, ZeroGPU, TTS AI')

    draw_vector_arrow(ax, 3.2, 5.5, 6.3, 6.0, label='HTTPS / WSS', shrink=18)
    draw_vector_arrow(ax, 3.2, 2.3, 6.3, 3.8, label='RESTful API', shrink=18)
    draw_vector_arrow(ax, 7.5, 5.1, 7.5, 4.6, label='Proxy Pass', shrink=12)
    draw_vector_arrow(ax, 7.5, 2.9, 7.5, 2.3, label='Worker Queue', shrink=12)
    draw_vector_arrow(ax, 8.7, 4.1, 11.8, 5.8, label='SQL (pgPool)', shrink=18)
    draw_vector_arrow(ax, 8.7, 3.8, 11.8, 3.8, label='Mongoose NoSQL', shrink=18)
    draw_vector_arrow(ax, 8.7, 1.6, 11.6, 1.6, label='Cloud API Call', shrink=18)

    out = os.path.join(POSTER_ASSETS, "diagram_architecture_3tier_en.png")
    fig.savefig(out, bbox_inches='tight')
    plt.close(fig)
    print("-> Generated diagram_architecture_3tier_en.png")


# 2. English Process / Stitching Diagram
def gen_process_en():
    fig, ax = plt.subplots(figsize=(14.5, 6.5), dpi=300)
    ax.set_xlim(0, 14.5); ax.set_ylim(0, 6.5); ax.axis('off')

    ax.text(7.25, 5.9, 'AUTOMATED 360° PANORAMA STITCHING PIPELINE',
            ha='center', va='center', fontsize=12.0, fontweight='bold', color=C_TEXT)

    draw_vector_card(ax, 1.8, 3.2, 'Source Imagery', color=C_AMBER, sub='Smartphone Video Sweeps')
    draw_vector_card(ax, 5.4, 3.2, 'SIFT Matching', color=C_GREEN, sub='128D Invariant Descriptors')
    draw_vector_card(ax, 9.0, 3.2, 'Cylindrical Warp', color=C_INDIGO, sub='Multiband Seam Blending')
    draw_vector_360_sphere(ax, 12.8, 3.2, '8K Panorama', color='#0284C7', sub='Equirectangular 360°')

    draw_vector_arrow(ax, 2.9, 3.2, 4.3, 3.2, label='Frame Extraction')
    draw_vector_arrow(ax, 6.5, 3.2, 7.9, 3.2, label='Homography (RANSAC)')
    draw_vector_arrow(ax, 10.1, 3.2, 11.8, 3.2, label='Render 360° Sphere')

    out = os.path.join(POSTER_ASSETS, "diagram_stitching_process_en.png")
    fig.savefig(out, bbox_inches='tight')
    plt.close(fig)
    print("-> Generated diagram_stitching_process_en.png")


if __name__ == '__main__':
    gen_architecture_en()
    gen_process_en()
