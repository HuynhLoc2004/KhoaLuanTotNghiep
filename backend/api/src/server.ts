import express from "express";
import cors from "cors";
import path from "path";
import dotenv from "dotenv";
import { tourRouter } from "./routes/tour.js";
import { artifactsRouter } from "./routes/artifacts.js";
import { roomsRouter } from "./routes/rooms.js";
import { buildingsRouter } from "./routes/buildings.js";
import { adminRouter } from "./routes/admin.js";
import { authRouter } from "./routes/auth.js";
import { timelineRouter } from "./routes/timeline.js";
import { initRabbitMQ } from "./queue/rabbitmq.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({ origin: "*" }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static uploads (videos, high-res photos) and generated models (.splat, .ply)
const uploadsPath = path.resolve(process.cwd(), "uploads");
const modelsPath = path.resolve(process.cwd(), "models");
app.use("/uploads", express.static(uploadsPath));
app.use("/models", express.static(modelsPath));

// Health check
app.get("/health", (req, res) => {
  res.json({
    status: "UP",
    service: "Museum 3D Virtual Tour Backend API",
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/tour", tourRouter);
app.use("/api/v1/artifacts", artifactsRouter);
app.use("/api/v1/rooms", roomsRouter);
app.use("/api/v1/buildings", buildingsRouter);
app.use("/api/v1/admin", adminRouter);
app.use("/api/v1/timeline", timelineRouter);


// Start server
async function bootstrap() {
  try {
    // Attempt connecting to RabbitMQ in background (will retry gracefully if container is starting)
    initRabbitMQ().catch((err) => {
      console.warn("[RabbitMQ] Connecting in background or fallback mode:", err.message);
    });

    app.listen(PORT, () => {
      console.log(`====================================================`);
      console.log(`🏛️ Museum 3D Virtual Tour API Server`);
      console.log(`🚀 Listening on http://localhost:${PORT}`);
      console.log(`📁 Uploads served at: ${uploadsPath}`);
      console.log(`====================================================`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

bootstrap();
