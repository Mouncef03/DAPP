import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FaHorse, FaSearch, FaFilter } from 'react-icons/fa';
import { useHorse } from '../context/HorseContext';
import HorseCard from '../components/ui/HorseCard';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const Marketplace = () => {
  const { horses, fetchHorses, isLoading } = useHorse();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });

  useEffect(() => {
    fetchHorses();
  }, [fetchHorses]);

  // ─── Filter & Sort Logic ──────────────────────────────────
  const filteredHorses = horses
    .filter((horse) => {
      const matchesSearch =
        horse.name.toLowerCase().includes(search.toLowerCase()) ||
        horse.breed.toLowerCase().includes(search.toLowerCase());

      const matchesFilter =
        filter === 'all' ||
        (filter === 'forsale' && horse.isForSale) ||
        (filter === 'sold' && !horse.isForSale);

      const matchesPrice =
        (!priceRange.min || horse.price >= parseFloat(priceRange.min)) &&
        (!priceRange.max || horse.price <= parseFloat(priceRange.max));

      return matchesSearch && matchesFilter && matchesPrice;
    })
    .sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.createdAt) - new Date(a.createdAt);
      if (sortBy === 'oldest') return new Date(a.createdAt) - new Date(b.createdAt);
      if (sortBy === 'price-low') return a.price - b.price;
      if (sortBy === 'price-high') return b.price - a.price;
      return 0;
    });

  return (
    <div className="min-h-screen bg-gray-950 py-10 px-4">
      <div className="max-w-7xl mx-auto">

        {/* ─── Header ──────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <h1 className="text-4xl md:text-5xl font-black text-white mb-3">
            🐴{' '}
            <span className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
              Marketplace
            </span>
          </h1>
          <p className="text-gray-400 text-lg">
            Discover and buy horses from around the world — secured on the blockchain.
          </p>
        </motion.div>

        {/* ─── Filters Bar ─────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gray-900 border border-gray-800 rounded-2xl p-5 mb-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">

            {/* Search */}
            <div className="relative md:col-span-1">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                placeholder="Search horses..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 focus:border-amber-400 rounded-xl pl-10 pr-4 py-3 text-white placeholder-gray-500 outline-none transition-colors"
              />
            </div>

            {/* Status Filter */}
            <div className="relative">
              <FaFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 focus:border-amber-400 rounded-xl pl-10 pr-4 py-3 text-white outline-none transition-colors appearance-none cursor-pointer"
              >
                <option value="all">All Horses</option>
                <option value="forsale">For Sale</option>
                <option value="sold">Sold</option>
              </select>
            </div>

            {/* Sort */}
            <div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 focus:border-amber-400 rounded-xl px-4 py-3 text-white outline-none transition-colors appearance-none cursor-pointer"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>

            {/* Price Range */}
            <div className="flex space-x-2">
              <input
                type="number"
                placeholder="Min ETH"
                value={priceRange.min}
                onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
                className="w-1/2 bg-gray-800 border border-gray-700 focus:border-amber-400 rounded-xl px-3 py-3 text-white placeholder-gray-500 outline-none transition-colors"
              />
              <input
                type="number"
                placeholder="Max ETH"
                value={priceRange.max}
                onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
                className="w-1/2 bg-gray-800 border border-gray-700 focus:border-amber-400 rounded-xl px-3 py-3 text-white placeholder-gray-500 outline-none transition-colors"
              />
            </div>
          </div>
        </motion.div>

        {/* ─── Results Count ────────────────────────────────── */}
        <div className="flex justify-between items-center mb-6">
          <p className="text-gray-400 text-sm">
            Showing{' '}
            <span className="text-amber-400 font-bold">{filteredHorses.length}</span>{' '}
            horses
          </p>
          {(search || filter !== 'all' || priceRange.min || priceRange.max) && (
            <button
              onClick={() => {
                setSearch('');
                setFilter('all');
                setPriceRange({ min: '', max: '' });
              }}
              className="text-red-400 hover:text-red-300 text-sm transition-colors"
            >
              Clear Filters ✕
            </button>
          )}
        </div>

        {/* ─── Horse Grid ───────────────────────────────────── */}
        {isLoading ? (
          <LoadingSpinner message="Loading horses from blockchain..." />
        ) : filteredHorses.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-24"
          >
            <FaHorse className="text-gray-700 text-7xl mx-auto mb-6" />
            <p className="text-gray-500 text-xl font-medium mb-2">No horses found</p>
            <p className="text-gray-600 text-sm">Try adjusting your filters</p>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {filteredHorses.map((horse, index) => (
              <motion.div
                key={horse._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <HorseCard horse={horse} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Marketplace;