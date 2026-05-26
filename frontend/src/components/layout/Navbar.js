import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useWeb3 } from '../../context/Web3Context';
import { getNetworkName } from '../../utils/web3Helper';
import { FaHorse, FaBars, FaTimes, FaWallet, FaChevronDown, FaList, FaPlus, FaHistory, FaUniversity, FaShieldAlt } from 'react-icons/fa';
import Notifications from '../ui/Notifications';
import { FaGavel } from 'react-icons/fa';
import { FaChartLine } from 'react-icons/fa';

const Navbar = () => {
  const { account, balance, chainId, connectWallet, disconnectWallet, formatAddress, isConnecting } = useWeb3();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-gray-900 border-b border-gray-800 sticky top-0 z-50 backdrop-blur-lg bg-opacity-90">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">

          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <motion.div whileHover={{ rotate: 15 }} transition={{ type: 'spring', stiffness: 300 }}>
              <FaHorse className="text-amber-400 text-2xl" />
            </motion.div>
            <span className="text-xl font-bold bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
              HorseChain
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-1">

            {/* Home */}
            <Link to="/" className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${isActive('/') ? 'bg-amber-400 text-gray-900' : 'text-gray-300 hover:text-white hover:bg-gray-800'}`}>
              Home
            </Link>

            {/* Marketplace */}
             <Link to="/marketplace" className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${isActive('/marketplace') ? 'bg-amber-400 text-gray-900' : 'text-gray-300 hover:text-white hover:bg-gray-800'}`}>
  Marketplace
</Link>

<Link to="/auctions" className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center space-x-1 ${isActive('/auctions') ? 'bg-amber-400 text-gray-900' : 'text-gray-300 hover:text-white hover:bg-gray-800'}`}>
  <FaGavel size={12} />
  <span>Auctions</span>
</Link>

<Link
  to="/dashboard"
  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center space-x-1 ${
    isActive('/dashboard')
      ? 'bg-amber-400 text-gray-900'
      : 'text-gray-300 hover:text-white hover:bg-gray-800'
  }`}
>
  <FaChartLine size={12} />
  <span>Analytics</span>
</Link>

            {/* My Horses Dropdown */}
            <div className="relative" onMouseEnter={() => setIsDropdownOpen(true)} onMouseLeave={() => setIsDropdownOpen(false)}>
              <button className={`flex items-center space-x-1 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${isActive('/my-horses') ? 'bg-amber-400 text-gray-900' : 'text-gray-300 hover:text-white hover:bg-gray-800'}`}>
                <span>My Horses</span>
                <motion.div animate={{ rotate: isDropdownOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                  <FaChevronDown size={12} />
                </motion.div>
              </button>

              <AnimatePresence>
                {isDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-full left-0 mt-1 w-52 bg-gray-800 border border-gray-700 rounded-xl shadow-xl overflow-hidden"
                  >
                    <Link
                      to="/my-horses"
                      className="flex items-center space-x-3 px-4 py-3 text-gray-300 hover:bg-gray-700 hover:text-amber-400 transition-all"
                    >
                      <FaList className="text-amber-400" />
                      <div>
                        <p className="text-sm font-medium">My Collection</p>
                        <p className="text-xs text-gray-500">View your horses</p>
                      </div>
                    </Link>

                    <div className="border-t border-gray-700"></div>

                    <Link
                      to="/list-horse"
                      className="flex items-center space-x-3 px-4 py-3 text-gray-300 hover:bg-gray-700 hover:text-amber-400 transition-all"
                    >
                      <FaPlus className="text-green-400" />
                      <div>
                        <p className="text-sm font-medium">List a Horse</p>
                        <p className="text-xs text-gray-500">Sell on marketplace</p>
                      </div>
                    </Link>

                    <div className="border-t border-gray-700"></div>

                    <Link
                      to="/transactions"
                      className="flex items-center space-x-3 px-4 py-3 text-gray-300 hover:bg-gray-700 hover:text-amber-400 transition-all"
                    >
                      <FaHistory className="text-blue-400" />
                      <div>
                        <p className="text-sm font-medium">Transaction History</p>
                        <p className="text-xs text-gray-500">Your past trades</p>
                      </div>
                    </Link>

                    <Link
  to="/transactions"
  className="flex items-center space-x-3 px-4 py-3 text-gray-300 hover:bg-gray-700 hover:text-amber-400 transition-all"
>
  <FaHistory className="text-blue-400" />
  <div>
    <p className="text-sm font-medium">Transaction History</p>
    <p className="text-xs text-gray-500">Your past trades</p>
  </div>
</Link>

{/* ← AJOUTE ICI */}
<div className="border-t border-gray-700"></div>
<Link
  to="/verify"
  className="flex items-center space-x-3 px-4 py-3 text-gray-300 hover:bg-gray-700 hover:text-amber-400 transition-all"
>
  <FaShieldAlt className="text-green-400" />
  <div>
    <p className="text-sm font-medium">Verify Document</p>
    <p className="text-xs text-gray-500">Check document authenticity</p>
  </div>
</Link>
                      
                      <div className="border-t border-gray-700"></div>
                     <Link
                          to="/orders"
             className="flex items-center space-x-3 px-4 py-3 text-gray-300 hover:bg-gray-700 hover:text-amber-400 transition-all"
>
               <FaUniversity className="text-amber-400" />
            <div>
                 <p className="text-sm font-medium">My Orders</p>
                  <p className="text-xs text-gray-500">Bank transfer orders</p>
                 </div>
                 </Link>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Wallet Section */}
          <div className="hidden md:flex items-center space-x-3">
            {account ? (
              <div className="flex items-center space-x-3">
                 <Notifications />
                <div className="flex items-center space-x-1 bg-green-900 bg-opacity-50 border border-green-700 rounded-full px-3 py-1">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-green-400 text-xs font-medium">{getNetworkName(chainId)}</span>
                </div>

                <div className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-1">
                  <span className="text-amber-400 text-sm font-medium">{parseFloat(balance).toFixed(3)} ETH</span>
                </div>

                <div className="relative group">
                  <button className="flex items-center space-x-2 bg-gray-800 border border-gray-700 hover:border-amber-400 rounded-lg px-3 py-2 transition-all duration-200">
                    <FaWallet className="text-amber-400 text-sm" />
                    <span className="text-white text-sm font-medium">{formatAddress(account)}</span>
                  </button>
                  <div className="absolute right-0 mt-2 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                    <button onClick={disconnectWallet} className="w-full text-left px-4 py-3 text-red-400 hover:bg-gray-700 rounded-lg text-sm transition-colors">
                      Disconnect Wallet
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={connectWallet}
                disabled={isConnecting}
                className="flex items-center space-x-2 bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-gray-900 font-bold px-5 py-2 rounded-lg transition-all duration-200 disabled:opacity-50"
              >
                <FaWallet />
                <span>{isConnecting ? 'Connecting...' : 'Connect Wallet'}</span>
              </motion.button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button className="md:hidden text-gray-300 hover:text-white" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-gray-900 border-t border-gray-800"
          >
            <div className="px-4 py-4 space-y-2">
              <Link to="/" onClick={() => setIsMenuOpen(false)} className={`block px-4 py-2 rounded-lg text-sm font-medium transition-all ${isActive('/') ? 'bg-amber-400 text-gray-900' : 'text-gray-300 hover:bg-gray-800'}`}>
                Home
              </Link>
              <Link to="/marketplace" onClick={() => setIsMenuOpen(false)} className={`block px-4 py-2 rounded-lg text-sm font-medium transition-all ${isActive('/marketplace') ? 'bg-amber-400 text-gray-900' : 'text-gray-300 hover:bg-gray-800'}`}>
                Marketplace
              </Link>
              <Link to="/my-horses" onClick={() => setIsMenuOpen(false)} className={`block px-4 py-2 rounded-lg text-sm font-medium transition-all ${isActive('/my-horses') ? 'bg-amber-400 text-gray-900' : 'text-gray-300 hover:bg-gray-800'}`}>
                My Collection
              </Link>
              <Link to="/list-horse" onClick={() => setIsMenuOpen(false)} className="block px-4 py-2 rounded-lg text-sm font-medium text-gray-300 hover:bg-gray-800 transition-all">
                List a Horse
              </Link>

              <div className="pt-2">
                {account ? (
                  <div className="space-y-2">
                    <div className="text-gray-400 text-sm px-4">
                      {formatAddress(account)} • {parseFloat(balance).toFixed(3)} ETH
                    </div>
                    <button onClick={disconnectWallet} className="w-full text-left px-4 py-2 text-red-400 hover:bg-gray-800 rounded-lg text-sm">
                      Disconnect Wallet
                    </button>
                  </div>
                ) : (
                  <button onClick={connectWallet} className="w-full bg-gradient-to-r from-amber-400 to-orange-500 text-gray-900 font-bold px-4 py-2 rounded-lg">
                    Connect Wallet
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;