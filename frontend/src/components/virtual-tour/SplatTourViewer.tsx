import React, { useEffect, useRef, useState } from "react";
import { SplatTourViewer, SplatHotspot } from "./SplatTourViewer.js";

export interface SplatTourViewerReactProps {
  splatUrl: string;
  roomName?: string;
  hotspots?: SplatHotspot[];
  onHotspotSelect?: (hotspot: SplatHotspot) => void;
  className?: string;
}

export const SplatTourViewerReact: React.FC<SplatTourViewerReactProps> = ({
  splatUrl,
  roomName = "Gian Trưng Bày 3D Gaussian Splatting",
  hotspots = [],
  onHotspotSelect,
  className = "",
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const viewerInstanceRef = useRef<SplatTourViewer | null>(null);
  const [selectedHotspot, setSelectedHotspot] = useState<SplatHotspot | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const viewer = new SplatTourViewer({
      container: containerRef.current,
      splatUrl,
      hotspots,
      onHotspotClick: (hotspot) => {
        setSelectedHotspot(hotspot);
        if (onHotspotSelect) {
          onHotspotSelect(hotspot);
        }
      },
    });

    viewerInstanceRef.current = viewer;

    return () => {
      viewer.destroy();
      viewerInstanceRef.current = null;
    };
  }, [splatUrl, hotspots]);

  return (
    <div
      className={`splat-tour-wrapper ${className}`}
      style={{
        position: "relative",
        width: "100%",
        height: "100vh",
        background: "#080b10",
        overflow: "hidden",
      }}
    >
      {/* 3D Canvas Mount Point */}
      <div ref={containerRef} style={{ width: "100%", height: "100%" }} />

      {/* Top HUD Header */}
      <div
        style={{
          position: "absolute",
          top: "1.2rem",
          left: "1.5rem",
          right: "1.5rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          pointerEvents: "none",
          zIndex: 10,
        }}
      >
        <div
          style={{
            pointerEvents: "auto",
            background: "rgba(15, 23, 42, 0.85)",
            backdropFilter: "blur(16px)",
            border: "1px solid rgba(212, 175, 55, 0.3)",
            padding: "0.6rem 1.2rem",
            borderRadius: "9999px",
            color: "#f8fafc",
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
          }}
        >
          <span style={{ fontSize: "1.2rem" }}>🏛️</span>
          <div>
            <div style={{ fontSize: "0.7rem", color: "#d4af37", textTransform: "uppercase", fontWeight: 700 }}>
              Virtual 3D Gaussian Tour
            </div>
            <div style={{ fontSize: "0.95rem", fontWeight: 800 }}>{roomName}</div>
          </div>
        </div>

        <div
          style={{
            pointerEvents: "auto",
            background: "rgba(15, 23, 42, 0.85)",
            backdropFilter: "blur(16px)",
            border: "1px solid rgba(255, 255, 255, 0.15)",
            padding: "0.5rem 1rem",
            borderRadius: "8px",
            color: "#94a3b8",
            fontSize: "0.8rem",
          }}
        >
          💡 <b>Mẹo:</b> Kéo chuột để quan sát • <b>Nhấp đúp (Double-click)</b> vào tường/vật thể để zoom trực diện
        </div>
      </div>

      {/* Hotspot Count Badge */}
      <div
        style={{
          position: "absolute",
          bottom: "1.5rem",
          left: "1.5rem",
          background: "rgba(15, 23, 42, 0.85)",
          backdropFilter: "blur(16px)",
          border: "1px solid rgba(255, 255, 255, 0.15)",
          padding: "0.5rem 1rem",
          borderRadius: "8px",
          color: "#fff",
          fontSize: "0.82rem",
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          zIndex: 10,
        }}
      >
        <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#22c55e", display: "inline-block" }}></span>
        <span>{hotspots.length} Điểm hiện vật chi tiết đã được căn chỉnh</span>
      </div>
    </div>
  );
};

export default SplatTourViewerReact;
