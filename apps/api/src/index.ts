import { createApp } from "./app";
import { env } from "./env";

createApp().listen(env.PORT, () => {
  console.log(`Honey Chain API listening on port ${env.PORT}`);
});