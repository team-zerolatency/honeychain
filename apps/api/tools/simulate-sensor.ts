import mqtt from "mqtt";

const [, , hiveCode = "HIVE-001", intervalSecArg = "5"] = process.argv;
const intervalSec = Number(intervalSecArg);
const topic = `honeychain/hives/${hiveCode}/sensors`;
const client = mqtt.connect(process.env.MQTT_BROKER_URL ?? "mqtt://localhost:1883");

function randomReading() {
  const isAnomaly = Math.random() < 0.05; // ~5% simulated anomalies, useful later for Phase 17 too
  return {
    temperature: isAnomaly ? 45 + Math.random() * 5 : 33 + Math.random() * 3,
    humidity: 55 + Math.random() * 10,
    weight: 40 + Math.random() * 0.5,
    acousticScore: Math.random(),
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