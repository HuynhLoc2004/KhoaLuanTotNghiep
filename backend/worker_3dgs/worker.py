"""
RabbitMQ Consumer Worker for 3D Gaussian Splatting Pipeline
-----------------------------------------------------------
Listens on queue 'splat.jobs.queue', updates Redis job status,
executes the 3DGS pipeline, and publishes results.
"""

import os
import json
import time
import pika
import redis
from pipeline import run_3dgs_pipeline

RABBITMQ_URL = os.getenv("RABBITMQ_URL", "amqp://guest:guest@localhost:5672/")
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")
QUEUE_NAME = "splat.jobs.queue"

# Connect to Redis
try:
    r_client = redis.from_url(REDIS_URL, decode_responses=True)
    r_client.ping()
    print("[Redis] Worker connected successfully to Redis.")
except Exception as e:
    print(f"[Redis] Warning: Failed to connect to Redis: {e}")
    r_client = None

def update_job_status(job_id: str, status: str, progress: int, message: str = ""):
    """Update job progress and status in Redis for client polling."""
    print(f"[{job_id}] [{progress}%] {status}: {message}")
    if not r_client:
        return
    try:
        r_client.hset(f"job:{job_id}", mapping={
            "status": status,
            "progress": str(progress),
            "currentStep": message,
            "updatedAt": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
        })
    except Exception as e:
        print(f"[Redis] Error updating job status: {e}")

def process_job_callback(ch, method, properties, body):
    """Callback triggered when a new 3DGS job arrives in RabbitMQ."""
    job_data = {}
    try:
        job_data = json.loads(body.decode("utf-8"))
        job_id = job_data.get("jobId", "unknown")
        tour_id = job_data.get("tourId", "unknown")
        print(f"\n=======================================================")
        print(f"[Worker] Received 3DGS Job: {job_id} for Tour: {tour_id}")
        print(f"=======================================================")

        def progress_tracker(status, progress, message):
            update_job_status(job_id, status, progress, message)

        # Run the full pipeline
        metadata = run_3dgs_pipeline(job_data, progress_callback=progress_tracker)

        # Cache tour metadata in Redis for instant client retrieval
        if r_client:
            r_client.set(f"tour:{tour_id}:metadata", json.dumps(metadata, ensure_ascii=False))

        # Acknowledge message to RabbitMQ
        ch.basic_ack(delivery_tag=method.delivery_tag)
        print(f"[Worker] Job {job_id} finished and ACKed successfully!\n")

    except Exception as e:
        print(f"[Worker Error] Failed processing job: {e}")
        job_id = job_data.get("jobId", "unknown")
        update_job_status(job_id, "FAILED", 0, str(e))
        # Requeue or reject message
        ch.basic_nack(delivery_tag=method.delivery_tag, requeue=False)

def start_worker():
    """Start RabbitMQ worker loop with auto-reconnection."""
    print("[Worker] Starting 3DGS RabbitMQ Consumer...")
    while True:
        try:
            parameters = pika.URLParameters(RABBITMQ_URL)
            connection = pika.BlockingConnection(parameters)
            channel = connection.channel()

            # Ensure queue exists with matching arguments
            channel.queue_declare(
                queue=QUEUE_NAME,
                durable=True,
                arguments={
                    "x-dead-letter-exchange": "museum.splat.exchange",
                    "x-dead-letter-routing-key": "splat.job.dlq",
                }
            )
            channel.basic_qos(prefetch_count=1) # Only process 1 heavy 3DGS job at a time per GPU/worker
            channel.basic_consume(queue=QUEUE_NAME, on_message_callback=process_job_callback)

            print(f"[Worker] 🚀 Waiting for jobs on '{QUEUE_NAME}'. To exit press CTRL+C")
            channel.start_consuming()
        except pika.exceptions.AMQPConnectionError as e:
            print(f"[Worker] RabbitMQ connection failed: {e}. Retrying in 5 seconds...")
            time.sleep(5)
        except KeyboardInterrupt:
            print("\n[Worker] Stopping worker gracefully.")
            break
        except Exception as e:
            print(f"[Worker Exception] {e}. Retrying in 5 seconds...")
            time.sleep(5)

if __name__ == "__main__":
    start_worker()
