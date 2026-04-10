import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaHorse, FaPlus, FaWallet } from 'react-icons/fa';
import { useWeb3 } from '../context/Web3Context';
import { useHorse } from '../context/HorseContext';
import { FaTrash } from 'react-icons/fa';
import api from '../utils/api';
import toast from 'react-hot-toast';
import HorseCard from '../components/ui/HorseCard';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const MyHorses = () => {
  const { account, formatAddress, balance } = useWeb3();
  const { myHorses, fetchMyHorses, isLoading } = useHorse();

  useEffect(() => {
    if (account) {
      fetchMyHorses(account);
    }
  }, [account, fetchMyHorses]);
  useEffect(() => {
  const handleFocus = () => {
    if (account) fetchMyHorses(account);
  };
  window.addEventListener('focus', handleFocus);
  return () => window.removeEventListener('focus', handleFocus);
}, [account, fetchMyHorses]);

  // ─── Not Connected ────────────────────────────────────────
  if (!account) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gray-900 border border-gray-800 rounded-2xl p-10 text-center max-w-md"
        >
          <FaWallet className="text-amber-400 text-6xl mx-auto mb-6" />
          <h2 className="text-white text-2xl font-black mb-3">
            Connect Your Wallet
          </h2>
          <p className="text-gray-400 mb-6">
            Connect your MetaMask wallet to view your horses.
          </p>
        </motion.div>
      </div>
    );
  }

  const handleDelete = async (horseId) => {
  if (!window.confirm('Are you sure you want to delete this horse?')) return;
  try {
    await api.delete(`/horses/${horseId}`, {
      data: { owner: account }
    });
    toast.success('Horse deleted successfully!');
    fetchMyHorses(account);
  } catch (error) {
    toast.error('Failed to delete horse');
  }
};

  return (
    <div className="min-h-screen bg-gray-950 py-10 px-4">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <h1 className="text-4xl font-black text-white mb-3">
            My{' '}
            <span className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
              Horses
            </span>
          </h1>
          <p className="text-gray-400">Manage your horse listings on the blockchain.</p>
        </motion.div>

        {/* Wallet Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-8"
        >
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center space-x-4">
              <div className="bg-amber-400/10 border border-amber-400/30 rounded-full p-3">
                <FaWallet className="text-amber-400 text-xl" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Connected Wallet</p>
                <p className="text-white font-mono font-bold">{formatAddress(account)}</p>
              </div>
            </div>
            <div className="flex items-center space-x-6">
              <div className="text-center">
                <p className="text-gray-400 text-sm">Balance</p>
                <p className="text-amber-400 font-bold">
                  {parseFloat(balance).toFixed(4)} ETH
                </p>
              </div>
              <div className="text-center">
                <p className="text-gray-400 text-sm">Total Horses</p>
                <p className="text-amber-400 font-bold">{myHorses.length}</p>
              </div>
              <Link to="/list-horse">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-gradient-to-r from-amber-400 to-orange-500 text-gray-900 font-bold px-5 py-2.5 rounded-xl flex items-center space-x-2"
                >
                  <FaPlus />
                  <span>List New Horse</span>
                </motion.button>
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Horses Grid */}
        {isLoading ? (
          <LoadingSpinner message="Loading your horses..." />
        ) : myHorses.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-24"
          >
            <FaHorse className="text-gray-700 text-7xl mx-auto mb-6" />
            <p className="text-gray-500 text-xl font-medium mb-2">
              You have no horses listed yet
            </p>
            <p className="text-gray-600 text-sm mb-6">
              Start by listing your first horse on the marketplace!
            </p>
            <Link to="/list-horse">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gradient-to-r from-amber-400 to-orange-500 text-gray-900 font-bold px-8 py-3 rounded-xl flex items-center space-x-2 mx-auto"
              >
                <FaPlus />
                <span>List Your First Horse</span>
              </motion.button>
            </Link>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {myHorses.map((horse, index) => (
              <motion.div
                key={horse._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <div className="relative">
  <HorseCard horse={horse} />
  <button
    onClick={() => handleDelete(horse._id)}
    className="absolute top-3 right-3 bg-red-600 hover:bg-red-700 text-white p-2 rounded-lg transition-all z-10 shadow-lg"
  >
    <FaTrash size={12} />
  </button>
</div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default MyHorses;