import { createApp } from "./app";
import { env } from "./env";
import { startMqttIngestion } from "./mqtt/ingestion";

createApp().listen(env.PORT, "0.0.0.0", () => {
  console.log(`Honey Chain API listening on 0.0.0.0:${env.PORT}`);
});
startMqttIngestion();