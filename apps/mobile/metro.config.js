const { getDefaultConfig } = require("expo/metro-config");
const dotenv = require("dotenv");
const path = require("path");

const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, "../..");

dotenv.config({ path: path.join(monorepoRoot, ".env") });

const config = getDefaultConfig(projectRoot);

// Let Metro see workspace packages (packages/types) living outside apps/mobile
config.watchFolders = [monorepoRoot];
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, "node_modules"),
  path.resolve(monorepoRoot, "node_modules"),
];
// pnpm uses symlinks for workspace deps — Metro needs this explicitly enabled
config.resolver.unstable_enableSymlinks = true;
config.resolver.unstable_enablePackageExports = true;

module.exports = config;