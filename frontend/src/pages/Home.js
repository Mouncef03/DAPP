import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaHorse, FaShieldAlt, FaExchangeAlt, FaLock } from 'react-icons/fa';
import { SiEthereum, SiIpfs } from 'react-icons/si';
import { useHorse } from '../context/HorseContext';
import { useWeb3 } from '../context/Web3Context';
import HorseCard from '../components/ui/HorseCard';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const Home = () => {
  const { horses, fetchHorses, isLoading } = useHorse();
  const { connectWallet, account } = useWeb3();

  useEffect(() => {
    fetchHorses();
  }, [fetchHorses]);

  const features = [
    {
      icon: <FaShieldAlt className="text-amber-400 text-3xl" />,
      title: 'Secure Transactions',
      description: 'All transactions are secured by Ethereum smart contracts. No middlemen, no fraud.',
    },
    {
      icon: <SiIpfs className="text-blue-400 text-3xl" />,
      title: 'IPFS Storage',
      description: 'Horse data and images are stored permanently on IPFS — decentralized and censorship-resistant.',
    },
    {
      icon: <FaExchangeAlt className="text-green-400 text-3xl" />,
      title: 'Instant Transfer',
      description: 'Ownership transfers instantly on the blockchain when a purchase is made.',
    },
    {
      icon: <FaLock className="text-purple-400 text-3xl" />,
      title: 'Full Ownership',
      description: 'Your horses are truly yours. Stored on-chain with your wallet as proof of ownership.',
    },
  ];

  const stats = [
    { label: 'Horses Listed', value: horses.length || '0' },
    { label: 'Blockchain', value: 'Ethereum' },
    { label: 'Storage', value: 'IPFS' },
    { label: 'Fee', value: '2.5%' },
  ];

  return (
    <div className="min-h-screen">

      {/* ─── Hero Section ─────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gray-950 py-24 px-4">
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-amber-400/5 via-transparent to-orange-500/5"></div>
        <div className="absolute top-20 left-10 w-72 h-72 bg-amber-400/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl"></div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="flex justify-center mb-6"
            >
              <div className="bg-amber-400/10 border border-amber-400/30 rounded-full px-4 py-2 flex items-center space-x-2">
                <SiEthereum className="text-amber-400" />
                <span className="text-amber-400 text-sm font-medium">
                  Powered by Ethereum Blockchain
                </span>
              </div>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-5xl md:text-7xl font-black text-white mb-6 leading-tight"
            >
              The Future of{' '}
              <span className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
                Horse Trading
              </span>{' '}
              is Here
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-gray-400 text-xl mb-10 max-w-2xl mx-auto"
            >
              Buy and sell horses securely on the blockchain. Decentralized, transparent, and trustless — powered by Ethereum and IPFS.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Link to="/marketplace">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-gray-900 font-black px-8 py-4 rounded-xl text-lg transition-all duration-200 flex items-center space-x-2"
                >
                  <FaHorse />
                  <span>Browse Marketplace</span>
                </motion.button>
              </Link>

              {!account && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={connectWallet}
                  className="bg-gray-800 hover:bg-gray-700 border border-gray-700 hover:border-amber-400 text-white font-bold px-8 py-4 rounded-xl text-lg transition-all duration-200"
                >
                  Connect Wallet
                </motion.button>
              )}

              {account && (
                <Link to="/list-horse">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-gray-800 hover:bg-gray-700 border border-gray-700 hover:border-amber-400 text-white font-bold px-8 py-4 rounded-xl text-lg transition-all duration-200"
                  >
                    List Your Horse
                  </motion.button>
                </Link>
              )}
            </motion.div>
          </div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16"
          >
            {stats.map((stat, index) => (
              <div
                key={index}
                className="bg-gray-900 border border-gray-800 rounded-2xl p-6 text-center"
              >
                <p className="text-3xl font-black text-amber-400 mb-1">{stat.value}</p>
                <p className="text-gray-400 text-sm">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ─── Features Section ──────────────────────────────── */}
      <section className="py-20 px-4 bg-gray-950">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-black text-white mb-4">
              Why Choose{' '}
              <span className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
                HorseChain?
              </span>
            </h2>
            <p className="text-gray-400 max-w-xl mx-auto">
              Built on cutting-edge blockchain technology to give you the most secure and transparent horse trading experience.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className="bg-gray-900 border border-gray-800 hover:border-amber-400/50 rounded-2xl p-6 transition-all duration-300"
              >
                <div className="mb-4">{feature.icon}</div>
                <h3 className="text-white font-bold text-lg mb-2">{feature.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Latest Listings ───────────────────────────────── */}
      <section className="py-20 px-4 bg-gray-950">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-black text-white mb-2">
                Latest{' '}
                <span className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
                  Listings
                </span>
              </h2>
              <p className="text-gray-400">Recently listed horses on the marketplace</p>
            </div>
            <Link to="/marketplace">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gray-800 hover:bg-gray-700 border border-gray-700 text-white px-5 py-2 rounded-xl text-sm font-medium transition-all"
              >
                View All →
              </motion.button>
            </Link>
          </div>

          {isLoading ? (
            <LoadingSpinner message="Loading horses..." />
          ) : horses.length === 0 ? (
            <div className="text-center py-20">
              <FaHorse className="text-gray-700 text-6xl mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No horses listed yet.</p>
              <Link to="/list-horse">
                <button className="mt-4 bg-amber-400 text-gray-900 font-bold px-6 py-2 rounded-xl">
                  Be the first to list!
                </button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {horses.slice(0, 4).map((horse) => (
                <HorseCard key={horse._id} horse={horse} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ─── CTA Section ───────────────────────────────────── */}
      <section className="py-20 px-4 bg-gradient-to-r from-amber-400/10 to-orange-500/10 border-t border-gray-800">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <FaHorse className="text-amber-400 text-5xl mx-auto mb-6" />
            <h2 className="text-3xl md:text-4xl font-black text-white mb-4">
              Ready to List Your Horse?
            </h2>
            <p className="text-gray-400 mb-8">
              Join the decentralized horse marketplace and reach buyers worldwide.
            </p>
            <Link to="/list-horse">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gradient-to-r from-amber-400 to-orange-500 text-gray-900 font-black px-10 py-4 rounded-xl text-lg"
              >
                List Your Horse Now 🐴
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Home;