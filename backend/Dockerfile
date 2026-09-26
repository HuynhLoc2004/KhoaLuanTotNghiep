# ==============================================================================
# STAGE 1: BUILD TYPESCRIPT (Chỉ dùng để compile code, không đem vào image cuối)
# ==============================================================================
FROM node:20-bookworm-slim AS ts-builder

WORKDIR /app/backend

COPY backend/package*.json ./
RUN npm install

COPY backend/tsconfig.json ./
COPY backend/src ./src
RUN npm run build

# ==============================================================================
# STAGE 2: PRODUCTION RUNNER (Image cuối cùng siêu nhẹ, đã loại bỏ devDependencies)
# ==============================================================================
FROM node:20-bookworm-slim

# Cài đặt Python 3, pip và các thư viện hệ thống cần thiết cho OpenCV
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    python3-pip \
    libgl1 \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Cài đặt thư viện Python (OpenCV Headless, NumPy, Pillow) không lưu cache
COPY stitching_worker/requirements.txt ./stitching_worker/
RUN python3 -m pip install --no-cache-dir --break-system-packages -r stitching_worker/requirements.txt

# Cài đặt CHỈ Production Node Dependencies (bỏ qua TypeScript, types, tsx...)
COPY backend/package*.json ./backend/
WORKDIR /app/backend
RUN npm install --omit=dev --no-audit --no-fund && npm cache clean --force

# Copy mã nguồn đã build (dist) từ stage 1
COPY --from=ts-builder /app/backend/dist ./dist
COPY stitching_worker /app/stitching_worker

# Tạo thư mục uploads tĩnh
RUN mkdir -p /app/backend/public/uploads

ENV PORT=3000
ENV NODE_ENV=production
ENV NODE_OPTIONS="--max-old-space-size=2048"
ENV PYTHON_PATH=python3
ENV STITCHER_SCRIPT=/app/stitching_worker/stitcher.py
ENV ARTIFACT_3D_SCRIPT=/app/stitching_worker/artifact_3d_generator.py

EXPOSE 3000

CMD ["node", "dist/server.js"]
