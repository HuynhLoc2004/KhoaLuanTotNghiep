/**
 * ==============================================================================
 * BỘ THUẬT TOÁN THỊ GIÁC MÁY TÍNH & TRÍCH XUẤT ĐỒ THỊ TÔ-PÔ MẶT BẰNG
 * (PURE COMPUTER VISION & TOPOLOGY EXTRACTION ENGINE - 100% NO EXTERNAL AI)
 * ==============================================================================
 * Tác giả: Nhóm Khóa Luận Tốt Nghiệp 2026 - Hệ thống Tour 360 Bảo Tàng Di Sản
 * 
 * KIẾN TRÚC THUẬT TOÁN 5 TẦNG:
 * 1. Chuẩn hóa & Phân ngưỡng tự động Otsu (Otsu's Global Thresholding)
 * 2. Phân đoạn liên thông & Khử nhiễu biên (Two-Pass Connected Component Labeling - CCL)
 * 3. Bóc tách lõi ký tự & Dò đường bao xuyên tâm 360° (Radial Ray-Casting Node Detection)
 * 4. Dò hành lang liên kết & Xác định chiều vector mũi tên (Corridor & Endpoint Vector Tracing)
 * 5. Chuẩn hóa không gian sang tọa độ % và sinh Đồ thị Topo hoàn chỉnh
 */

import sharp from 'sharp';
import fs from 'fs';

export interface ICvDetectedNode {
  id: string;
  code: string;
  name: string;
  centerX: number;
  centerY: number;
  radius: number;
  // Tọa độ tỷ lệ phần trăm (0 - 100%)
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ICvDetectedEdge {
  id: string;
  fromNodeId: string;
  toNodeId: string;
  direction:
    | 'front'
    | 'back'
    | 'left'
    | 'right'
    | 'center'
    | 'up'
    | 'down'
    | 'northeast'
    | 'northwest'
    | 'southeast'
    | 'southwest';
  compassDirection:
    | 'north'
    | 'south'
    | 'east'
    | 'west'
    | 'northeast'
    | 'northwest'
    | 'southeast'
    | 'southwest';
  isDirected: boolean;
  isReturn?: boolean;
  doorX: number;
  doorY: number;
  distance: number;
  label: string;
}

export interface ICvAnalysisResult {
  imageWidth: number;
  imageHeight: number;
  nodes: ICvDetectedNode[];
  edges: ICvDetectedEdge[];
  executionTimeMs: number;
  algorithmName: string;
}

/**
 * Hàm phân tích Thị giác máy tính thuần túy từ file ảnh mặt bằng hoặc sơ đồ vẽ tay
 */
export async function analyzeFloorPlanWithPureCV(imageInput: string | Buffer): Promise<ICvAnalysisResult> {
  const startTime = Date.now();

  if (typeof imageInput === 'string' && !fs.existsSync(imageInput)) {
    throw new Error(`File ảnh không tồn tại tại đường dẫn: ${imageInput}`);
  }

  // 1. Đọc metadata ảnh gốc
  const originalMetadata = await sharp(imageInput).metadata();
  const origWidth = originalMetadata.width || 1200;
  const origHeight = originalMetadata.height || 800;

  // 2. Chuẩn hóa kích thước xử lý về độ rộng 800px để đạt tốc độ xử lý siêu tốc (dưới 100ms)
  const normWidth = 800;
  const { data: grayscaleBuffer, info } = await sharp(imageInput)
    .resize(normWidth, null, { fit: 'inside' })
    .grayscale()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const width = info.width;
  const height = info.height;

  // 3. Giải thuật Otsu Auto-Thresholding tính ngưỡng phân tách nét vẽ và nền trắng
  const histogram = new Array(256).fill(0);
  for (let i = 0; i < grayscaleBuffer.length; i++) {
    histogram[grayscaleBuffer[i]]++;
  }

  const totalPixels = grayscaleBuffer.length;
  let sumAll = 0;
  for (let t = 0; t < 256; t++) {
    sumAll += t * histogram[t];
  }

  let sumBackground = 0;
  let weightBackground = 0;
  let maxVariance = 0;
  let optimalThreshold = 128;

  for (let t = 0; t < 256; t++) {
    weightBackground += histogram[t];
    if (weightBackground === 0) continue;
    const weightForeground = totalPixels - weightBackground;
    if (weightForeground === 0) break;

    sumBackground += t * histogram[t];
    const meanBackground = sumBackground / weightBackground;
    const meanForeground = (sumAll - sumBackground) / weightForeground;
    const betweenClassVariance = weightBackground * weightForeground * Math.pow(meanBackground - meanForeground, 2);

    if (betweenClassVariance > maxVariance) {
      maxVariance = betweenClassVariance;
      optimalThreshold = t;
    }
  }

  // 4. Sinh ma trận nhị phân Binary Map (1 = nét vẽ, 0 = nền trắng) và khử viền khung mép ảnh
  const binaryMap = new Uint8Array(width * height);
  const borderMargin = 14;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x;
      if (x < borderMargin || x >= width - borderMargin || y < borderMargin || y >= height - borderMargin) {
        binaryMap[idx] = 0; // Loại bỏ khung viền đen sát mép ảnh
      } else {
        binaryMap[idx] = grayscaleBuffer[idx] < optimalThreshold ? 1 : 0;
      }
    }
  }

  // 5. Giải thuật Connected Component Labeling (BFS 8 hướng) gom cụm các nét vẽ
  const visited = new Uint8Array(width * height);
  interface Component {
    id: number;
    pixels: number[];
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
    width: number;
    height: number;
    area: number;
    centerX: number;
    centerY: number;
  }
  const components: Component[] = [];
  let compCounter = 0;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x;
      if (binaryMap[idx] === 1 && visited[idx] === 0) {
        const queue = [idx];
        visited[idx] = 1;
        const compPixels = [];
        let minX = x, maxX = x, minY = y, maxY = y;
        let sumX = 0, sumY = 0;
        let qHead = 0;

        while (qHead < queue.length) {
          const curr = queue[qHead++];
          compPixels.push(curr);
          const cx = curr % width;
          const cy = Math.floor(curr / width);

          if (cx < minX) minX = cx;
          if (cx > maxX) maxX = cx;
          if (cy < minY) minY = cy;
          if (cy > maxY) maxY = cy;
          sumX += cx;
          sumY += cy;

          for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
              if (dx === 0 && dy === 0) continue;
              const nx = cx + dx;
              const ny = cy + dy;
              if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
                const nIdx = ny * width + nx;
                if (binaryMap[nIdx] === 1 && visited[nIdx] === 0) {
                  visited[nIdx] = 1;
                  queue.push(nIdx);
                }
              }
            }
          }
        }

        const compW = maxX - minX + 1;
        const compH = maxY - minY + 1;

        // Bỏ qua khung viền cực đại (nếu có)
        if (compW > width * 0.92 && compH > height * 0.92) continue;

        // Lọc bỏ nhiễu hạt bụi quá nhỏ (< 20 pixel)
        if (compPixels.length >= 20) {
          components.push({
            id: ++compCounter,
            pixels: compPixels,
            minX, maxX, minY, maxY,
            width: compW, height: compH,
            area: compPixels.length,
            centerX: sumX / compPixels.length,
            centerY: sumY / compPixels.length
          });
        }
      }
    }
  }

  // 6. Phát hiện các Node gian phòng:
  // Lọc các ứng viên ký tự chữ cái lõi (A, B, D,...) nằm trong phòng
  const candidateLetters = components.filter((c) =>
    c.height >= 35 && c.height <= 140 &&
    c.width >= 18 && c.width <= 110 &&
    c.area >= 180 && c.area <= 1200
  );

  const rawDetectedNodes: {
    centerX: number;
    centerY: number;
    radius: number;
    x: number;
    y: number;
    width: number;
    height: number;
  }[] = [];

  // Từ mỗi ký tự lõi, bắn tia 360 độ (Radial Ray-Casting) để dò vách vòng tròn
  for (const letter of candidateLetters) {
    const lcx = letter.centerX;
    const lcy = letter.centerY;
    const rays = 36;
    const hitDistances: number[] = [];
    const quadrantHits = [0, 0, 0, 0];

    for (let r = 0; r < rays; r++) {
      const angle = (r * 2 * Math.PI) / rays;
      const cosA = Math.cos(angle);
      const sinA = Math.sin(angle);
      let hitDist = -1;

      for (let dist = 30; dist <= 160; dist++) {
        const qx = Math.round(lcx + dist * cosA);
        const qy = Math.round(lcy + dist * sinA);
        if (qx >= 0 && qx < width && qy >= 0 && qy < height) {
          const idx = qy * width + qx;
          if (binaryMap[idx] === 1 && !letter.pixels.includes(idx)) {
            hitDist = dist;
            break;
          }
        }
      }

      if (hitDist > 0) {
        hitDistances.push(hitDist);
        const qIdx = Math.floor(((angle + Math.PI / 4) % (2 * Math.PI)) / (Math.PI / 2));
        quadrantHits[qIdx % 4]++;
      }
    }

    // Điều kiện phòng tròn: vách bao quanh ít nhất 3 trong 4 góc phần tư và độ lệch bán kính đều
    const coveredQuadrants = quadrantHits.filter((c) => c > 0).length;
    if (coveredQuadrants >= 3 && hitDistances.length >= rays * 0.45) {
      const mean = hitDistances.reduce((a, b) => a + b, 0) / hitDistances.length;
      const variance = hitDistances.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / hitDistances.length;
      const stdDev = Math.sqrt(variance);

      // Nếu khoảng cách các tia tương đối đồng đều (chống nhận diện nhầm mũi tên hoặc chữ chú thích)
      if (stdDev < 28) {
        hitDistances.sort((a, b) => a - b);
        const medianRadius = hitDistances[Math.floor(hitDistances.length / 2)];
        const xPct = ((lcx - medianRadius) / width) * 100;
        const yPct = ((lcy - medianRadius) / height) * 100;
        const wPct = ((medianRadius * 2) / width) * 100;
        const hPct = ((medianRadius * 2) / height) * 100;

        rawDetectedNodes.push({
          centerX: lcx,
          centerY: lcy,
          radius: medianRadius,
          x: Math.max(0, Math.round(xPct * 10) / 10),
          y: Math.max(0, Math.round(yPct * 10) / 10),
          width: Math.min(100, Math.round(wPct * 10) / 10),
          height: Math.min(100, Math.round(hPct * 10) / 10)
        });
      }
    }
  }

  // 7. Sắp xếp các Node theo thứ tự không gian chuẩn: Từ trên xuống dưới, từ trái sang phải
  rawDetectedNodes.sort((a, b) => {
    if (Math.abs(a.centerY - b.centerY) > 70) return a.centerY - b.centerY;
    return a.centerX - b.centerX;
  });

  const alphabet = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
  const finalNodes: ICvDetectedNode[] = rawDetectedNodes.map((rn, idx) => {
    const letterCode = alphabet[idx] || `${idx + 1}`;
    let directionDesc = 'Trung tâm';
    if (rn.x < 35 && rn.y < 45) directionDesc = 'Cánh Tây';
    else if (rn.x > 60 && rn.y < 45) directionDesc = 'Cánh Đông';
    else if (rn.y > 55) directionDesc = 'Cánh Nam';

    return {
      id: `node_room_${letterCode}`,
      code: `GIAN-${letterCode}`,
      name: `Gian ${letterCode} (${directionDesc})`,
      centerX: rn.centerX,
      centerY: rn.centerY,
      radius: rn.radius,
      x: rn.x,
      y: rn.y,
      width: rn.width,
      height: rn.height
    };
  });

  // 8. Tách các vòng tròn Node ra khỏi ma trận nét vẽ để dò đường nối (Edges) và đầu mũi tên
  const edgesOnlyMap = new Uint8Array(binaryMap);
  for (const n of finalNodes) {
    for (let dy = -n.radius - 8; dy <= n.radius + 8; dy++) {
      for (let dx = -n.radius - 8; dx <= n.radius + 8; dx++) {
        if (dx * dx + dy * dy <= (n.radius + 8) * (n.radius + 8)) {
          const qx = Math.round(n.centerX + dx);
          const qy = Math.round(n.centerY + dy);
          if (qx >= 0 && qx < width && qy >= 0 && qy < height) {
            edgesOnlyMap[qy * width + qx] = 0;
          }
        }
      }
    }
  }

  // Hàm trợ thủ tính toán phương vị 8 hướng không gian chuẩn xác
  function computeEdgeDirection(
    fromNode: ICvDetectedNode,
    toNode: ICvDetectedNode,
    canvasW: number,
    canvasH: number
  ) {
    const edgeDx = toNode.centerX - fromNode.centerX;
    const edgeDy = toNode.centerY - fromNode.centerY;
    const dist = Math.sqrt(edgeDx * edgeDx + edgeDy * edgeDy);
    if (dist === 0) return null;

    const angleDeg = (Math.atan2(edgeDy, edgeDx) * 180) / Math.PI; // [-180..180]
    // Chuẩn hóa góc phương vị azimuth [0..360) với 0° = Trục dương X (East / Phải), 90° = Trục dương Y (South / Dưới)
    const azimuth = (angleDeg + 360) % 360;

    let direction: ICvDetectedEdge['direction'];
    let compassDirection: ICvDetectedEdge['compassDirection'];
    let humanDirectionVi: string;

    // Phân vùng góc 8 phương vị không gian (mỗi phân vùng 45 độ đối xứng)
    if (azimuth >= 337.5 || azimuth < 22.5) {
      compassDirection = 'east';
      direction = 'right';
      humanDirectionVi = 'Bên phải (Hướng Đông)';
    } else if (azimuth >= 22.5 && azimuth < 67.5) {
      compassDirection = 'southeast';
      direction = 'southeast';
      humanDirectionVi = 'Phía dưới - Phải (Hướng Đông Nam)';
    } else if (azimuth >= 67.5 && azimuth < 112.5) {
      compassDirection = 'south';
      direction = 'down';
      humanDirectionVi = 'Phía dưới (Hướng Nam)';
    } else if (azimuth >= 112.5 && azimuth < 157.5) {
      compassDirection = 'southwest';
      direction = 'southwest';
      humanDirectionVi = 'Phía dưới - Trái (Hướng Tây Nam)';
    } else if (azimuth >= 157.5 && azimuth < 202.5) {
      compassDirection = 'west';
      direction = 'left';
      humanDirectionVi = 'Bên trái (Hướng Tây)';
    } else if (azimuth >= 202.5 && azimuth < 247.5) {
      compassDirection = 'northwest';
      direction = 'northwest';
      humanDirectionVi = 'Phía trên - Trái (Hướng Tây Bắc)';
    } else if (azimuth >= 247.5 && azimuth < 292.5) {
      compassDirection = 'north';
      direction = 'front';
      humanDirectionVi = 'Phía trước / Đi thẳng (Hướng Bắc)';
    } else {
      compassDirection = 'northeast';
      direction = 'northeast';
      humanDirectionVi = 'Phía trên - Phải (Hướng Đông Bắc)';
    }

    const dirEdgeUx = edgeDx / dist;
    const dirEdgeUy = edgeDy / dist;
    const doorX = Math.round(((fromNode.centerX + fromNode.radius * dirEdgeUx) / canvasW) * 100);
    const doorY = Math.round(((fromNode.centerY + fromNode.radius * dirEdgeUy) / canvasH) * 100);

    return {
      direction,
      compassDirection,
      humanDirectionVi,
      doorX: Math.max(0, Math.min(100, doorX)),
      doorY: Math.max(0, Math.min(100, doorY)),
      distance: Math.round(dist)
    };
  }

  // 9. Dò tìm liên kết đường nối & Phân tích chóp mũi tên (Corridor & Arrowhead Morphological Tracing)
  const finalEdges: ICvDetectedEdge[] = [];

  for (let i = 0; i < finalNodes.length; i++) {
    for (let j = 0; j < finalNodes.length; j++) {
      if (i >= j) continue; // Khảo sát từng cặp 1 lần
      const nodeA = finalNodes[i];
      const nodeB = finalNodes[j];

      const dx = nodeB.centerX - nodeA.centerX;
      const dy = nodeB.centerY - nodeA.centerY;
      const totalDist = Math.sqrt(dx * dx + dy * dy);
      if (totalDist === 0) continue;

      const ux = dx / totalDist;
      const uy = dy / totalDist;
      const perpX = -uy;
      const perpY = ux;

      const startDist = nodeA.radius + 3;
      const endDist = totalDist - nodeB.radius - 3;
      const corridorLength = endDist - startDist;
      if (corridorLength <= 10) continue;

      // Quét mật độ nét vẽ trong hành lang nối giữa 2 phòng
      const sampleSteps = Math.max(30, Math.min(60, Math.round(corridorLength / 2)));
      let strokeHits = 0;
      const corridorPoints: { x: number; y: number; projD: number; absW: number; t: number }[] = [];

      for (let s = 0; s < sampleSteps; s++) {
        const d = startDist + (corridorLength * s) / (sampleSteps - 1);
        const px = nodeA.centerX + d * ux;
        const py = nodeA.centerY + d * uy;

        let hitInStep = false;
        // Quét dải vuông góc từ -24px đến +24px quanh tâm đường nối
        for (let w = -24; w <= 24; w += 2) {
          const qx = Math.round(px + w * perpX);
          const qy = Math.round(py + w * perpY);
          if (qx >= 0 && qx < width && qy >= 0 && qy < height) {
            if (edgesOnlyMap[qy * width + qx] === 1) {
              hitInStep = true;
              const t = (d - startDist) / corridorLength; // 0.0 (sát A) -> 1.0 (sát B)
              corridorPoints.push({ x: qx, y: qy, projD: d, absW: Math.abs(w), t });
            }
          }
        }
        if (hitInStep) strokeHits++;
      }

      const coverageRatio = strokeHits / sampleSteps;

      // Nếu có nét vẽ liên tục trên ít nhất 28% hành lang
      if (coverageRatio >= 0.28 && corridorPoints.length >= 25) {
        // Phân tích đặc trưng hình thái chóp nhọn mũi tên (Arrowhead Detection):
        // Tại đầu có chóp nhọn, 2 cánh mũi tên xòe rộng sang 2 bên trục (absW lớn) và mật độ pixel tăng vọt
        const ptsNearA = corridorPoints.filter((p) => p.t <= 0.40);
        const ptsNearB = corridorPoints.filter((p) => p.t >= 0.60);

        const getRegionMetrics = (pts: typeof corridorPoints) => {
          if (pts.length === 0) return { p90Width: 0, count: 0 };
          const sortedW = pts.map((p) => p.absW).sort((a, b) => a - b);
          const p90 = sortedW[Math.floor(sortedW.length * 0.90)] || 0;
          return { p90Width: p90, count: pts.length };
        };

        const metricsA = getRegionMetrics(ptsNearA);
        const metricsB = getRegionMetrics(ptsNearB);

        // Chóp mũi tên tạo nên diện tích mở rộng và mật độ cao hơn rõ rệt
        const scoreArrowAtB = (metricsB.p90Width + 1) * Math.sqrt(metricsB.count + 1);
        const scoreArrowAtA = (metricsA.p90Width + 1) * Math.sqrt(metricsA.count + 1);

        let primaryFrom = nodeA;
        let primaryTo = nodeB;
        let isDirected = true;

        if (scoreArrowAtB > scoreArrowAtA * 1.25) {
          // Chóp nhọn cắm vào B -> Chiều tiến từ A sang B
          primaryFrom = nodeA;
          primaryTo = nodeB;
        } else if (scoreArrowAtA > scoreArrowAtB * 1.25) {
          // Chóp nhọn cắm vào A -> Chiều tiến từ B sang A
          primaryFrom = nodeB;
          primaryTo = nodeA;
        } else {
          // Độ rộng 2 đầu tương đồng -> Hành lang thông 2 chiều
          isDirected = false;
        }

        const primaryDir = computeEdgeDirection(primaryFrom, primaryTo, width, height);
        if (primaryDir) {
          finalEdges.push({
            id: `edge_${primaryFrom.id}_to_${primaryTo.id}`,
            fromNodeId: primaryFrom.id,
            toNodeId: primaryTo.id,
            direction: primaryDir.direction,
            compassDirection: primaryDir.compassDirection,
            isDirected,
            isReturn: false,
            doorX: primaryDir.doorX,
            doorY: primaryDir.doorY,
            distance: primaryDir.distance,
            label: `Lối sang ${primaryTo.name}`
          });
        }

        // Tạo liên kết đối ứng (Return Passage) để khách không bao giờ bị kẹt đường khi tham quan
        const returnDir = computeEdgeDirection(primaryTo, primaryFrom, width, height);
        if (returnDir) {
          finalEdges.push({
            id: `edge_${primaryTo.id}_to_${primaryFrom.id}`,
            fromNodeId: primaryTo.id,
            toNodeId: primaryFrom.id,
            direction: returnDir.direction,
            compassDirection: returnDir.compassDirection,
            isDirected,
            isReturn: true,
            doorX: returnDir.doorX,
            doorY: returnDir.doorY,
            distance: returnDir.distance,
            label: isDirected ? `Lối quay lại ${primaryFrom.name}` : `Lối sang ${primaryFrom.name}`
          });
        }
      }
    }
  }

  const executionTimeMs = Date.now() - startTime;
  console.log(`[PureCVEngine] Phân tích hoàn tất trong ${executionTimeMs}ms: ${finalNodes.length} nodes, ${finalEdges.length} edges.`);

  return {
    imageWidth: origWidth,
    imageHeight: origHeight,
    nodes: finalNodes,
    edges: finalEdges,
    executionTimeMs,
    algorithmName: 'Pure-CV-Radial-Topology-Engine-v1'
  };
}
