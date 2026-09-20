import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import {
  RotateCw,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Globe,
  Eye,
  RefreshCw,
  Home
} from 'lucide-react';
import { useSystemBranding } from '../context/SystemBrandingContext';

interface LittlePlanetViewerProps {
  panoramaUrl: string;
  title?: string;
  autoStartLittlePlanet?: boolean;
}

export const LittlePlanetViewer: React.FC<LittlePlanetViewerProps> = ({
  panoramaUrl,
  title = 'Không gian toàn cảnh 360°',
  autoStartLittlePlanet = true
}) => {
  const { branding } = useSystemBranding();
  const containerRef = useRef<HTMLDivElement>(null);

  const [isLittlePlanetMode, setIsLittlePlanetMode] = useState(true);
  const [autoRotate, setAutoRotate] = useState(false);

  const viewerApiRef = useRef<{
    resetHome: () => void;
    togglePlanet: () => void;
    zoom: (delta: number) => void;
    toggleAutoRotate: () => void;
    replayPlanet: () => void;
  } | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    let width = container.clientWidth || window.innerWidth;
    let height = container.clientHeight || window.innerHeight;

    let isUserInteracting = false;
    let onPointerDownMouseX = 0;
    let onPointerDownMouseY = 0;
    let onPointerDownLon = 0;
    let onPointerDownLat = 0;

    // Yêu cầu: Mặc định khi tải trang là quả cầu thu nhỏ (Little Planet: pitch = -90, fov = 145)
    // Sau 1.5 giây, tự động animate phóng to (zoom in) mượt mà về góc nhìn thực tế siêu rộng (pitch = 0, fov = 100)
    let lon = 0;
    let lat = -90;
    let fov = 145;
    let isAutoRotating = false;

    let isAnimatingIntro = false;
    let introStartTime = 0;

    const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

    const startIntro = () => {
      isAnimatingIntro = true;
      introStartTime = performance.now();
    };

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(fov, width / height, 0.1, 1000);
    camera.position.set(0, 0, 0);

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

    const geometry = new THREE.SphereGeometry(500, 64, 32);
    geometry.scale(-1, 1, 1);

    const textureLoader = new THREE.TextureLoader();
    textureLoader.setCrossOrigin('anonymous');
    const texture = textureLoader.load(panoramaUrl, () => {
      renderer.render(scene, camera);
      // Đúng 1.5 giây sau khi tải xong, tự động animate bung góc nhìn rộng vào phòng
      setTimeout(() => {
        startIntro();
      }, 1500);
    });
    texture.minFilter = THREE.LinearFilter;
    texture.generateMipmaps = false;

    const material = new THREE.MeshBasicMaterial({ map: texture });
    const sphere = new THREE.Mesh(geometry, material);
    scene.add(sphere);

    // Tạo đĩa tròn Logo di sản ở sàn nhà (Nadir Cap)
    const nadirCanvas = document.createElement('canvas');
    nadirCanvas.width = 512;
    nadirCanvas.height = 512;
    const nctx = nadirCanvas.getContext('2d');
    if (nctx) {
      nctx.fillStyle = 'rgba(15, 23, 42, 0.94)';
      nctx.beginPath();
      nctx.arc(256, 256, 240, 0, Math.PI * 2);
      nctx.fill();
      nctx.lineWidth = 8;
      nctx.strokeStyle = '#B45309';
      nctx.stroke();

      nctx.fillStyle = '#FFFFFF';
      nctx.font = 'bold 24px sans-serif';
      nctx.textAlign = 'center';
      nctx.fillText(branding.shortName?.toUpperCase() || 'BẢO TÀNG DI SẢN', 256, 235);
      nctx.font = 'bold 20px sans-serif';
      nctx.fillStyle = '#F59E0B';
      nctx.fillText(branding.city?.toUpperCase() || 'TOUR 360°', 256, 270);
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

    let targetLon = lon;
    let targetLat = lat;
    let currentLon = lon;
    let currentLat = lat;

    const targetVector = new THREE.Vector3();
    let reqAnimId: number;

    const animate = () => {
      reqAnimId = requestAnimationFrame(animate);

      if (isAnimatingIntro) {
        // Animation kéo dài 2.0s với cubic easing
        const elapsed = (performance.now() - introStartTime) / 2000;
        if (elapsed < 1) {
          const progress = easeOutCubic(elapsed);
          lat = -90 + progress * 90; // Từ -90 (nhìn thẳng xuống quả cầu) lên 0 (ngang tầm mắt)
          fov = 145 - progress * 65; // Thu về 80° tự nhiên
          lon += 0.25;
          camera.fov = fov;
          camera.updateProjectionMatrix();
        } else {
          isAnimatingIntro = false;
          setIsLittlePlanetMode(false);
          lat = 0;
          fov = 80; // Góc nhìn 80° chuẩn mắt người, chống chóng mặt
          camera.fov = 80;
          camera.updateProjectionMatrix();
        }
        targetLon = lon;
        targetLat = lat;
        currentLon = lon;
        currentLat = lat;
      } else if (!isUserInteracting && isAutoRotating) {
        targetLon += 0.14;
        lon = targetLon;
      }

      // Giới hạn pitch tự nhiên [-38°, 38°] để người xem nhìn thoải mái quanh phòng mà không bao giờ bị lộ trần xám
      if (!isAnimatingIntro && !isLittlePlanetMode) {
        targetLat = Math.max(-36, Math.min(36, targetLat));
      } else {
        targetLat = Math.max(-90, Math.min(90, targetLat));
      }

      // Giảm chấn quán tính siêu mượt (Smooth Damping): Chống rung giật chuột, loại bỏ 100% cảm giác chóng mặt
      if (!isAnimatingIntro) {
        currentLon += (targetLon - currentLon) * 0.12;
        currentLat += (targetLat - currentLat) * 0.12;
      }

      const phi = THREE.MathUtils.degToRad(90 - currentLat);
      const theta = THREE.MathUtils.degToRad(currentLon);

      targetVector.set(
        500 * Math.sin(phi) * Math.cos(theta),
        500 * Math.cos(phi),
        500 * Math.sin(phi) * Math.sin(theta)
      );

      camera.lookAt(targetVector);
      renderer.render(scene, camera);
    };

    animate();

    const canvas = renderer.domElement;

    const onPointerDown = (e: PointerEvent) => {
      if (e.button !== 0 && e.pointerType === 'mouse') return;
      e.preventDefault();

      isUserInteracting = true;
      isAnimatingIntro = false;
      onPointerDownMouseX = e.clientX;
      onPointerDownMouseY = e.clientY;
      onPointerDownLon = targetLon;
      onPointerDownLat = targetLat;

      canvas.style.cursor = 'grabbing';

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
      // Độ nhạy chuột êm dịu theo tiêu cự mắt người
      const sensitivity = 0.22 * (fov / 80);
      targetLon = (onPointerDownMouseX - e.clientX) * sensitivity + onPointerDownLon;
      targetLat = (e.clientY - onPointerDownMouseY) * sensitivity + onPointerDownLat;
      lon = targetLon;
      lat = targetLat;
    };

    const onPointerUp = (e: PointerEvent) => {
      if (!isUserInteracting) return;
      isUserInteracting = false;
      canvas.style.cursor = 'grab';

      try {
        if (canvas.hasPointerCapture(e.pointerId)) {
          canvas.releasePointerCapture(e.pointerId);
        }
      } catch (_) {}

      document.removeEventListener('pointermove', onPointerMove);
      document.removeEventListener('pointerup', onPointerUp);
      document.removeEventListener('pointercancel', onPointerUp);
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      isAnimatingIntro = false;
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
        lat = Math.min(85, lat + 4);
      } else if (e.key === 'ArrowDown') {
        lat = Math.max(-85, lat - 4);
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

    viewerApiRef.current = {
      resetHome: () => {
        isAnimatingIntro = false;
        setIsLittlePlanetMode(false);
        lat = 0;
        fov = 85;
        camera.fov = 85;
        camera.updateProjectionMatrix();
      },
      togglePlanet: () => {
        if (isLittlePlanetMode || lat < -40 || fov > 115) {
          startIntro();
        } else {
          lat = -90;
          fov = 145;
          camera.fov = 145;
          camera.updateProjectionMatrix();
          setIsLittlePlanetMode(true);
        }
      },
      zoom: (delta: number) => {
        isAnimatingIntro = false;
        fov = Math.max(35, Math.min(135, fov + delta));
        camera.fov = fov;
        camera.updateProjectionMatrix();
      },
      toggleAutoRotate: () => {
        isAutoRotating = !isAutoRotating;
        setAutoRotate(isAutoRotating);
      },
      replayPlanet: () => {
        setIsLittlePlanetMode(true);
        lat = -90;
        fov = 145;
        camera.fov = 145;
        camera.updateProjectionMatrix();
        setTimeout(() => startIntro(), 1500);
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
  }, [panoramaUrl]);

  return (
    <div
      ref={containerRef}
      className="viewer-360-container"
      style={{ cursor: 'grab', touchAction: 'none' }}
    >
      {/* Top Banner */}
      <div className="viewer-top-banner" style={{ background: 'rgba(30, 58, 138, 0.9)' }}>
        <Eye size={15} />
        <span>{title}</span>
        {isLittlePlanetMode && (
          <span style={{ fontSize: 11, background: '#D97706', padding: '2px 6px', borderRadius: 4 }}>
            Góc nhìn Little Planet
          </span>
        )}
      </div>

      {/* Floating Toolbar */}
      <div className="viewer-bottom-toolbar" onClick={(e) => e.stopPropagation()}>
        <button
          className="viewer-tool-btn"
          title="Góc nhìn ban đầu (Góc siêu rộng 100°)"
          onClick={() => viewerApiRef.current?.resetHome()}
        >
          <Home size={18} />
        </button>

        <button
          className={`viewer-tool-btn ${isLittlePlanetMode ? 'active' : ''}`}
          title={isLittlePlanetMode ? 'Bước vào phòng (Góc nhìn siêu rộng 100°)' : 'Chế độ Hành tinh tí hon (Little Planet)'}
          onClick={() => viewerApiRef.current?.togglePlanet()}
        >
          <Globe size={18} />
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
          className={`viewer-tool-btn ${autoRotate ? 'active' : ''}`}
          title="Tự động xoay 360 độ"
          onClick={() => viewerApiRef.current?.toggleAutoRotate()}
        >
          <RotateCw size={18} />
        </button>

        <button
          className="viewer-tool-btn"
          title="Xem lại hiệu ứng Little Planet"
          onClick={() => viewerApiRef.current?.replayPlanet()}
        >
          <RefreshCw size={17} />
        </button>

        <div className="viewer-tool-separator" />

        <button
          className="viewer-tool-btn"
          title="Toàn màn hình"
          onClick={() => {
            if (!containerRef.current) return;
            if (!document.fullscreenElement) {
              containerRef.current.requestFullscreen().catch(() => {});
            } else {
              document.exitFullscreen().catch(() => {});
            }
          }}
        >
          <Maximize2 size={18} />
        </button>
      </div>
    </div>
  );
};
