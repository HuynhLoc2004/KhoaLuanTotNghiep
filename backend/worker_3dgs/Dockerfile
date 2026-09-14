FROM python:3.11-slim

# Install ffmpeg for video frame extraction
RUN apt-get update && apt-get install -y --no-install-recommends \
    ffmpeg \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy requirements and install
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy worker and pipeline code
COPY pipeline.py worker.py ./

# Environment variables
ENV PYTHONUNBUFFERED=1
ENV RABBITMQ_URL=amqp://guest:guest@rabbitmq:5672/
ENV REDIS_URL=redis://redis:6379/0

CMD ["python", "worker.py"]
