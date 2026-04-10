const hre = require("hardhat");

async function main() {
  console.log("🚀 Deploying HorseMarketplace contract...");

  // Get the deployer account
  const [deployer] = await hre.ethers.getSigners();
  console.log("📝 Deploying with account:", deployer.address);

  // Get deployer balance
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("💰 Account balance:", hre.ethers.formatEther(balance), "ETH");

  // Deploy the contract
  const HorseMarketplace = await hre.ethers.getContractFactory("HorseMarketplace");
  const horseMarketplace = await HorseMarketplace.deploy();

  // Wait for deployment
  await horseMarketplace.waitForDeployment();

  const contractAddress = await horseMarketplace.getAddress();

  console.log("✅ HorseMarketplace deployed to:", contractAddress);
  console.log("🔗 Network:", hre.network.name);

  // Save contract address to a file
  const fs = require("fs");
  const contractInfo = {
    address: contractAddress,
    network: hre.network.name,
    deployer: deployer.address,
    deployedAt: new Date().toISOString(),
  };

  fs.writeFileSync(
    "deployed-contract.json",
    JSON.stringify(contractInfo, null, 2)
  );

  console.log("📄 Contract info saved to deployed-contract.json");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });