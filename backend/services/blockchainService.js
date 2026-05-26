const { ethers } = require('ethers');
const HorseNFTABI = require('../config/abi/HorseMarketplace.json');
require('dotenv').config();

const getContract = () => {
  try {
    const provider = new ethers.JsonRpcProvider(
      process.env.BLOCKCHAIN_RPC_URL || 'http://127.0.0.1:8545'
    );
    const privateKey = process.env.PRIVATE_KEY;
    const wallet = new ethers.Wallet(privateKey, provider);
    const contract = new ethers.Contract(
      process.env.CONTRACT_ADDRESS,
      HorseNFTABI.abi,
      wallet
    );
    return { contract, provider, wallet };
  } catch (error) {
    throw new Error(`Blockchain connection failed: ${error.message}`);
  }
};

// ─── Mint Horse NFT ───────────────────────────────────────
const mintHorseNFT = async (name, breed, age, price, ipfsHash, metadataUrl) => {
  try {
    const { contract } = getContract();
    const priceInWei = ethers.parseEther(price.toString());

    const tx = await contract.mintHorse(
      name,
      breed,
      age,
      priceInWei,
      ipfsHash,
      metadataUrl
    );

    console.log('⏳ Minting NFT transaction sent:', tx.hash);
    const receipt = await tx.wait();
    console.log('✅ NFT Minted! Transaction:', receipt.hash);

    // Get tokenId from HorseMinted event
    let tokenId = null;
    for (const log of receipt.logs) {
      try {
        const parsed = contract.interface.parseLog(log);
        if (parsed.name === 'HorseMinted') {
          tokenId = parsed.args.tokenId.toString();
          break;
        }
      } catch { continue; }
    }

    return {
      success: true,
      transactionHash: receipt.hash,
      tokenId,
    };
  } catch (error) {
    throw new Error(`Failed to mint NFT: ${error.message}`);
  }
};

// ─── Get Horse from Blockchain ────────────────────────────
const getHorseFromBlockchain = async (tokenId) => {
  try {
    const { contract } = getContract();
    const horse = await contract.horses(tokenId);
    const tokenURI = await contract.tokenURI(tokenId);

    return {
      tokenId: horse.tokenId.toString(),
      name: horse.name,
      breed: horse.breed,
      age: horse.age.toString(),
      price: ethers.formatEther(horse.price),
      ipfsHash: horse.ipfsHash,
      owner: horse.owner,
      isForSale: horse.isForSale,
      tokenURI,
    };
  } catch (error) {
    throw new Error(`Failed to get horse: ${error.message}`);
  }
};

// ─── Get All Horses For Sale ──────────────────────────────
const getHorsesForSaleFromBlockchain = async () => {
  try {
    const { contract } = getContract();
    const horses = await contract.getHorsesForSale();

    return horses.map(horse => ({
      tokenId: horse.tokenId.toString(),
      name: horse.name,
      breed: horse.breed,
      age: horse.age.toString(),
      price: ethers.formatEther(horse.price),
      ipfsHash: horse.ipfsHash,
      owner: horse.owner,
      isForSale: horse.isForSale,
    }));
  } catch (error) {
    throw new Error(`Failed to get horses: ${error.message}`);
  }
};

// ─── Update Horse Price ───────────────────────────────────
const updateHorsePriceOnBlockchain = async (tokenId, newPrice) => {
  try {
    const { contract } = getContract();
    const priceInWei = ethers.parseEther(newPrice.toString());
    const tx = await contract.updatePrice(tokenId, priceInWei);
    const receipt = await tx.wait();
    return { success: true, transactionHash: receipt.hash };
  } catch (error) {
    throw new Error(`Failed to update price: ${error.message}`);
  }
};

module.exports = {
  mintHorseNFT,
  getHorseFromBlockchain,
  getHorsesForSaleFromBlockchain,
  updateHorsePriceOnBlockchain,
};