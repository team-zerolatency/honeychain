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

describe("HoneyChainRegistry", async function () {
  const { viem, networkHelpers } = await network.create();

  async function deployFixture() {
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

    // Contract instance connected to recorder wallet
    const registryAsRecorder = await viem.getContractAt(
      "HoneyChainRegistry",
      registry.address,
      {
        client: { wallet: recorder },
      }
    );

    // Contract instance connected to outsider wallet
    const registryAsOutsider = await viem.getContractAt(
      "HoneyChainRegistry",
      registry.address,
      {
        client: { wallet: outsider },
      }
    );

    return {
      publicClient,
      registry,
      registryAsRecorder,
      registryAsOutsider,
      admin,
      recorder,
      outsider,
      recorderRole,
    };
  }

  // ==========================================================================
  // registerBatch
  // ==========================================================================

  describe("registerBatch", () => {
    it("registers a new batch", async () => {
      const {
        registry,
        registryAsRecorder,
        recorder,
      } = await networkHelpers.loadFixture(deployFixture);

      const batchId = toId("HC-2026-B001");

      await viem.assertions.emitWithArgs(
        registryAsRecorder.write.registerBatch([
          batchId,
          "HC-2026-B001",
        ]),
        registry,
        "BatchRegistered",
        [
          batchId,
          "HC-2026-B001",
          recorder.account.address,
        ]
      );

      const batch = await registry.read.batches([batchId]);

      // Batch struct:
      // [0] exists
      // [1] batchCode
      // [2] status
      assert.equal(batch[0], true);
      assert.equal(batch[2], LifecycleState.HARVESTED);
    });

    it("rejects a duplicate batch id", async () => {
      const { registryAsRecorder } =
        await networkHelpers.loadFixture(deployFixture);

      const batchId = toId("HC-2026-B001");

      await registryAsRecorder.write.registerBatch([
        batchId,
        "HC-2026-B001",
      ]);

      await viem.assertions.revertWith(
        registryAsRecorder.write.registerBatch([
          batchId,
          "HC-2026-B001",
        ]),
        "Batch already registered"
      );
    });

    it("rejects a caller without RECORDER_ROLE", async () => {
      const {
        registry,
        registryAsOutsider,
      } = await networkHelpers.loadFixture(deployFixture);

      const batchId = toId("HC-2026-B002");

      await viem.assertions.revertWithCustomError(
        registryAsOutsider.write.registerBatch([
          batchId,
          "HC-2026-B002",
        ]),
        registry,
        "AccessControlUnauthorizedAccount"
      );
    });
  });

  // ==========================================================================
  // registerBottle
  // ==========================================================================

  describe("registerBottle", () => {
    it("registers a bottle under an existing batch", async () => {
      const {
        registry,
        registryAsRecorder,
        recorder,
      } = await networkHelpers.loadFixture(deployFixture);

      const batchId = toId("HC-2026-B001");
      const bottleId = toId("HC-2026-B001-000001");

      await registryAsRecorder.write.registerBatch([
        batchId,
        "HC-2026-B001",
      ]);

      await viem.assertions.emitWithArgs(
        registryAsRecorder.write.registerBottle([
          bottleId,
          batchId,
          "HC-2026-B001-000001",
        ]),
        registry,
        "BottleRegistered",
        [
          bottleId,
          batchId,
          "HC-2026-B001-000001",
          recorder.account.address,
        ]
      );

      const bottle = await registry.read.bottles([bottleId]);

      // Bottle struct:
      // [0] exists
      // [1] bottleCode
      // [2] batchId
      // [3] status
      assert.equal(bottle[0], true);
      assert.equal(bottle[3], LifecycleState.PACKED);
    });

    it("rejects a bottle under a non-existent batch", async () => {
      const { registryAsRecorder } =
        await networkHelpers.loadFixture(deployFixture);

      const ghostBatchId = toId("HC-2026-GHOST");
      const bottleId = toId("HC-2026-GHOST-000001");

      await viem.assertions.revertWith(
        registryAsRecorder.write.registerBottle([
          bottleId,
          ghostBatchId,
          "GHOST",
        ]),
        "Batch does not exist"
      );
    });

    it("rejects a duplicate bottle id", async () => {
      const { registryAsRecorder } =
        await networkHelpers.loadFixture(deployFixture);

      const batchId = toId("HC-2026-B001");
      const bottleId = toId("HC-2026-B001-000001");

      await registryAsRecorder.write.registerBatch([
        batchId,
        "HC-2026-B001",
      ]);

      await registryAsRecorder.write.registerBottle([
        bottleId,
        batchId,
        "HC-2026-B001-000001",
      ]);

      await viem.assertions.revertWith(
        registryAsRecorder.write.registerBottle([
          bottleId,
          batchId,
          "HC-2026-B001-000001",
        ]),
        "Bottle already registered"
      );
    });
  });

  // ==========================================================================
  // recordEvent
  // ==========================================================================

  describe("recordEvent", () => {
    it("updates batch status and appends to product history", async () => {
      const {
        registry,
        registryAsRecorder,
      } = await networkHelpers.loadFixture(deployFixture);

      const batchId = toId("HC-2026-B001");

      await registryAsRecorder.write.registerBatch([
        batchId,
        "HC-2026-B001",
      ]);

      await viem.assertions.emit(
        registryAsRecorder.write.recordEvent([
          batchId,
          false,
          LifecycleState.EXTRACTED,
        ]),
        registry,
        "LifecycleEventRecorded"
      );

      const batch = await registry.read.batches([batchId]);

      assert.equal(batch[2], LifecycleState.EXTRACTED);

      const history =
        await registry.read.getProductHistory([batchId]);

      assert.equal(history.length, 1);

      // LifecycleEvent struct:
      // [0] entityId
      // [1] isBottle
      // [2] eventType
      // [3] actor
      // [4] timestamp
      assert.equal(
        history[0].eventType,
        LifecycleState.EXTRACTED
      );
    });

    it("updates bottle status independently of its parent batch", async () => {
      const {
        registry,
        registryAsRecorder,
      } = await networkHelpers.loadFixture(deployFixture);

      const batchId = toId("HC-2026-B001");
      const bottleId = toId("HC-2026-B001-000001");

      await registryAsRecorder.write.registerBatch([
        batchId,
        "HC-2026-B001",
      ]);

      await registryAsRecorder.write.registerBottle([
        bottleId,
        batchId,
        "HC-2026-B001-000001",
      ]);

      await registryAsRecorder.write.recordEvent([
        bottleId,
        true,
        LifecycleState.DISPATCHED,
      ]);

      const bottle = await registry.read.bottles([bottleId]);
      const batch = await registry.read.batches([batchId]);

      assert.equal(
        bottle[3],
        LifecycleState.DISPATCHED
      );

      assert.equal(
        batch[2],
        LifecycleState.HARVESTED
      );
    });

    it("rejects an event for a non-existent entity", async () => {
      const { registryAsRecorder } =
        await networkHelpers.loadFixture(deployFixture);

      await viem.assertions.revertWith(
        registryAsRecorder.write.recordEvent([
          toId("ghost"),
          false,
          LifecycleState.EXTRACTED,
        ]),
        "Batch does not exist"
      );
    });

    it("rejects a caller without RECORDER_ROLE", async () => {
      const {
        registry,
        registryAsRecorder,
        registryAsOutsider,
      } = await networkHelpers.loadFixture(deployFixture);

      const batchId = toId("HC-2026-B001");

      await registryAsRecorder.write.registerBatch([
        batchId,
        "HC-2026-B001",
      ]);

      await viem.assertions.revertWithCustomError(
        registryAsOutsider.write.recordEvent([
          batchId,
          false,
          LifecycleState.EXTRACTED,
        ]),
        registry,
        "AccessControlUnauthorizedAccount"
      );
    });
  });

  // ==========================================================================
  // recordCertificate
  // ==========================================================================

  describe("recordCertificate", () => {
    it("attaches a certificate to an existing batch", async () => {
      const {
        registry,
        registryAsRecorder,
        recorder,
      } = await networkHelpers.loadFixture(deployFixture);

      const batchId = toId("HC-2026-B001");

      await registryAsRecorder.write.registerBatch([
        batchId,
        "HC-2026-B001",
      ]);

      const metadataHash = keccak256(
        toBytes("lab-report-content")
      );

      await viem.assertions.emitWithArgs(
        registryAsRecorder.write.recordCertificate([
          batchId,
          "LAB-REF-001",
          metadataHash,
          "Test Lab",
        ]),
        registry,
        "CertificateRecorded",
        [
          batchId,
          "LAB-REF-001",
          metadataHash,
          recorder.account.address,
        ]
      );

      const certs =
        await registry.read.getCertificates([batchId]);

      assert.equal(certs.length, 1);

      // Certificate struct:
      // [0] batchId
      // [1] certificateRef
      // [2] metadataHash
      // [3] issuer
      // [4] timestamp
      assert.equal(certs[0].issuer, "Test Lab");
    });

    it("rejects a certificate for a non-existent batch", async () => {
      const { registryAsRecorder } =
        await networkHelpers.loadFixture(deployFixture);

      const metadataHash = keccak256(
        toBytes("x")
      );

      await viem.assertions.revertWith(
        registryAsRecorder.write.recordCertificate([
          toId("ghost"),
          "REF",
          metadataHash,
          "Lab",
        ]),
        "Batch does not exist"
      );
    });

    it("rejects a caller without RECORDER_ROLE", async () => {
      const {
        registry,
        registryAsOutsider,
      } = await networkHelpers.loadFixture(deployFixture);

      const batchId = toId("HC-2026-B001");

      await viem.assertions.revertWithCustomError(
        registryAsOutsider.write.recordCertificate([
          batchId,
          "REF",
          keccak256(toBytes("x")),
          "Lab",
        ]),
        registry,
        "AccessControlUnauthorizedAccount"
      );
    });
  });

  // ==========================================================================
  // Access Control Administration
  // ==========================================================================

  describe("access control administration", () => {
    it("lets admin grant RECORDER_ROLE to a new address", async () => {
      const {
        registry,
        outsider,
        recorderRole,
      } = await networkHelpers.loadFixture(deployFixture);

      await registry.write.grantRole([
        recorderRole,
        outsider.account.address,
      ]);

      const hasRole = await registry.read.hasRole([
        recorderRole,
        outsider.account.address,
      ]);

      assert.equal(hasRole, true);
    });

    it("rejects a non-admin trying to grant roles", async () => {
      const {
        registry,
        registryAsRecorder,
        outsider,
        recorderRole,
      } = await networkHelpers.loadFixture(deployFixture);

      await viem.assertions.revertWithCustomError(
        registryAsRecorder.write.grantRole([
          recorderRole,
          outsider.account.address,
        ]),
        registry,
        "AccessControlUnauthorizedAccount"
      );
    });
  });
});