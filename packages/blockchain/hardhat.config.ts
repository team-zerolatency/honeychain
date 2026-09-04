import { defineConfig } from "hardhat/config";
import hardhatToolboxViem from "@nomicfoundation/hardhat-toolbox-viem";

export default defineConfig({
  plugins: [hardhatToolboxViem],

  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },

  networks: {
    hardhat: {
      type: "edr-simulated",
      chainType: "l1",
    },

    localhost: {
      type: "http",
      chainType: "generic",
      url: "http://127.0.0.1:8545",
    },

    besu: {
      type: "http",
      chainType: "generic",
      url: process.env.BESU_RPC_URL ?? "http://127.0.0.1:8545",
      accounts: process.env.BESU_PRIVATE_KEY
        ? [process.env.BESU_PRIVATE_KEY]
        : [],
    },
  },
});