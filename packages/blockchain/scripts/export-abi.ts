import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const artifactPath = path.resolve(
  __dirname,
  "../artifacts/contracts/HoneyChainRegistry.sol/HoneyChainRegistry.json"
);
const outDir = path.resolve(__dirname, "../abi");
const outPath = path.join(outDir, "HoneyChainRegistry.json");

const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf-8"));
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(outPath, JSON.stringify(artifact.abi, null, 2));
console.log(`ABI exported to ${outPath}`);