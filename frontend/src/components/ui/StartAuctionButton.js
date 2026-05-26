import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaGavel, FaSpinner } from 'react-icons/fa';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const StartAuctionButton = ({ horseId, tokenId, account, contract, onSuccess }) => {
  const [showForm, setShowForm] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [form, setForm] = useState({ startingPrice: '', durationInHours: '24' });

 const handleStart = async () => {
  if (!form.startingPrice || parseFloat(form.startingPrice) <= 0) {
    toast.error('Enter a valid starting price!');
    return;
  }
  try {
    setIsStarting(true);
    const { ethers } = await import('ethers');
    const priceInWei = ethers.parseEther(form.startingPrice.toString());

    // 1. Start auction on blockchain via MetaMask
    toast.loading('Starting auction on blockchain...', { id: 'auction' });
    const tx = await contract.startAuction(
      parseInt(tokenId),
      priceInWei,
      parseInt(form.durationInHours)
    );
    const receipt = await tx.wait();
    toast.loading('Saving auction...', { id: 'auction' });

    // 2. Save to MongoDB only (blockchain already done)
    await api.post('/auctions/save', {
      horseId,
      startingPrice: parseFloat(form.startingPrice),
      durationInHours: parseInt(form.durationInHours),
      seller: account,
      transactionHash: receipt.hash,
    });

    toast.success('🔨 Auction started successfully!', { id: 'auction' });
    onSuccess();
  } catch (error) {
    toast.error('Failed to start auction: ' + error.message, { id: 'auction' });
  } finally {
    setIsStarting(false);
  }
};

  return (
    <div>
      {!showForm ? (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowForm(true)}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white font-black py-4 rounded-xl text-lg flex items-center justify-center space-x-3 transition-all"
        >
          <FaGavel />
          <span>Start Auction</span>
        </motion.button>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800 border border-purple-400/30 rounded-2xl p-5 space-y-4"
        >
          <h3 className="text-white font-bold">Configure Auction</h3>
          <div>
            <label className="text-gray-400 text-sm mb-2 block">Starting Price (ETH)</label>
            <input
              type="number"
              value={form.startingPrice}
              onChange={(e) => setForm({ ...form, startingPrice: e.target.value })}
              placeholder="e.g. 0.5"
              step="0.001"
              min="0"
              className="w-full bg-gray-700 border border-gray-600 focus:border-purple-400 rounded-xl px-4 py-3 text-white placeholder-gray-500 outline-none transition-colors"
            />
          </div>
          <div>
            <label className="text-gray-400 text-sm mb-2 block">Duration</label>
            <select
              value={form.durationInHours}
              onChange={(e) => setForm({ ...form, durationInHours: e.target.value })}
              className="w-full bg-gray-700 border border-gray-600 focus:border-purple-400 rounded-xl px-4 py-3 text-white outline-none"
            >
              <option value="1">1 Hour</option>
              <option value="6">6 Hours</option>
              <option value="12">12 Hours</option>
              <option value="24">24 Hours</option>
              <option value="48">48 Hours</option>
              <option value="72">72 Hours</option>
            </select>
          </div>
          <div className="flex space-x-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleStart}
              disabled={isStarting}
              className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-xl flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {isStarting ? (
                <span className="flex items-center space-x-2"><FaSpinner className="animate-spin" /><span>Starting...</span></span>
              ) : (
                <span className="flex items-center space-x-2"><FaGavel /><span>Start Auction</span></span>
              )}
            </motion.button>
            <button
              onClick={() => setShowForm(false)}
              className="px-5 py-3 bg-gray-700 text-gray-300 rounded-xl hover:bg-gray-600 transition-all"
            >
              Cancel
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default StartAuctionButton;