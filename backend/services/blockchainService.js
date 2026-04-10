const { ethers } = require('ethers');
const HorseMarketplaceABI = require('../config/abi/HorseMarketplace.json');
require('dotenv').config();

// ─── Setup Provider and Contract ─────────────────────────────
const getContract = () => {
  try {
    const provider = new ethers.JsonRpcProvider(
      process.env.BLOCKCHAIN_RPC_URL || 'http://127.0.0.1:8545'
    );

    const privateKey = process.env.PRIVATE_KEY;
    const wallet = new ethers.Wallet(privateKey, provider);

    const contract = new ethers.Contract(
      process.env.CONTRACT_ADDRESS,
      HorseMarketplaceABI.abi,
      wallet
    );

    return { contract, provider, wallet };
  } catch (error) {
    throw new Error(`Blockchain connection failed: ${error.message}`);
  }
};

// ─── List Horse on Blockchain ────────────────────────────────
const listHorseOnBlockchain = async (name, breed, age, price, ipfsHash) => {
  try {
    const { contract } = getContract();

    // Convert price from ETH to Wei
    const priceInWei = ethers.parseEther(price.toString());

    const tx = await contract.listHorse(name, breed, age, priceInWei, ipfsHash);
    console.log('⏳ Transaction sent:', tx.hash);

    const receipt = await tx.wait();
    console.log('✅ Transaction confirmed:', receipt.hash);

    // Get horse ID from event
    const event = receipt.logs.find(log => {
      try {
        const parsed = contract.interface.parseLog(log);
        return parsed.name === 'HorseListed';
      } catch {
        return false;
      }
    });

    let horseId = null;
    if (event) {
      const parsed = contract.interface.parseLog(event);
      horseId = parsed.args.id.toString();
    }

    return {
      success: true,
      transactionHash: receipt.hash,
      horseId,
    };
  } catch (error) {
    throw new Error(`Failed to list horse: ${error.message}`);
  }
};

// ─── Get Horse from Blockchain ────────────────────────────────
const getHorseFromBlockchain = async (horseId) => {
  try {
    const { contract } = getContract();
    const horse = await contract.horses(horseId);

    return {
      id: horse.id.toString(),
      name: horse.name,
      breed: horse.breed,
      age: horse.age.toString(),
      price: ethers.formatEther(horse.price),
      ipfsHash: horse.ipfsHash,
      owner: horse.owner,
      isForSale: horse.isForSale,
    };
  } catch (error) {
    throw new Error(`Failed to get horse: ${error.message}`);
  }
};

// ─── Get All Horses For Sale ──────────────────────────────────
const getHorsesForSaleFromBlockchain = async () => {
  try {
    const { contract } = getContract();
    const horses = await contract.getHorsesForSale();

    return horses.map(horse => ({
      id: horse.id.toString(),
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

// ─── Update Horse Price ───────────────────────────────────────
const updateHorsePriceOnBlockchain = async (horseId, newPrice) => {
  try {
    const { contract } = getContract();
    const priceInWei = ethers.parseEther(newPrice.toString());

    const tx = await contract.updatePrice(horseId, priceInWei);
    const receipt = await tx.wait();

    return {
      success: true,
      transactionHash: receipt.hash,
    };
  } catch (error) {
    throw new Error(`Failed to update price: ${error.message}`);
  }
};

module.exports = {
  listHorseOnBlockchain,
  getHorseFromBlockchain,
  getHorsesForSaleFromBlockchain,
  updateHorsePriceOnBlockchain,
};