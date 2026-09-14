import amqplib from "amqplib";

const RABBITMQ_URL = process.env.RABBITMQ_URL || "amqp://guest:guest@localhost:5672";
export const SPLAT_EXCHANGE = "museum.splat.exchange";
export const SPLAT_JOBS_QUEUE = "splat.jobs.queue";
export const SPLAT_RESULTS_QUEUE = "splat.results.queue";
export const SPLAT_ROUTING_KEY = "splat.job.create";

let connection: any = null;
let channel: amqplib.Channel | null = null;

export async function initRabbitMQ(): Promise<amqplib.Channel> {
  if (channel) return channel;

  try {
    connection = await amqplib.connect(RABBITMQ_URL);
    const ch = await connection.createChannel();
    channel = ch;

    // Declare Exchange
    await ch.assertExchange(SPLAT_EXCHANGE, "direct", { durable: true });

    // Declare main processing queue
    await ch.assertQueue(SPLAT_JOBS_QUEUE, {
      durable: true,
      arguments: {
        "x-dead-letter-exchange": SPLAT_EXCHANGE,
        "x-dead-letter-routing-key": "splat.job.dlq",
      },
    });

    // Declare results queue
    await ch.assertQueue(SPLAT_RESULTS_QUEUE, { durable: true });

    // Bind queue to exchange
    await ch.bindQueue(SPLAT_JOBS_QUEUE, SPLAT_EXCHANGE, SPLAT_ROUTING_KEY);

    console.log("[RabbitMQ] Connected and queues initialized successfully");
    return ch;
  } catch (error: any) {
    console.error("[RabbitMQ] Initialization error:", error.message);
    throw error;
  }
}

export async function publishSplatJob(payload: any): Promise<boolean> {
  if (!channel) {
    await initRabbitMQ();
  }
  if (!channel) return false;

  const messageBuffer = Buffer.from(JSON.stringify(payload));
  return channel.publish(SPLAT_EXCHANGE, SPLAT_ROUTING_KEY, messageBuffer, {
    persistent: true,
    contentType: "application/json",
  });
}
