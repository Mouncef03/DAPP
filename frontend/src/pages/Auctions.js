import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaHorse, FaGavel, FaClock, FaEthereum, FaFire } from 'react-icons/fa';
import { useWeb3 } from '../context/Web3Context';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import api from '../utils/api';
import toast from 'react-hot-toast';

const Auctions = () => {
  const { account } = useWeb3();
  const [auctions, setAuctions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState({});

  useEffect(() => {
    fetchAuctions();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      const times = {};
      auctions.forEach(auction => {
        times[auction._id] = getTimeLeft(auction.endTime);
      });
      setTimeLeft(times);
    }, 1000);
    return () => clearInterval(timer);
  }, [auctions]);

  const fetchAuctions = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/auctions');
      setAuctions(response.data.data);
    } catch (error) {
      console.error('Failed to fetch auctions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getTimeLeft = (endTime) => {
    const now = new Date().getTime();
    const end = new Date(endTime).getTime();
    const diff = end - now;

    if (diff <= 0) return { hours: 0, minutes: 0, seconds: 0, expired: true };

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    return { hours, minutes, seconds, expired: false };
  };
  return (
    <div className="min-h-screen bg-gray-950 py-10 px-4">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <div className="flex items-center space-x-3 mb-3">
            <FaGavel className="text-amber-400 text-4xl" />
            <h1 className="text-4xl font-black text-white">
              Live{' '}
              <span className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
                Auctions
              </span>
            </h1>
          </div>
          <p className="text-gray-400">Bid on horses in real-time — highest bidder wins!</p>
        </motion.div>

        {/* Stats */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Active Auctions', value: auctions.length, color: 'text-amber-400', icon: <FaGavel /> },
            { label: 'Total Bids', value: auctions.reduce((acc, a) => acc + a.bids.length, 0), color: 'text-blue-400', icon: <FaFire /> },
            { label: 'Highest Bid', value: `${Math.max(0, ...auctions.map(a => a.highestBid))} ETH`, color: 'text-green-400', icon: <FaEthereum /> },
          ].map((stat, i) => (
            <div key={i} className="bg-gray-900 border border-gray-800 rounded-2xl p-5 text-center">
              <div className={`text-2xl mb-1 flex justify-center ${stat.color}`}>{stat.icon}</div>
              <p className={`text-3xl font-black ${stat.color}`}>{stat.value}</p>
              <p className="text-gray-400 text-sm">{stat.label}</p>
            </div>
          ))}
        </motion.div>

        {/* Auctions Grid */}
        {isLoading ? (
          <LoadingSpinner message="Loading auctions..." />
        ) : auctions.length === 0 ? (
          <div className="text-center py-20">
            <FaGavel className="text-gray-700 text-7xl mx-auto mb-4" />
            <p className="text-gray-500 text-xl mb-2">No active auctions</p>
            <p className="text-gray-600 text-sm">Be the first to start an auction!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {auctions.map((auction, index) => {
              const time = timeLeft[auction._id] || getTimeLeft(auction.endTime);
              const isExpired = time.expired;
              return (
                <motion.div key={auction._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }} whileHover={{ y: -5 }} className="bg-gray-900 border border-gray-800 hover:border-amber-400 rounded-2xl overflow-hidden transition-all duration-300">
                  {/* Image */}
                  <div className="relative h-48 bg-gray-800">
                    {auction.horseImage ? (
                      <img src={auction.horseImage} alt={auction.horseName} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <FaHorse className="text-gray-600 text-5xl" />
                      </div>
                    )}
                    {/* Timer Badge */}
                    <div className={`absolute top-3 right-3 px-3 py-1.5 rounded-xl text-xs font-black flex items-center space-x-1 ${isExpired ? 'bg-red-600 text-white' : 'bg-gray-900 bg-opacity-90 text-amber-400 border border-amber-400'}`}>
                      <FaClock size={10} />
                      {isExpired ? (
                        <span>Expired</span>
                      ) : (
                        <span>{String(time.hours).padStart(2, '0')}:{String(time.minutes).padStart(2, '0')}:{String(time.seconds).padStart(2, '0')}</span>
                      )}
                    </div>
                    {/* Live Badge */}
                    {!isExpired && (
                      <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-black px-2 py-1 rounded-full flex items-center space-x-1">
                        <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
                        <span>LIVE</span>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <h3 className="text-white font-black text-xl mb-1">{auction.horseName}</h3>
                    <p className="text-gray-500 text-sm mb-4">{auction.bids.length} bids placed</p>

                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="bg-gray-800 rounded-xl p-3 text-center">
                        <p className="text-gray-500 text-xs mb-1">Starting Price</p>
                        <div className="flex items-center justify-center space-x-1">
                          <FaEthereum className="text-gray-400 text-sm" />
                          <span className="text-white font-bold">{auction.startingPrice} ETH</span>
                        </div>
                      </div>
                      <div className="bg-gray-800 rounded-xl p-3 text-center">
                        <p className="text-gray-500 text-xs mb-1">Highest Bid</p>
                        <div className="flex items-center justify-center space-x-1">
                          <FaEthereum className="text-amber-400 text-sm" />
                          <span className="text-amber-400 font-black">{auction.highestBid > 0 ? `${auction.highestBid} ETH` : 'No bids'}</span>
                        </div>
                      </div>
                    </div>

                    <Link to={`/auction/${auction._id}`}>
                      <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className={`w-full py-3 rounded-xl font-black text-sm transition-all ${isExpired ? 'bg-gray-800 text-gray-500 cursor-not-allowed' : 'bg-gradient-to-r from-amber-400 to-orange-500 text-gray-900'}`} disabled={isExpired}>
                        {isExpired ? 'Auction Ended' : '🔨 Place Bid'}
                      </motion.button>
                    </Link>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Auctions;