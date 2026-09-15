import { Router, Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";

export const roomsRouter = Router();

let roomsStore = [
  {
    id: "room-1",
    name: "Gian Tiền Sử & Cổ Đại (Đông Sơn)",
    floor: "Tầng 1",
    splatFile: "/models/tours/tour_dongson/scene.splat",
    photoCount: 42,
    status: "Ready",
  },
  {
    id: "room-2",
    name: "Gian Nghệ Thuật Điêu Khắc Champa",
    floor: "Tầng 2",
    splatFile: "/models/tours/tour_champa/scene.splat",
    photoCount: 38,
    status: "Ready",
  },
];

// GET /api/v1/rooms
roomsRouter.get("/", (req: Request, res: Response) => {
  res.json({ success: true, count: roomsStore.length, data: roomsStore });
});

// POST /api/v1/rooms
roomsRouter.post("/", (req: Request, res: Response) => {
  const { name, floor, splatFile } = req.body;
  if (!name) {
    res.status(400).json({ success: false, error: "Tên gian sảnh 360° là bắt buộc" });
    return;
  }

  const newRoom = {
    id: `room_${uuidv4().slice(0, 8)}`,
    name,
    floor: floor || "Tầng 1",
    splatFile: splatFile || "/models/sample.splat",
    photoCount: 0,
    status: "Processing",
  };

  roomsStore.unshift(newRoom);
  res.status(201).json({ success: true, message: "Đã thêm gian sảnh 360° mới!", data: newRoom });
});

// DELETE /api/v1/rooms/:id
roomsRouter.delete("/:id", (req: Request, res: Response) => {
  const { id } = req.params;
  roomsStore = roomsStore.filter((r) => r.id !== id);
  res.json({ success: true, message: `Đã xóa gian sảnh ${id}` });
});
