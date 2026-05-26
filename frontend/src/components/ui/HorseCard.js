import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaHorse, FaEthereum, FaUser } from 'react-icons/fa';
import { MdVerified } from 'react-icons/md';
import { formatAddress } from '../../utils/web3Helper';

const HorseCard = ({ horse }) => {
  const {
    _id,
    name,
    breed,
    age,
    price,
    imageUrl,
    owner,
    isForSale,
    tokenId,
  } = horse;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -8 }}
      transition={{ duration: 0.3 }}
      className="bg-gray-900 border border-gray-800 hover:border-amber-400 rounded-2xl overflow-hidden group transition-all duration-300 shadow-lg hover:shadow-amber-400/20"
    >
      {/* Image */}
      <div className="relative h-56 bg-gray-800 overflow-hidden">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <FaHorse className="text-gray-600 text-6xl" />
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col space-y-2">
          {isForSale && (
            <span className="bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full">
              For Sale
            </span>
          )}
          {tokenId && (
            <span className="bg-purple-600 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center space-x-1">
              <MdVerified size={12} />
              <span>NFT #{tokenId}</span>
            </span>
          )}
        </div>

        {/* Price Overlay */}
        <div className="absolute bottom-3 right-3">
          <div className="bg-gray-900 bg-opacity-90 backdrop-blur-sm border border-amber-400 rounded-xl px-3 py-1.5 flex items-center space-x-1">
            <FaEthereum className="text-amber-400" />
            <span className="text-amber-400 font-bold text-sm">{price} ETH</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        {/* Name & Breed */}
        <div className="mb-3">
          <h3 className="text-white font-bold text-lg group-hover:text-amber-400 transition-colors">
            {name}
          </h3>
          <p className="text-gray-400 text-sm">{breed}</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-gray-800 rounded-lg p-2 text-center">
            <p className="text-gray-500 text-xs">Age</p>
            <p className="text-white font-semibold text-sm">{age} years</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-2 text-center">
            <p className="text-gray-500 text-xs">Status</p>
            <p className={`font-semibold text-sm ${isForSale ? 'text-green-400' : 'text-red-400'}`}>
              {isForSale ? 'Available' : 'Sold'}
            </p>
          </div>
        </div>

        {/* Owner */}
        <div className="flex items-center space-x-2 mb-4 bg-gray-800 rounded-lg p-2">
          <FaUser className="text-gray-500 text-xs" />
          <span className="text-gray-400 text-xs">Owner:</span>
          <span className="text-amber-400 text-xs font-mono">{formatAddress(owner)}</span>
        </div>

        {/* Button */}
        <Link to={`/horse/${_id}`}>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`w-full py-2.5 rounded-xl font-bold text-sm transition-all duration-200 ${
              isForSale
                ? 'bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-gray-900'
                : 'bg-gray-800 text-gray-500 cursor-not-allowed'
            }`}
          >
            {isForSale ? '🐴 View & Buy' : 'Not For Sale'}
          </motion.button>
        </Link>
      </div>
    </motion.div>
  );
};

export default HorseCard;