import { Router, Request, Response } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";
import { publishSplatJob } from "../queue/rabbitmq.js";
import { redis, setJobStatus, getJobStatus } from "../queue/redis.js";

export const tourRouter = Router();

// Configure multer storage for video and high-res photos
const uploadDir = path.resolve(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const subfolder = file.fieldname === "video" ? "videos" : "highres";
    const dir = path.join(uploadDir, subfolder);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueName = `${Date.now()}_${uuidv4().slice(0, 8)}${ext}`;
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 1024 * 1024 * 500 }, // Max 500MB
});

/**
 * POST /api/v1/tour/upload
 * Phía Admin: Nhận video quay phòng bảo tàng và các ảnh chụp cận cảnh độ nét cao (High-res)
 */
tourRouter.post(
  "/upload",
  upload.fields([
    { name: "video", maxCount: 1 },
    { name: "photos", maxCount: 50 },
  ]),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
      const videoFile = files?.["video"]?.[0];
      const photoFiles = files?.["photos"] || [];

      if (!videoFile) {
        res.status(400).json({ success: false, error: "Vui lòng tải lên video quay phòng trưng bày!" });
        return;
      }

      const tourId = req.body.tourId || `tour_${uuidv4().slice(0, 8)}`;
      const jobId = `job_${uuidv4()}`;
      const roomName = req.body.roomName || "Phòng Trưng Bày Lịch Sử";

      // Parse metadata của các ảnh chi tiết (nếu có gửi kèm theo JSON array)
      let photoMetadataList: any[] = [];
      if (req.body.photoMetadata) {
        try {
          photoMetadataList = JSON.parse(req.body.photoMetadata);
        } catch {
          photoMetadataList = [];
        }
      }

      const highResPhotos = photoFiles.map((file, idx) => {
        const meta = photoMetadataList[idx] || {};
        return {
          photoId: `photo_${idx + 1}`,
          originalName: file.originalname,
          filePath: path.resolve(file.path),
          fileUrl: `/uploads/highres/${file.filename}`,
          title: meta.title || `Hiện vật ${idx + 1}`,
          description: meta.description || "Ảnh chụp chi tiết độ nét cao",
          era: meta.era || "Cổ đại",
        };
      });

      const jobPayload = {
        jobId,
        tourId,
        roomName,
        videoFilePath: path.resolve(videoFile.path),
        videoUrl: `/uploads/videos/${videoFile.filename}`,
        highResPhotos,
        config: {
          targetFps: parseInt(req.body.targetFps || "2", 10),
          iterations: parseInt(req.body.iterations || "7000", 10),
          exportFormat: "both",
        },
        submittedAt: new Date().toISOString(),
      };

      // 1. Lưu trạng thái khởi tạo vào Redis
      await setJobStatus(jobId, "QUEUED", 0, {
        tourId,
        roomName,
        totalPhotos: highResPhotos.length,
        currentStep: "Chờ worker nhận tác vụ trong hàng đợi RabbitMQ",
      });

      // 2. Đẩy công việc vào RabbitMQ
      const published = await publishSplatJob(jobPayload);
      if (!published) {
        res.status(500).json({ success: false, error: "Không thể đẩy task vào hàng đợi RabbitMQ" });
        return;
      }

      console.log(`[TourAPI] Created 3DGS Job ${jobId} for tour ${tourId}`);

      res.status(202).json({
        success: true,
        message: "Video và ảnh đã được tiếp nhận. Tiến trình 3DGS đang bắt đầu!",
        data: {
          jobId,
          tourId,
          roomName,
          status: "QUEUED",
          photosCount: highResPhotos.length,
        },
      });
    } catch (err: any) {
      console.error("[TourAPI] Upload error:", err);
      res.status(500).json({ success: false, error: err.message });
    }
  }
);

/**
 * GET /api/v1/tour/status/:jobId
 * Kiểm tra tiến trình huấn luyện 3D Gaussian Splatting từ Redis
 */
tourRouter.get("/status/:jobId", async (req: Request, res: Response): Promise<void> => {
  try {
    const { jobId } = req.params;
    const statusInfo = await getJobStatus(jobId);

    if (!statusInfo) {
      res.status(404).json({ success: false, error: "Không tìm thấy thông tin Job này" });
      return;
    }

    res.json({
      success: true,
      data: statusInfo,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/v1/tour/:tourId
 * Lấy metadata hoàn chỉnh của Tour (URL file .splat, các Hotspot với tọa độ 3D và vector pháp tuyến)
 */
tourRouter.get("/:tourId", async (req: Request, res: Response): Promise<void> => {
  try {
    const { tourId } = req.params;
    const cacheKey = `tour:${tourId}:metadata`;
    const cachedData = await redis.get(cacheKey);

    if (cachedData) {
      res.json({ success: true, data: JSON.parse(cachedData) });
      return;
    }

    // Trả về mock metadata nếu tour chưa hoàn tất hoặc cho môi trường dev
    res.json({
      success: true,
      data: {
        tourId,
        roomName: "Gian Trưng Bày Văn Hóa Đông Sơn",
        splatUrl: `/models/tours/${tourId}/scene.splat`,
        plyUrl: `/models/tours/${tourId}/point_cloud.ply`,
        cameraPreset: {
          position: [0, 1.6, 2.5],
          target: [0, 1.2, 0],
          fov: 60,
        },
        hotspots: [
          {
            id: "hotspot_1",
            title: "Trống Đồng Đông Sơn - Mặt Trống Sao 14 Cánh",
            description: "Bảo vật quốc gia thời kỳ Văn hóa Đông Sơn, hoa văn hình chim Lạc bay ngược chiều kim đồng hồ.",
            era: "Thế kỷ V TCN",
            position: [0.0, 1.35, -2.4],
            normal: [0.0, 0.0, 1.0], // Pháp tuyến hướng ra ngoài bức tường
            highResPhotoUrl: "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=1200&q=80",
          },
          {
            id: "hotspot_2",
            title: "Tượng Thần Shiva Điêu Khắc Đá Sa Thạch",
            description: "Hiện vật văn hóa Champa thế kỷ VIII, được tìm thấy tại di tích Trà Kiệu.",
            era: "Thế kỷ VIII",
            position: [2.8, 1.4, -0.5],
            normal: [-1.0, 0.0, 0.0],
            highResPhotoUrl: "https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?auto=format&fit=crop&w=1200&q=80",
          },
          {
            id: "hotspot_3",
            title: "Bản Đồ Cổ & Văn Bia Triều Nguyễn",
            description: "Châu bản ghi lại hoạt động bảo tồn di sản tại Nam Bộ thời vua Tự Đức.",
            era: "Năm 1852",
            position: [-2.6, 1.5, 0.2],
            normal: [1.0, 0.0, 0.0],
            highResPhotoUrl: "https://images.unsplash.com/photo-1561214115-f2f134cc4912?auto=format&fit=crop&w=1200&q=80",
          },
        ],
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});
