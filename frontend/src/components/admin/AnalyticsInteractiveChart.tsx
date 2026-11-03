import React, { useState, useMemo, useRef } from 'react';
import { AnalyticsTimelineItem } from '../../types';

interface AnalyticsInteractiveChartProps {
  timelineData: AnalyticsTimelineItem[];
  timeRange: string;
  formatVND: (amount: number) => string;
}

export const AnalyticsInteractiveChart: React.FC<AnalyticsInteractiveChartProps> = ({
  timelineData,
  timeRange,
  formatVND
}) => {
  const [activeMetric, setActiveMetric] = useState<'all' | 'revenue' | 'tickets'>('all');
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Tính toán giá trị trần cho trục Y
  const maxRevenue = useMemo(() => {
    const rawMax = Math.max(...timelineData.map((d) => d.revenue || 0), 0);
    if (rawMax <= 0) return 200000; // Mặc định 200.000 đ nếu chưa có doanh thu
    // Làm tròn trần lên bậc chẵn (50k, 100k, 500k, 1M...)
    const magnitude = Math.pow(10, Math.floor(Math.log10(rawMax)));
    return Math.ceil(rawMax / magnitude) * magnitude;
  }, [timelineData]);

  const maxTickets = useMemo(() => {
    const rawMax = Math.max(...timelineData.map((d) => d.tickets || 0), 0);
    return Math.max(rawMax, 10); // Mặc định trần 10 vé
  }, [timelineData]);

  const totalPeriodRevenue = useMemo(() => {
    return timelineData.reduce((acc, cur) => acc + (cur.revenue || 0), 0);
  }, [timelineData]);

  const totalPeriodTickets = useMemo(() => {
    return timelineData.reduce((acc, cur) => acc + (cur.tickets || 0), 0);
  }, [timelineData]);

  // Kích thước ViewBox SVG
  const vbWidth = 900;
  const vbHeight = 260;
  const padLeft = 65;
  const padRight = 45;
  const padTop = 25;
  const padBottom = 35;
  const plotWidth = vbWidth - padLeft - padRight;
  const plotHeight = vbHeight - padTop - padBottom;

  // Tọa độ các điểm trên biểu đồ
  const points = useMemo(() => {
    if (!timelineData || timelineData.length === 0) return [];
    const count = timelineData.length;
    return timelineData.map((d, i) => {
      const x = count === 1 ? padLeft + plotWidth / 2 : padLeft + (i / (count - 1)) * plotWidth;
      const revRatio = Math.min(Math.max((d.revenue || 0) / maxRevenue, 0), 1);
      const yRev = padTop + plotHeight - revRatio * plotHeight;
      const tickRatio = Math.min(Math.max((d.tickets || 0) / maxTickets, 0), 1);
      const yTick = padTop + plotHeight - tickRatio * plotHeight;
      return { x, yRev, yTick, data: d, index: i };
    });
  }, [timelineData, maxRevenue, maxTickets, plotWidth, plotHeight, padLeft, padTop]);

  // Sinh đường cong mượt mà Bezier (Smooth Cubic Spline)
  const linePath = useMemo(() => {
    if (points.length === 0) return '';
    if (points.length === 1) {
      return `M ${padLeft} ${points[0].yRev} L ${padLeft + plotWidth} ${points[0].yRev}`;
    }

    let path = `M ${points[0].x} ${points[0].yRev}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i === 0 ? 0 : i - 1];
      const p1 = points[i];
      const p2 = points[i + 1];
      const p3 = points[i + 2 < points.length ? i + 2 : i + 1];

      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.yRev + (p2.yRev - p0.yRev) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.yRev - (p3.yRev - p1.yRev) / 6;

      path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.yRev}`;
    }
    return path;
  }, [points, padLeft, plotWidth]);

  // Khối diện tích phía dưới đường cong
  const areaPath = useMemo(() => {
    if (!linePath || points.length === 0) return '';
    const lastX = points[points.length - 1].x;
    const firstX = points[0].x;
    const baseline = padTop + plotHeight;
    return `${linePath} L ${lastX} ${baseline} L ${firstX} ${baseline} Z`;
  }, [linePath, points, padTop, plotHeight]);

  // Xử lý tương tác chuột / chạm di động
  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!containerRef.current || points.length === 0) return;
    const rect = containerRef.current.getBoundingClientRect();
    const clientX = e.clientX - rect.left;
    const scaleX = vbWidth / rect.width;
    const svgX = clientX * scaleX;

    // Tìm điểm gần nhất
    let closestIdx = 0;
    let minDist = Infinity;
    points.forEach((p, idx) => {
      const dist = Math.abs(p.x - svgX);
      if (dist < minDist) {
        minDist = dist;
        closestIdx = idx;
      }
    });
    setHoverIndex(closestIdx);
  };

  const handleMouseLeave = () => {
    setHoverIndex(null);
  };

  // Định dạng nhãn trục Y doanh thu (rút gọn k / tr)
  const formatYRev = (val: number) => {
    if (val === 0) return '0 ₫';
    if (val >= 1000000) return `${(val / 1000000).toFixed(val % 1000000 === 0 ? 0 : 1)}M ₫`;
    if (val >= 1000) return `${(val / 1000).toFixed(0)}k ₫`;
    return `${val} ₫`;
  };

  // Định dạng ngày tháng nhãn trục X
  const formatXLabel = (raw: string) => {
    if (!raw) return '';
    if (raw.includes(':')) return raw; // Giờ 08:00
    if (raw.length === 10) {
      // YYYY-MM-DD -> DD/MM
      const parts = raw.split('-');
      return `${parts[2]}/${parts[1]}`;
    }
    if (raw.length === 7) {
      // YYYY-MM -> T.MM
      const parts = raw.split('-');
      return `Th${parseInt(parts[1], 10)}`;
    }
    return raw;
  };

  const hoveredPoint = hoverIndex !== null && points[hoverIndex] ? points[hoverIndex] : null;

  return (
    <div
      style={{
        background: 'linear-gradient(145deg, rgba(20, 24, 34, 0.95) 0%, rgba(13, 17, 24, 0.98) 100%)',
        border: '1px solid rgba(212, 168, 106, 0.18)',
        borderRadius: 14,
        padding: '20px 22px',
        boxShadow: '0 8px 30px rgba(0, 0, 0, 0.35)',
        position: 'relative'
      }}
    >
      {/* 1. Header biểu đồ: Tiêu đề + Bộ lọc chỉ số + Chú giải đồng bộ */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12,
          marginBottom: 16
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#D4A86A', display: 'inline-block' }} />
            <h3 style={{ fontSize: '14.5px', fontWeight: 600, color: '#F8FAFC', margin: 0, letterSpacing: '0.01em' }}>
              Biểu đồ Diễn biến Doanh thu & Lượng vé Thực tế
            </h3>
          </div>
          <p style={{ fontSize: '11.5px', color: '#94A3B8', margin: '4px 0 0 16px' }}>
            Tổng kỳ: <strong style={{ color: '#D4A86A' }}>{formatVND(totalPeriodRevenue)}</strong> ({totalPeriodTickets} vé phát hành)
          </p>
        </div>

        {/* Cụm công cụ: Chọn lớp hiển thị + Chú giải màu sắc cao cấp */}
        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          {/* Nút lọc metric */}
          <div
            style={{
              display: 'inline-flex',
              background: 'rgba(0, 0, 0, 0.4)',
              border: '1px solid rgba(212, 168, 106, 0.18)',
              borderRadius: 20,
              padding: '2px',
              gap: 2
            }}
          >
            <button
              type="button"
              onClick={() => setActiveMetric('all')}
              style={{
                fontSize: '11px',
                fontWeight: 600,
                padding: '4px 10px',
                borderRadius: 16,
                border: 'none',
                cursor: 'pointer',
                background: activeMetric === 'all' ? 'rgba(212, 168, 106, 0.22)' : 'transparent',
                color: activeMetric === 'all' ? '#D4A86A' : '#94A3B8',
                transition: 'all 0.15s ease'
              }}
            >
              Tất cả
            </button>
            <button
              type="button"
              onClick={() => setActiveMetric('revenue')}
              style={{
                fontSize: '11px',
                fontWeight: 600,
                padding: '4px 10px',
                borderRadius: 16,
                border: 'none',
                cursor: 'pointer',
                background: activeMetric === 'revenue' ? 'rgba(212, 168, 106, 0.22)' : 'transparent',
                color: activeMetric === 'revenue' ? '#D4A86A' : '#94A3B8',
                transition: 'all 0.15s ease'
              }}
            >
              Doanh thu
            </button>
            <button
              type="button"
              onClick={() => setActiveMetric('tickets')}
              style={{
                fontSize: '11px',
                fontWeight: 600,
                padding: '4px 10px',
                borderRadius: 16,
                border: 'none',
                cursor: 'pointer',
                background: activeMetric === 'tickets' ? 'rgba(212, 168, 106, 0.22)' : 'transparent',
                color: activeMetric === 'tickets' ? '#D4A86A' : '#94A3B8',
                transition: 'all 0.15s ease'
              }}
            >
              Lượt vé
            </button>
          </div>

          {/* Chú giải nhã nhặn */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: '11.5px' }}>
            {(activeMetric === 'all' || activeMetric === 'revenue') && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <span style={{ width: 14, height: 3, borderRadius: 2, background: '#D4A86A', display: 'inline-block' }} />
                <span style={{ color: '#D4A86A', fontWeight: 500 }}>Doanh thu (VNĐ)</span>
              </div>
            )}
            {(activeMetric === 'all' || activeMetric === 'tickets') && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <span style={{ width: 10, height: 10, borderRadius: 2, background: 'rgba(148, 163, 184, 0.5)', display: 'inline-block' }} />
                <span style={{ color: '#94A3B8', fontWeight: 500 }}>Vé bán (vé)</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2. Khung vẽ SVG Interactive Area Chart */}
      <div
        ref={containerRef}
        style={{
          position: 'relative',
          width: '100%',
          overflow: 'hidden',
          borderRadius: 8,
          background: 'rgba(9, 12, 18, 0.6)',
          border: '1px solid rgba(255, 255, 255, 0.04)'
        }}
      >
        <svg
          viewBox={`0 0 ${vbWidth} ${vbHeight}`}
          style={{ width: '100%', height: 'auto', display: 'block', cursor: 'crosshair' }}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          <defs>
            {/* Gradient màu vàng đồng đổ bóng mờ nhạt xuống đáy */}
            <linearGradient id="goldAreaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#D4A86A" stopOpacity="0.28" />
              <stop offset="65%" stopColor="#D4A86A" stopOpacity="0.06" />
              <stop offset="100%" stopColor="#D4A86A" stopOpacity="0.0" />
            </linearGradient>

            {/* Hiệu ứng glow thanh mảnh cho đường line */}
            <filter id="goldGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#D4A86A" floodOpacity="0.35" />
            </filter>
          </defs>

          {/* 4 Lưới ngang chuẩn + Nhãn trục Y doanh thu */}
          {[1, 0.66, 0.33, 0].map((ratio, idx) => {
            const y = padTop + plotHeight * (1 - ratio);
            const val = maxRevenue * ratio;
            return (
              <g key={idx}>
                <line
                  x1={padLeft}
                  y1={y}
                  x2={vbWidth - padRight}
                  y2={y}
                  stroke="rgba(255, 255, 255, 0.07)"
                  strokeDasharray={ratio === 0 ? 'none' : '4 4'}
                  strokeWidth="1"
                />
                <text
                  x={padLeft - 8}
                  y={y + 3.5}
                  textAnchor="end"
                  fill="#64748B"
                  fontSize="10"
                  fontFamily="sans-serif"
                >
                  {formatYRev(val)}
                </text>
                {/* Trục bên phải: Số vé */}
                {(activeMetric === 'all' || activeMetric === 'tickets') && (
                  <text
                    x={vbWidth - padRight + 8}
                    y={y + 3.5}
                    textAnchor="start"
                    fill="#475569"
                    fontSize="9.5"
                    fontFamily="sans-serif"
                  >
                    {Math.round(maxTickets * ratio)}v
                  </text>
                )}
              </g>
            );
          })}

          {/* Cột hiển thị số vé bán (Bar layer) */}
          {(activeMetric === 'all' || activeMetric === 'tickets') &&
            points.map((p) => {
              const barW = Math.min(Math.max(plotWidth / (points.length * 2.5), 6), 18);
              const barH = padTop + plotHeight - p.yTick;
              const isHovered = hoverIndex === p.index;
              if (barH <= 0 && p.data.tickets === 0) return null;
              return (
                <rect
                  key={`bar-${p.index}`}
                  x={p.x - barW / 2}
                  y={p.yTick}
                  width={barW}
                  height={Math.max(barH, 2)}
                  rx="3"
                  fill={isHovered ? 'rgba(212, 168, 106, 0.65)' : 'rgba(148, 163, 184, 0.35)'}
                  style={{ transition: 'fill 0.15s ease' }}
                />
              );
            })}

          {/* Đường vùng phủ Doanh thu (Area + Smooth Bezier Line) */}
          {(activeMetric === 'all' || activeMetric === 'revenue') && (
            <>
              <path d={areaPath} fill="url(#goldAreaGrad)" />
              <path
                d={linePath}
                fill="none"
                stroke="#D4A86A"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                filter="url(#goldGlow)"
              />
            </>
          )}

          {/* Các mốc thời gian trục X */}
          {points.map((p, idx) => {
            const total = points.length;
            // Thu gọn nhãn nếu có quá nhiều mốc thời gian (ví dụ 30 ngày)
            const showLabel =
              total <= 10 ||
              idx === 0 ||
              idx === total - 1 ||
              (total <= 16 && idx % 2 === 0) ||
              (total > 16 && idx % Math.ceil(total / 8) === 0);

            if (!showLabel) return null;
            return (
              <text
                key={`label-${idx}`}
                x={p.x}
                y={vbHeight - 10}
                textAnchor="middle"
                fill={hoverIndex === idx ? '#D4A86A' : '#64748B'}
                fontSize="10"
                fontFamily="sans-serif"
                fontWeight={hoverIndex === idx ? 600 : 400}
              >
                {formatXLabel(p.data.dateLabel)}
              </text>
            );
          })}

          {/* Con trỏ tương tác Interactive Crosshair khi Hover */}
          {hoveredPoint && (
            <g>
              {/* Đường dóng dọc */}
              <line
                x1={hoveredPoint.x}
                y1={padTop}
                x2={hoveredPoint.x}
                y2={padTop + plotHeight}
                stroke="rgba(212, 168, 106, 0.45)"
                strokeDasharray="3 3"
                strokeWidth="1.2"
              />
              {/* Điểm nhấn doanh thu */}
              {(activeMetric === 'all' || activeMetric === 'revenue') && (
                <circle
                  cx={hoveredPoint.x}
                  cy={hoveredPoint.yRev}
                  r="4.5"
                  fill="#D4A86A"
                  stroke="#0A0E17"
                  strokeWidth="2"
                  filter="url(#goldGlow)"
                />
              )}
            </g>
          )}
        </svg>

        {/* Thông báo nhã nhặn khi chưa có giao dịch trong kỳ */}
        {totalPeriodRevenue === 0 && totalPeriodTickets === 0 && (
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              textAlign: 'center',
              pointerEvents: 'none',
              background: 'rgba(15, 19, 27, 0.85)',
              border: '1px solid rgba(212, 168, 106, 0.2)',
              borderRadius: 20,
              padding: '6px 16px',
              backdropFilter: 'blur(8px)'
            }}
          >
            <span style={{ fontSize: '11.5px', color: '#94A3B8' }}>
              Chưa phát sinh giao dịch bán vé trong kỳ • Biểu đồ đã sẵn sàng ghi nhận dữ liệu thực tế
            </span>
          </div>
        )}

        {/* Tooltip kính mờ bay theo điểm hover */}
        {hoveredPoint && (
          <div
            style={{
              position: 'absolute',
              top: 10,
              left: Math.min(
                Math.max((hoveredPoint.x / vbWidth) * 100, 15),
                85
              ) + '%',
              transform: 'translateX(-50%)',
              background: 'rgba(16, 20, 29, 0.96)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              border: '1px solid rgba(212, 168, 106, 0.35)',
              borderRadius: 8,
              padding: '8px 12px',
              pointerEvents: 'none',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.6)',
              fontSize: '11.5px',
              whiteSpace: 'nowrap',
              zIndex: 20
            }}
          >
            <div style={{ color: '#94A3B8', fontSize: '10.5px', marginBottom: 2 }}>
              Mốc: <strong style={{ color: '#F1F5F9' }}>{hoveredPoint.data.dateLabel}</strong>
            </div>
            <div style={{ color: '#D4A86A', fontWeight: 700, fontSize: '12.5px' }}>
              {formatVND(hoveredPoint.data.revenue || 0)}
            </div>
            <div style={{ color: '#CBD5E1', fontSize: '11px', marginTop: 2 }}>
              {hoveredPoint.data.tickets || 0} vé phát hành • {hoveredPoint.data.checkins || 0} đã soát vào
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

