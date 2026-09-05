import {
  createPublicClient,
  createWalletClient,
  http,
  keccak256,
  toBytes,
  getContract,
  type Hash,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { hardhat } from "viem/chains";
import registryAbi from "@repo/blockchain/abi/HoneyChainRegistry.json";
import { env } from "../env";

// Deterministic — anyone can independently recompute this from the Postgres UUID
// and query the chain directly, no extra mapping table needed.
export function entityIdToBytes32(id: string): `0x${string}` {
  return keccak256(toBytes(id));
}

export const OnChainLifecycleState = {
  HARVESTED: 0,
  EXTRACTED: 1,
  PACKED: 2,
  DISPATCHED: 3,
  RECEIVED: 4,
  AVAILABLE_FOR_SALE: 5,
} as const;
type OnChainLifecycleKey = keyof typeof OnChainLifecycleState;

export interface BlockchainAdapter {
  registerBatch(batchId: string, batchCode: string): Promise<Hash | null>;
  registerBottle(bottleId: string, batchId: string, bottleCode: string): Promise<Hash | null>;
  recordEvent(entityId: string, isBottle: boolean, eventType: OnChainLifecycleKey): Promise<Hash | null>;
}

/** Used whenever BLOCKCHAIN_ENABLED=false — every existing Phase 3–6 test relies on this being a total no-op. */
class NoopBlockchainAdapter implements BlockchainAdapter {
  async registerBatch(): Promise<null> {
    return null;
  }
  async registerBottle(): Promise<null> {
    return null;
  }
  async recordEvent(): Promise<null> {
    return null;
  }
}

class ViemBlockchainAdapter implements BlockchainAdapter {
  private contract;

  constructor() {
    const account = privateKeyToAccount(env.BLOCKCHAIN_PRIVATE_KEY as `0x${string}`);
    const transport = http(env.BLOCKCHAIN_RPC_URL);

    const publicClient = createPublicClient({ chain: hardhat, transport });
    const walletClient = createWalletClient({ account, chain: hardhat, transport });

    this.contract = getContract({
      address: env.BLOCKCHAIN_CONTRACT_ADDRESS as `0x${string}`,
      abi: registryAbi,
      client: { public: publicClient, wallet: walletClient },
    });
  }

  async registerBatch(batchId: string, batchCode: string): Promise<Hash | null> {
    try {
      return await this.contract.write.registerBatch!([entityIdToBytes32(batchId), batchCode]);
    } catch (err) {
      console.error("[blockchain] registerBatch failed:", err);
      return null;
    }
  }

  async registerBottle(bottleId: string, batchId: string, bottleCode: string): Promise<Hash | null> {
    try {
      return await this.contract.write.registerBottle!([
        entityIdToBytes32(bottleId),
        entityIdToBytes32(batchId),
        bottleCode,
      ]);
    } catch (err) {
      console.error("[blockchain] registerBottle failed:", err);
      return null;
    }
  }

  async recordEvent(entityId: string, isBottle: boolean, eventType: OnChainLifecycleKey): Promise<Hash | null> {
    try {
      return await this.contract.write.recordEvent!([
        entityIdToBytes32(entityId),
        isBottle,
        OnChainLifecycleState[eventType],
      ]);
    } catch (err) {
      console.error("[blockchain] recordEvent failed:", err);
      return null;
    }
  }
}

export const blockchainAdapter: BlockchainAdapter = env.BLOCKCHAIN_ENABLED
  ? new ViemBlockchainAdapter()
  : new NoopBlockchainAdapter();