import { network } from "hardhat";
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { keccak256, toBytes } from "viem";

const LifecycleState = {
  HARVESTED: 0,
  EXTRACTED: 1,
  PACKED: 2,
  DISPATCHED: 3,
  RECEIVED: 4,
  AVAILABLE_FOR_SALE: 5,
} as const;

function toId(input: string) {
  return keccak256(toBytes(input));
}

async function deployFixture() {
  const { viem } = await network.create();

  const publicClient = await viem.getPublicClient();
  const [admin, recorder, outsider] = await viem.getWalletClients();

  const registry = await viem.deployContract(
    "HoneyChainRegistry",
    [admin.account.address]
  );

  const recorderRole = await registry.read.RECORDER_ROLE();

  await registry.write.grantRole([
    recorderRole,
    recorder.account.address,
  ]);

  return {
    viem,
    publicClient,
    registry,
    admin,
    recorder,
    outsider,
    recorderRole,
  };
}