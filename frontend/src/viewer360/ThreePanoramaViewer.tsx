import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Hotspot, MuseumRoom } from '../types';
import {
  RotateCw,
  ZoomIn,
  ZoomOut,
  Maximize2,
  MapPin,
  Home,
  Navigation,
  CheckCircle2,
  Camera
} from 'lucide-react';

interface ThreePanoramaViewerProps {
  room: MuseumRoom;
  allRooms?: MuseumRoom[];
  isPinMode?: boolean;
  onTogglePinMode?: () => void;
  onCanvasPinClick?: (coords: { pitch: number; yaw: number }) => void;
  onHotspotClick?: (hotspot: Hotspot) => void;
  onCaptureInitialView?: (view: { pitch: number; yaw: number; fov: number }) => void;
}

export const ThreePanoramaViewer: React.FC<ThreePanoramaViewerProps> = ({
  room,
  allRooms,
  isPinMode = false,
  onTogglePinMode,
  onCanvasPinClick,
  onHotspotClick,
  onCaptureInitialView
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const hotspotElementsRef = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const isPinModeRef = useRef(isPinMode);
  const onCanvasPinClickRef = useRef(onCanvasPinClick);

  // Keep refs updated without triggering Three.js rebuilds
  useEffect(() => {
    isPinModeRef.current = isPinMode;
  }, [isPinMode]);

  useEffect(() => {
    onCanvasPinClickRef.current = onCanvasPinClick;
  }, [onCanvasPinClick]);

  // UI state for reactive button active states
  const [autoRotate, setAutoRotate] = useState(false);
  const [saveToast, setSaveToast] = useState(false);

  // References to communicate with render loop
  const viewerApiRef = useRef<{
    resetHome: () => void;
    zoom: (delta: number) => void;
    toggleAutoRotate: () => void;
    captureView: () => void;
  } | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    let width = container.clientWidth || window.innerWidth;
    let height = container.clientHeight || window.innerHeight;

    // Direct orientation variables
    let isUserInteracting = false;
    let onPointerDownMouseX = 0;
    let onPointerDownMouseY = 0;
    let onPointerDownLon = 0;
    let onPointerDownLat = 0;

    let lon = room.initialView?.yaw || 0;
    let lat = room.initialView?.pitch || 0;
    let fov = room.initialView?.fov || 115; // Góc nhìn siêu rộng 115° cho không gian thoáng đãng
    let isAutoRotating = false;

    // Three.js Core
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(fov, width / height, 0.1, 1000);
    camera.position.set(0, 0, 0);

    // Create fresh WebGLRenderer and append its canvas to container
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.display = 'block';
    renderer.domElement.style.touchAction = 'none';
    container.insertBefore(renderer.domElement, container.firstChild);

    // Inverted sphere for 360 indoor panorama
    const geometry = new THREE.SphereGeometry(500, 64, 32);
    geometry.scale(-1, 1, 1);

    const textureLoader = new THREE.TextureLoader();
    textureLoader.setCrossOrigin('anonymous');
    const texture = textureLoader.load(room.panoramaUrl, () => {
      renderer.render(scene, camera);
    });
    texture.minFilter = THREE.LinearFilter;
    texture.generateMipmaps = false;

    const material = new THREE.MeshBasicMaterial({ map: texture });
    const sphere = new THREE.Mesh(geometry, material);
    scene.add(sphere);

    // Đĩa tròn Logo di sản ở sàn nhà (Nadir Cap)
    const nadirCanvas = document.createElement('canvas');
    nadirCanvas.width = 512;
    nadirCanvas.height = 512;
    const nctx = nadirCanvas.getContext('2d');
    if (nctx) {
      nctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
      nctx.beginPath();
      nctx.arc(256, 256, 240, 0, Math.PI * 2);
      nctx.fill();
      nctx.lineWidth = 8;
      nctx.strokeStyle = '#B45309';
      nctx.stroke();

      nctx.fillStyle = '#FFFFFF';
      nctx.font = 'bold 26px sans-serif';
      nctx.textAlign = 'center';
      nctx.fillText('BẢO TÀNG LỊCH SỬ', 256, 235);
      nctx.font = 'bold 22px sans-serif';
      nctx.fillStyle = '#F59E0B';
      nctx.fillText('TP. HỒ CHÍ MINH', 256, 270);
      nctx.font = '15px sans-serif';
      nctx.fillStyle = '#94A3B8';
      nctx.fillText('VIRTUAL TOUR 360°', 256, 305);
    }
    const nadirTexture = new THREE.CanvasTexture(nadirCanvas);
    const nadirGeo = new THREE.CircleGeometry(150, 32);
    const nadirMat = new THREE.MeshBasicMaterial({
      map: nadirTexture,
      transparent: true
    });
    const nadirMesh = new THREE.Mesh(nadirGeo, nadirMat);
    nadirMesh.rotation.x = -Math.PI / 2;
    nadirMesh.position.y = -480;
    scene.add(nadirMesh);

    const targetVector = new THREE.Vector3();
    let reqAnimId: number;

    // Master Render Loop
    const animate = () => {
      reqAnimId = requestAnimationFrame(animate);

      if (!isUserInteracting && isAutoRotating) {
        lon += 0.18;
      }

      // Giới hạn góc ngước/cúi tự nhiên từ -38° đến +38° để không bao giờ bị thắt nút cực
      lat = Math.max(-38, Math.min(38, lat));
      const phi = THREE.MathUtils.degToRad(90 - lat);
      const theta = THREE.MathUtils.degToRad(lon);

      targetVector.set(
        500 * Math.sin(phi) * Math.cos(theta),
        500 * Math.cos(phi),
        500 * Math.sin(phi) * Math.sin(theta)
      );

      camera.lookAt(targetVector);
      renderer.render(scene, camera);

      // Project Hotspots onto screen coordinates
      if (room.hotspots && room.hotspots.length > 0) {
        const w = container.clientWidth;
        const h = container.clientHeight;

        for (const hs of room.hotspots) {
          const el = hotspotElementsRef.current[hs.id];
          if (!el) continue;

          const hsPhi = THREE.MathUtils.degToRad(90 - hs.pitch);
          const hsTheta = THREE.MathUtils.degToRad(hs.yaw);

          const hsPos = new THREE.Vector3(
            500 * Math.sin(hsPhi) * Math.cos(hsTheta),
            500 * Math.cos(hsPhi),
            500 * Math.sin(hsPhi) * Math.sin(hsTheta)
          );

          const screenVec = hsPos.project(camera);
          const isBehind = screenVec.z > 1.0;

          if (isBehind) {
            el.style.display = 'none';
          } else {
            const screenX = (screenVec.x * 0.5 + 0.5) * w;
            const screenY = (-screenVec.y * 0.5 + 0.5) * h;
            el.style.display = 'flex';
            el.style.left = `${screenX}px`;
            el.style.top = `${screenY}px`;
          }
        }
      }
    };

    animate();

    // DOM Pointer Event Listeners
    const canvas = renderer.domElement;

    const onPointerDown = (e: PointerEvent) => {
      // Only allow primary pointer (left click or single touch)
      if (e.button !== 0 && e.pointerType === 'mouse') return;
      
      // Stop native drag-and-drop or text selection behavior
      e.preventDefault();
      
      isUserInteracting = true;
      onPointerDownMouseX = e.clientX;
      onPointerDownMouseY = e.clientY;
      onPointerDownLon = lon;
      onPointerDownLat = lat;

      canvas.style.cursor = isPinModeRef.current ? 'crosshair' : 'grabbing';

      try {
        canvas.setPointerCapture(e.pointerId);
      } catch (_) {}

      document.addEventListener('pointermove', onPointerMove, { passive: false });
      document.addEventListener('pointerup', onPointerUp);
      document.addEventListener('pointercancel', onPointerUp);
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!isUserInteracting) return;
      e.preventDefault();

      // Increased sensitivity for responsive, fluid 360 rotation
      const sensitivity = 0.28 * (fov / 90);
      lon = (onPointerDownMouseX - e.clientX) * sensitivity + onPointerDownLon;
      lat = (e.clientY - onPointerDownMouseY) * sensitivity + onPointerDownLat;
    };

    const onPointerUp = (e: PointerEvent) => {
      if (!isUserInteracting) return;
      isUserInteracting = false;
      canvas.style.cursor = isPinModeRef.current ? 'crosshair' : 'grab';

      try {
        if (canvas.hasPointerCapture(e.pointerId)) {
          canvas.releasePointerCapture(e.pointerId);
        }
      } catch (_) {}

      document.removeEventListener('pointermove', onPointerMove);
      document.removeEventListener('pointerup', onPointerUp);
      document.removeEventListener('pointercancel', onPointerUp);

      // Check click vs drag for hotspot pinning
      const dist = Math.hypot(e.clientX - onPointerDownMouseX, e.clientY - onPointerDownMouseY);
      if (dist < 6 && isPinModeRef.current && onCanvasPinClickRef.current) {
        const rect = container.getBoundingClientRect();
        const clickX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        const clickY = -((e.clientY - rect.top) / rect.height) * 2 + 1;

        const vector = new THREE.Vector3(clickX, clickY, 0.5);
        vector.unproject(camera);
        const dir = vector.sub(camera.position).normalize();

        const clickPitch = Math.round(Math.asin(dir.y) * (180 / Math.PI));
        const clickYaw = Math.round(Math.atan2(dir.z, dir.x) * (180 / Math.PI));

        onCanvasPinClickRef.current({ pitch: clickPitch, yaw: clickYaw });
      }
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      fov = Math.max(35, Math.min(135, fov + e.deltaY * 0.05));
      camera.fov = fov;
      camera.updateProjectionMatrix();
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        lon -= 5;
      } else if (e.key === 'ArrowRight') {
        lon += 5;
      } else if (e.key === 'ArrowUp') {
        lat = Math.min(75, lat + 4);
      } else if (e.key === 'ArrowDown') {
        lat = Math.max(-75, lat - 4);
      } else if (e.key === '+' || e.key === '=') {
        fov = Math.max(35, fov - 5);
        camera.fov = fov;
        camera.updateProjectionMatrix();
      } else if (e.key === '-' || e.key === '_') {
        fov = Math.min(135, fov + 5);
        camera.fov = fov;
        camera.updateProjectionMatrix();
      }
    };

    const onResize = () => {
      width = container.clientWidth;
      height = container.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    canvas.addEventListener('pointerdown', onPointerDown);
    canvas.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('resize', onResize);

    // Expose control API
    viewerApiRef.current = {
      resetHome: () => {
        lon = room.initialView?.yaw || 0;
        lat = room.initialView?.pitch || 0;
        fov = room.initialView?.fov || 115;
        camera.fov = fov;
        camera.updateProjectionMatrix();
      },
      zoom: (delta: number) => {
        fov = Math.max(35, Math.min(135, fov + delta));
        camera.fov = fov;
        camera.updateProjectionMatrix();
      },
      toggleAutoRotate: () => {
        isAutoRotating = !isAutoRotating;
        setAutoRotate(isAutoRotating);
      },
      captureView: () => {
        if (onCaptureInitialView) {
          onCaptureInitialView({
            pitch: Math.round(lat),
            yaw: Math.round(lon),
            fov: Math.round(fov)
          });
          setSaveToast(true);
          setTimeout(() => setSaveToast(false), 2500);
        }
      }
    };

    return () => {
      cancelAnimationFrame(reqAnimId);
      canvas.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('pointermove', onPointerMove);
      document.removeEventListener('pointerup', onPointerUp);
      document.removeEventListener('pointercancel', onPointerUp);
      canvas.removeEventListener('wheel', onWheel);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('resize', onResize);
      if (container.contains(canvas)) {
        container.removeChild(canvas);
      }
      geometry.dispose();
      material.dispose();
      texture.dispose();
      renderer.dispose();
    };
  }, [room.id, room.panoramaUrl]);

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  return (
    <div
      ref={containerRef}
      className="viewer-360-container"
      style={{
        cursor: isPinMode ? 'crosshair' : 'grab',
        touchAction: 'none'
      }}
    >
      {/* Top Banner: Name of Room */}
      <div className="viewer-top-banner">
        <Navigation size={15} />
        <span>{room.name}</span>
        <span style={{ opacity: 0.75, fontSize: 11 }}>({room.code})</span>
      </div>

      {/* Pin Mode Indicator */}
      {isPinMode && (
        <div className="viewer-mode-banner">
          <MapPin size={14} />
          <span>CHẾ ĐỘ GHIM HOTSPOT: Click vào ảnh 360 để gắn điểm liên kết</span>
        </div>
      )}

      {/* Toast feedback */}
      {saveToast && (
        <div
          style={{
            position: 'absolute',
            top: 70,
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(5, 150, 105, 0.95)',
            color: '#FFFFFF',
            padding: '8px 18px',
            borderRadius: 6,
            fontSize: 13,
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            zIndex: 30
          }}
        >
          <CheckCircle2 size={16} />
          Đã lưu góc nhìn khởi tạo thành công!
        </div>
      )}

      {/* Direct DOM Hotspot Elements */}
      {room.hotspots?.map((hs) => (
        <div
          key={hs.id}
          ref={(el) => {
            hotspotElementsRef.current[hs.id] = el;
          }}
          className="hotspot-marker"
          style={{ display: 'none' }}
          onClick={(e) => {
            e.stopPropagation();
            if (onHotspotClick) onHotspotClick(hs);
          }}
          title={hs.title}
        >
          <div className="hotspot-icon-wrapper">
            <Navigation size={20} style={{ transform: 'rotate(-45deg)' }} />
          </div>
          <div className="hotspot-label">{hs.title}</div>
        </div>
      ))}

      {/* Bottom Floating Control Bar */}
      <div className="viewer-bottom-toolbar" onClick={(e) => e.stopPropagation()}>
        <button
          className="viewer-tool-btn"
          title="Góc nhìn ban đầu"
          onClick={() => viewerApiRef.current?.resetHome()}
        >
          <Home size={18} />
        </button>

        <button
          className="viewer-tool-btn"
          title="Thu nhỏ góc nhìn"
          onClick={() => viewerApiRef.current?.zoom(10)}
        >
          <ZoomOut size={18} />
        </button>

        <button
          className="viewer-tool-btn"
          title="Phóng to chi tiết"
          onClick={() => viewerApiRef.current?.zoom(-10)}
        >
          <ZoomIn size={18} />
        </button>

        <div className="viewer-tool-separator" />

        <button
          className={`viewer-tool-btn ${isPinMode ? 'active' : ''}`}
          title={isPinMode ? 'Tắt chế độ ghim' : 'Ghim điểm liên kết (Hotspot)'}
          onClick={onTogglePinMode}
        >
          <MapPin size={18} />
        </button>

        <button
          className={`viewer-tool-btn ${autoRotate ? 'active' : ''}`}
          title="Tự động xoay 360 độ"
          onClick={() => viewerApiRef.current?.toggleAutoRotate()}
        >
          <RotateCw size={18} />
        </button>

        <button
          className="viewer-tool-btn"
          title="Lưu góc nhìn hiện tại làm góc mở đầu"
          onClick={() => viewerApiRef.current?.captureView()}
        >
          <Camera size={18} />
        </button>

        <div className="viewer-tool-separator" />

        <button className="viewer-tool-btn" title="Toàn màn hình" onClick={toggleFullscreen}>
          <Maximize2 size={18} />
        </button>
      </div>
    </div>
  );
};
