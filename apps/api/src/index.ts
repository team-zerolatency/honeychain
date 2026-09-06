import { createApp } from "./app";
import { env } from "./env";
import { startMqttIngestion } from "./mqtt/ingestion";

createApp().listen(env.PORT, () => {
  console.log(`Honey Chain API listening on port ${env.PORT}`);
});
startMqttIngestion();