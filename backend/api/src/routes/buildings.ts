import { Router, Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";

export const buildingsRouter = Router();

let buildingsStore = [
  {
    id: "bldg-1",
    name: "Tòa Nhà Trung Tâm (Chính Điện)",
    code: "B-MAIN",
    floors: [
      { id: "f1", name: "Tầng 1 - Tiền Sử & Triều Đại Cổ", svgUrl: "/maps/floor1.svg" },
      { id: "f2", name: "Tầng 2 - Champa & Khai Phá Nam Bộ", svgUrl: "/maps/floor2.svg" },
    ],
  },
  {
    id: "bldg-2",
    name: "Nhà Trưng Bày Chuyên Đề & Mỹ Thuật",
    code: "B-SUB",
    floors: [
      { id: "f3", name: "Tầng 1 - Trưng Bày Ngắn Hạn", svgUrl: "/maps/floor3.svg" },
    ],
  },
];

// GET /api/v1/buildings
buildingsRouter.get("/", (req: Request, res: Response) => {
  res.json({ success: true, count: buildingsStore.length, data: buildingsStore });
});

// POST /api/v1/buildings
buildingsRouter.post("/", (req: Request, res: Response) => {
  const { name, code } = req.body;
  if (!name) {
    res.status(400).json({ success: false, error: "Tên tòa nhà kiến trúc là bắt buộc" });
    return;
  }

  const newBuilding = {
    id: `bldg_${uuidv4().slice(0, 8)}`,
    name,
    code: code || `B-${Date.now().toString().slice(-4)}`,
    floors: [
      { id: `f_${Date.now()}`, name: "Tầng 1 - Mặt Bằng Tổng Thể", svgUrl: "/maps/default.svg" },
    ],
  };

  buildingsStore.unshift(newBuilding);
  res.status(201).json({ success: true, message: "Đã thêm tòa nhà mới!", data: newBuilding });
});

// DELETE /api/v1/buildings/:id
buildingsRouter.delete("/:id", (req: Request, res: Response) => {
  const { id } = req.params;
  buildingsStore = buildingsStore.filter((b) => b.id !== id);
  res.json({ success: true, message: `Đã xóa tòa nhà ${id}` });
});
