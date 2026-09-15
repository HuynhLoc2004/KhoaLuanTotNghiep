import { Router, Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";

export const artifactsRouter = Router();

// In-memory / Redis cache store for artifacts
let artifactsStore = [
  {
    id: "art-1",
    code: "HV-2026-001",
    name: "Trống Đồng Đông Sơn (Hoàng Thành)",
    era: "Thế kỷ V TCN",
    material: "Đồng Thau",
    category: "Bảo Vật Quốc Gia",
    room: "Gian Tiền Sử & Cổ Đại",
    model3dUrl: "/models/trong_dong.glb",
    status: "Active",
    description: "Hoa văn 14 cánh sao trung tâm, biểu tượng văn hóa lúa nước cư dân Đông Sơn.",
  },
  {
    id: "art-2",
    code: "HV-2026-002",
    name: "Tượng Thần Shiva Trà Kiệu",
    era: "Thế kỷ VIII",
    material: "Đá Sa Thạch",
    category: "Điêu Khắc Champa",
    room: "Gian Nghệ Thuật Champa",
    model3dUrl: "",
    status: "Active",
    description: "Tuyệt tác điêu khắc đá sa thạch Champa cổ đại.",
  },
];

// GET /api/v1/artifacts
artifactsRouter.get("/", (req: Request, res: Response) => {
  res.json({ success: true, count: artifactsStore.length, data: artifactsStore });
});

// POST /api/v1/artifacts
artifactsRouter.post("/", (req: Request, res: Response) => {
  const { name, code, era, material, category, room, description, model3dUrl } = req.body;
  
  if (!name) {
    res.status(400).json({ success: false, error: "Tên hiện vật là bắt buộc" });
    return;
  }

  const newArtifact = {
    id: `art_${uuidv4().slice(0, 8)}`,
    code: code || `HV-${Date.now().toString().slice(-6)}`,
    name,
    era: era || "Chưa xác định",
    material: material || "Đồng/Đá",
    category: category || "Hiện Vật Thường",
    room: room || "Gian Tiền Sử",
    model3dUrl: model3dUrl || "",
    status: "Active",
    description: description || "",
  };

  artifactsStore.unshift(newArtifact);
  res.status(201).json({ success: true, message: "Đã thêm hiện vật thành công!", data: newArtifact });
});

// DELETE /api/v1/artifacts/:id
artifactsRouter.delete("/:id", (req: Request, res: Response) => {
  const { id } = req.params;
  const initialLength = artifactsStore.length;
  artifactsStore = artifactsStore.filter((a) => a.id !== id);

  if (artifactsStore.length === initialLength) {
    res.status(404).json({ success: false, error: "Không tìm thấy hiện vật" });
    return;
  }

  res.json({ success: true, message: `Đã xóa hiện vật ${id}` });
});

// POST /api/v1/artifacts/generate-3d
artifactsRouter.post("/generate-3d", (req: Request, res: Response) => {
  const { artifactId, filesCount } = req.body;
  const jobId = `job_3dgs_${uuidv4().slice(0, 8)}`;
  
  res.json({
    success: true,
    message: "Đã tiếp nhận bộ ảnh/video & chuyển cho 3DGS Python Worker xử lý!",
    jobId,
    status: "PROCESSING",
    estimatedTimeSeconds: 15,
    cloudModelUrl: `https://storage.googleapis.com/museum-3dgs-bucket/models/${artifactId || "artifact"}_3dgs.ply`
  });
});

// GET /api/v1/artifacts/:id/qr
artifactsRouter.get("/:id/qr", (req: Request, res: Response) => {
  const { id } = req.params;
  const host = req.headers.host || "localhost:3001";
  const protocol = req.protocol || "http";
  const targetUrl = `${protocol}://${host}/#artifact?id=${encodeURIComponent(id)}`;

  res.json({
    success: true,
    artifactId: id,
    scanUrl: targetUrl,
    labelHeader: "BẢO TÀNG LỊCH SỬ TP. HỒ CHÍ MINH",
    instructions: "Quét mã QR để xem mô hình 3D 360° & Nghe giọng thuyết minh Voice AI"
  });
});
