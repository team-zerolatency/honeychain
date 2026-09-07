import mqtt from "mqtt";
import dotenv from "dotenv";
import { resolve } from "node:path";

dotenv.config({ path: resolve(process.cwd(), "../../.env") });

const [, , hiveCode = "HIVE-WB-01", intervalSecArg = "5"] = process.argv;
const intervalSec = Number(intervalSecArg);
const topic = `honeychain/hives/${hiveCode}/sensors`;
const simulateAnomalies = process.env.SIMULATE_ANOMALIES === "true";
const client = mqtt.connect(process.env.MQTT_BROKER_URL ?? "mqtt://127.0.0.1:1883");

function randomReading() {
  const isAnomaly = simulateAnomalies && Math.random() < 0.05;
  return {
    temperature: isAnomaly ? 45 + Math.random() * 5 : 33 + Math.random() * 3,
    humidity: 55 + Math.random() * 10,
    weight: 40 + Math.random() * 0.5,
    acousticScore: isAnomaly ? Math.random() * 0.1 : 0.4 + Math.random() * 0.2,
    timestamp: new Date().toISOString(),
  };
}

client.on("connect", () => {
  console.log(`Publishing simulated readings to "${topic}" every ${intervalSec}s. Ctrl+C to stop.`);
  setInterval(() => {
    const reading = randomReading();
    client.publish(topic, JSON.stringify(reading));
    console.log("published:", reading);
  }, intervalSec * 1000);
});