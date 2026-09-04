import { network } from "hardhat";

async function main() {
  const { viem } = await network.create();

  const publicClient = await viem.getPublicClient();
  const [deployer] = await viem.getWalletClients();

  console.log(
    "Deploying HoneyChainRegistry with admin:",
    deployer.account.address
  );

  const { contract: registry, deploymentTransaction } =
    await viem.sendDeploymentTransaction("HoneyChainRegistry", [
      deployer.account.address,
    ]);

  console.log("HoneyChainRegistry deployed to:", registry.address);

  const receipt = await publicClient.waitForTransactionReceipt({
    hash: deploymentTransaction.hash,
  });

  console.log("Deployment transaction:", receipt.transactionHash);
}

main().catch((error) => {
  console.error("Deployment failed:", error);
  process.exitCode = 1;
});