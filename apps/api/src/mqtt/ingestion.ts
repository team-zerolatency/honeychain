import mqtt, { type MqttClient } from "mqtt";
import { prisma } from "@repo/database";
import { SensorReadingSchema } from "@repo/types";
import { env } from "../env";

const payloadSchema = SensorReadingSchema.omit({ hiveId: true });
const TOPIC_PATTERN = /^honeychain\/hives\/([^/]+)\/sensors$/;

export async function handleSensorMessage(topic: string, payload: Buffer) {
  const match = topic.match(TOPIC_PATTERN);
  if (!match) {
    console.warn(`[mqtt] ignoring message on unrecognized topic: ${topic}`);
    return;
  }
  const hiveCode = match[1];

  let parsedJson: unknown;
  try {
    parsedJson = JSON.parse(payload.toString());
  } catch {
    console.error(`[mqtt] invalid JSON payload on topic ${topic}`);
    return;
  }

  const result = payloadSchema.safeParse(parsedJson);
  if (!result.success) {
    console.error(`[mqtt] payload failed validation for hive ${hiveCode}:`, result.error.flatten());
    return;
  }

  const hive = await prisma.hive.findUnique({ where: { hiveCode } });
  if (!hive) {
    console.warn(`[mqtt] no hive found for hiveCode "${hiveCode}" — dropping reading`);
    return;
  }

  await prisma.sensorReading.create({ data: { hiveId: hive.id, ...result.data } });
}

let client: MqttClient | null = null;

export function startMqttIngestion() {
  if (!env.MQTT_ENABLED) {
    console.log("[mqtt] ingestion disabled (MQTT_ENABLED=false)");
    return;
  }
  client = mqtt.connect(env.MQTT_BROKER_URL);
  client.on("connect", () => {
    console.log(`[mqtt] connected to ${env.MQTT_BROKER_URL}`);
    client!.subscribe("honeychain/hives/+/sensors");
  });
  client.on("message", (topic, payload) => {
    handleSensorMessage(topic, payload).catch((err) => console.error("[mqtt] handler error:", err));
  });
  client.on("error", (err) => console.error("[mqtt] connection error:", err));
}