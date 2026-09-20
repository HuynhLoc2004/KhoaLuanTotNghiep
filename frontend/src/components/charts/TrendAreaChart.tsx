import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';

export interface TrendPoint {
  label: string;
  value: number;
}

interface TrendAreaChartProps {
  points: TrendPoint[];
  height?: number;
  /** Đơn vị hiển thị trong chú thích khi rê chuột, ví dụ "ảnh". */
  unit?: string;
  /** Nhãn mô tả chuỗi dữ liệu, dùng cho trình đọc màn hình. */
  seriesLabel: string;
  /**
   * 'full' là đồ thị đầy đủ có lưới, trục và crosshair.
   * 'sparkline' là dạng thu nhỏ nhét trong thẻ số: chỉ còn hình dáng xu hướng,
   * bỏ hết lưới, trục và tương tác vì con số lớn bên cạnh mới là nội dung chính.
   */
  variant?: 'full' | 'sparkline';
}

const PAD_TOP = 10;
const PAD_BOTTOM = 18;
const PAD_X = 4;
const SPARK_PAD_TOP = 3;
const SPARK_PAD_BOTTOM = 3;

/**
 * Đồ thị đường có vùng tô cho một chuỗi dữ liệu duy nhất.
 *
 * Chỉ một chuỗi nên không cần bảng chú giải: tiêu đề của khối đã gọi tên nó.
 * Mọi chữ dùng token màu chữ, chỉ nét đồ thị mang màu vàng đồng.
 */
export const TrendAreaChart: React.FC<TrendAreaChartProps> = ({
  points,
  height = 150,
  unit = '',
  seriesLabel,
  variant = 'full'
}) => {
  const isSpark = variant === 'sparkline';
  const wrapRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  const [hovered, setHovered] = useState<number | null>(null);

  useLayoutEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const update = () => setWidth(el.clientWidth);
    update();
    if (typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    setHovered(null);
  }, [points]);

  const padTop = isSpark ? SPARK_PAD_TOP : PAD_TOP;
  const padBottom = isSpark ? SPARK_PAD_BOTTOM : PAD_BOTTOM;
  const innerW = Math.max(0, width - PAD_X * 2);
  const innerH = height - padTop - padBottom;

  const maxValue = Math.max(1, ...points.map((p) => p.value));
  const minValue = Math.min(...points.map((p) => p.value), 0);
  const span = Math.max(1, maxValue - minValue);

  const xAt = (i: number) =>
    PAD_X + (points.length <= 1 ? innerW / 2 : (i / (points.length - 1)) * innerW);
  const yAt = (v: number) => padTop + innerH - ((v - minValue) / span) * innerH;

  const linePath = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${xAt(i).toFixed(2)} ${yAt(p.value).toFixed(2)}`)
    .join(' ');

  const areaPath = points.length
    ? `${linePath} L ${xAt(points.length - 1).toFixed(2)} ${(padTop + innerH).toFixed(2)} L ${xAt(0).toFixed(2)} ${(padTop + innerH).toFixed(2)} Z`
    : '';

  const handleMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (isSpark || !points.length || innerW <= 0) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left - PAD_X;
    const ratio = Math.min(1, Math.max(0, x / innerW));
    setHovered(Math.round(ratio * (points.length - 1)));
  };

  const active = hovered !== null ? points[hovered] : null;

  return (
    <div className="trend-chart" ref={wrapRef}>
      {width > 0 && (
        <svg
          width={width}
          height={height}
          role="img"
          aria-label={`${seriesLabel}: từ ${points[0]?.value ?? 0} đến ${points[points.length - 1]?.value ?? 0} ${unit}`}
          onMouseMove={handleMove}
          onMouseLeave={() => setHovered(null)}
        >
          {/* Đường lưới lùi về sau, chỉ đủ để ước lượng độ cao */}
          {!isSpark && [0, 0.5, 1].map((t) => (
            <line
              key={t}
              x1={PAD_X}
              x2={PAD_X + innerW}
              y1={padTop + innerH * t}
              y2={padTop + innerH * t}
              stroke="var(--border-color)"
              strokeWidth={1}
            />
          ))}

          <path d={areaPath} fill="var(--accent-gold)" fillOpacity={isSpark ? 0.2 : 0.14} />
          <path
            d={linePath}
            fill="none"
            stroke="var(--accent-gold)"
            strokeWidth={isSpark ? 1.5 : 2}
            strokeLinejoin="round"
            strokeLinecap="round"
          />

          {active && hovered !== null && (
            <>
              <line
                x1={xAt(hovered)}
                x2={xAt(hovered)}
                y1={padTop}
                y2={padTop + innerH}
                stroke="var(--border-dark)"
                strokeWidth={1}
              />
              <circle
                cx={xAt(hovered)}
                cy={yAt(active.value)}
                r={5}
                fill="var(--primary)"
                stroke="var(--bg-surface)"
                strokeWidth={2}
              />
            </>
          )}
        </svg>
      )}

      {active && hovered !== null && width > 0 && (
        <div
          className="trend-tooltip"
          style={{
            left: Math.min(Math.max(xAt(hovered), 54), width - 54),
            top: Math.max(0, yAt(active.value) - 40)
          }}
        >
          <strong>{active.value.toLocaleString('vi-VN')}</strong> {unit} · {active.label}
        </div>
      )}

      {!isSpark && (
      <div className="trend-axis">
        <span>{points[0]?.label}</span>
        <span>{points[points.length - 1]?.label}</span>
      </div>
      )}
    </div>
  );
};
