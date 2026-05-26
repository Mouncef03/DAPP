const hre = require("hardhat");
const fs = require("fs");

async function main() {
  console.log("🚀 Deploying HorseNFT contract...");

  const [deployer] = await hre.ethers.getSigners();
  console.log("📝 Deploying with account:", deployer.address);

  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("💰 Account balance:", hre.ethers.formatEther(balance), "ETH");

  // Deploy HorseNFT
  const HorseNFT = await hre.ethers.getContractFactory("HorseNFT");
  const horseNFT = await HorseNFT.deploy();
  await horseNFT.waitForDeployment();

  const contractAddress = await horseNFT.getAddress();
  console.log("✅ HorseNFT deployed to:", contractAddress);
  console.log("🔗 Network:", hre.network.name);
  console.log("🐴 NFT Name: HorseChain");
  console.log("🎫 NFT Symbol: HORSE");

  // Save contract info
  const contractInfo = {
    address: contractAddress,
    network: hre.network.name,
    deployer: deployer.address,
    deployedAt: new Date().toISOString(),
    contractName: "HorseNFT",
    nftName: "HorseChain",
    nftSymbol: "HORSE",
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