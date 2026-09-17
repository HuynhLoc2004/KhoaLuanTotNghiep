FROM node:20-bookworm-slim

# Cài đặt Python 3, pip và các thư viện cần thiết cho OpenCV
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    python3-pip \
    python3-venv \
    libgl1 \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Cài đặt thư viện Python (OpenCV Headless, NumPy, Pillow)
COPY stitching_worker/requirements.txt ./stitching_worker/
RUN python3 -m pip install --no-cache-dir --break-system-packages -r stitching_worker/requirements.txt

# Cài đặt Node dependencies
COPY backend/package*.json ./backend/
WORKDIR /app/backend
RUN npm install

# Copy mã nguồn backend & stitching worker
COPY backend/tsconfig.json ./
COPY backend/src ./src
COPY stitching_worker /app/stitching_worker

# Build TypeScript sang dist
RUN npm run build

# Tạo thư mục uploads tĩnh
RUN mkdir -p /app/backend/public/uploads

ENV PORT=3000
ENV NODE_ENV=production
ENV PYTHON_PATH=python3
ENV STITCHER_SCRIPT=/app/stitching_worker/stitcher.py

EXPOSE 3000

CMD ["node", "dist/server.js"]
