import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, Legend
} from 'recharts';
import {
  FaHorse, FaEthereum, FaChartLine, FaGavel,
  FaExchangeAlt, FaUniversity, FaTrophy, FaClock
} from 'react-icons/fa';
import { useWeb3 } from '../context/Web3Context';
import { formatAddress } from '../utils/web3Helper';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import api from '../utils/api';

const Dashboard = () => {
  const { account } = useWeb3();
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/analytics/dashboard');
      setStats(response.data.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const StatCard = ({ icon, title, value, subtitle, color, delay }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-gray-900 border border-gray-800 rounded-2xl p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`bg-${color}-400/10 border border-${color}-400/30 rounded-xl p-3`}>
          <div className={`text-${color}-400 text-xl`}>{icon}</div>
        </div>
      </div>
      <p className={`text-3xl font-black text-${color}-400 mb-1`}>{value}</p>
      <p className="text-white font-medium text-sm">{title}</p>
      {subtitle && <p className="text-gray-500 text-xs mt-1">{subtitle}</p>}
    </motion.div>
  );

  if (isLoading) return <LoadingSpinner message="Loading analytics..." />;
  if (!stats) return null;
  return (
    <div className="min-h-screen bg-gray-950 py-10 px-4">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-black text-white mb-2">
                📊{' '}
                <span className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
                  Analytics Dashboard
                </span>
              </h1>
              <p className="text-gray-400">Real-time marketplace statistics and insights</p>
            </div>
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={fetchStats} className="bg-gray-800 border border-gray-700 hover:border-amber-400 text-white px-4 py-2 rounded-xl text-sm transition-all">
              🔄 Refresh
            </motion.button>
          </div>
        </motion.div>

        {/* Overview Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard icon={<FaHorse />} title="Total Horses" value={stats.overview.totalHorses} subtitle={`${stats.overview.horsesForSale} for sale`} color="amber" delay={0.1} />
          <StatCard icon={<FaEthereum />} title="ETH Volume" value={`${stats.overview.ethVolume} ETH`} subtitle="Total traded" color="blue" delay={0.2} />
          <StatCard icon={<FaExchangeAlt />} title="Transactions" value={stats.overview.totalTransactions} subtitle="All time" color="green" delay={0.3} />
          <StatCard icon={<FaGavel />} title="Auctions" value={stats.overview.totalAuctions} subtitle={`${stats.overview.activeAuctions} active`} color="purple" delay={0.4} />
        </div>

        {/* Second Row Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard icon={<FaHorse />} title="Horses Sold" value={stats.overview.horsesSold} subtitle="Completed sales" color="orange" delay={0.1} />
          <StatCard icon={<FaUniversity />} title="MAD Volume" value={`${stats.overview.madVolume} MAD`} subtitle="Bank transfers" color="green" delay={0.2} />
          <StatCard icon={<FaGavel />} title="Ended Auctions" value={stats.overview.endedAuctions} subtitle="Completed" color="red" delay={0.3} />
          <StatCard icon={<FaChartLine />} title="For Sale" value={stats.overview.horsesForSale} subtitle="Available now" color="amber" delay={0.4} />
        </div>

        {/* Tabs */}
        <div className="flex space-x-2 mb-8">
          {[
            { value: 'overview', label: '📈 Sales Chart' },
            { value: 'payments', label: '💳 Payment Methods' },
            { value: 'leaderboard', label: '🏆 Leaderboard' },
            { value: 'activity', label: '⚡ Recent Activity' },
          ].map((tab) => (
            <button key={tab.value} onClick={() => setActiveTab(tab.value)} className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === tab.value ? 'bg-amber-400 text-gray-900' : 'bg-gray-800 text-gray-400 hover:text-white'}`}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Sales Chart */}
        {activeTab === 'overview' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
              <h3 className="text-white font-black text-xl mb-6">Sales Volume (Last 7 Days)</h3>
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={stats.salesByDay}>
                  <defs>
                    <linearGradient id="volumeGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="date" stroke="#6b7280" tick={{ fill: '#9ca3af', fontSize: 12 }} />
                  <YAxis stroke="#6b7280" tick={{ fill: '#9ca3af', fontSize: 12 }} />
                  <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '12px', color: '#fff' }} />
                  <Area type="monotone" dataKey="volume" stroke="#f59e0b" fill="url(#volumeGradient)" strokeWidth={2} name="Volume (ETH)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
              <h3 className="text-white font-black text-xl mb-6">Daily Sales Count</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={stats.salesByDay}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="date" stroke="#6b7280" tick={{ fill: '#9ca3af', fontSize: 12 }} />
                  <YAxis stroke="#6b7280" tick={{ fill: '#9ca3af', fontSize: 12 }} />
                  <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '12px', color: '#fff' }} />
                  <Bar dataKey="sales" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Sales" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        )}

        {/* Payment Methods */}
        {activeTab === 'payments' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
              <h3 className="text-white font-black text-xl mb-6">Payment Methods Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={stats.paymentMethods} cx="50%" cy="50%" outerRadius={100} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                    {stats.paymentMethods.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '12px', color: '#fff' }} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
              <h3 className="text-white font-black text-xl mb-6">Payment Summary</h3>
              <div className="space-y-4">
                {stats.paymentMethods.map((method, i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-gray-800 rounded-xl">
                    <div className="flex items-center space-x-3">
                      <div className="w-4 h-4 rounded-full" style={{ backgroundColor: method.color }}></div>
                      <span className="text-white font-medium">{method.name}</span>
                    </div>
                    <span className="text-amber-400 font-black text-xl">{method.value}</span>
                  </div>
                ))}
                <div className="flex items-center justify-between p-4 bg-amber-400/10 border border-amber-400/30 rounded-xl">
                  <span className="text-white font-bold">Total Transactions</span>
                  <span className="text-amber-400 font-black text-xl">{stats.overview.totalTransactions}</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Leaderboard */}
        {activeTab === 'leaderboard' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
              <h3 className="text-white font-black text-xl mb-6 flex items-center space-x-2">
                <FaTrophy className="text-amber-400" />
                <span>Top Sellers</span>
              </h3>
              {stats.topSellers.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No data yet</p>
              ) : (
                <div className="space-y-3">
                  {stats.topSellers.map((seller, index) => (
                    <div key={index} className={`flex items-center justify-between p-4 rounded-xl border ${index === 0 ? 'bg-amber-400/10 border-amber-400/30' : 'bg-gray-800 border-gray-700'}`}>
                      <div className="flex items-center space-x-3">
                        <span className={`font-black text-lg ${index === 0 ? 'text-amber-400' : 'text-gray-500'}`}>#{index + 1}</span>
                        <div>
                          <p className="text-white font-mono text-sm">{formatAddress(seller._id)}</p>
                          <p className="text-gray-500 text-xs">{seller.totalSales} sales</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1">
                        <FaEthereum className="text-amber-400" />
                        <span className="text-amber-400 font-black">{seller.totalVolume.toFixed(3)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
              <h3 className="text-white font-black text-xl mb-6 flex items-center space-x-2">
                <FaTrophy className="text-blue-400" />
                <span>Top Buyers</span>
              </h3>
              {stats.topBuyers.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No data yet</p>
              ) : (
                <div className="space-y-3">
                  {stats.topBuyers.map((buyer, index) => (
                    <div key={index} className={`flex items-center justify-between p-4 rounded-xl border ${index === 0 ? 'bg-blue-400/10 border-blue-400/30' : 'bg-gray-800 border-gray-700'}`}>
                      <div className="flex items-center space-x-3">
                        <span className={`font-black text-lg ${index === 0 ? 'text-blue-400' : 'text-gray-500'}`}>#{index + 1}</span>
                        <div>
                          <p className="text-white font-mono text-sm">{formatAddress(buyer._id)}</p>
                          <p className="text-gray-500 text-xs">{buyer.totalPurchases} purchases</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1">
                        <FaEthereum className="text-blue-400" />
                        <span className="text-blue-400 font-black">{buyer.totalSpent.toFixed(3)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Recent Activity */}
        {activeTab === 'activity' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <h3 className="text-white font-black text-xl mb-6 flex items-center space-x-2">
              <FaClock className="text-amber-400" />
              <span>Recent Transactions</span>
            </h3>
            {stats.recentTransactions.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No transactions yet</p>
            ) : (
              <div className="space-y-4">
                {stats.recentTransactions.map((tx, index) => (
                  <motion.div key={tx._id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.05 }} className="flex items-center justify-between p-4 bg-gray-800 rounded-xl border border-gray-700">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-700 flex-shrink-0">
                        {tx.horseImage ? (
                          <img src={tx.horseImage} alt={tx.horseName} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xl">🐴</div>
                        )}
                      </div>
                      <div>
                        <p className="text-white font-bold">{tx.horseName}</p>
                        <p className="text-gray-500 text-xs">
                          {formatAddress(tx.from)} → {tx.to ? formatAddress(tx.to) : 'Listed'}
                        </p>
                        <p className="text-gray-600 text-xs">
                          {new Date(tx.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center space-x-1">
                        <FaEthereum className="text-amber-400" />
                        <span className="text-amber-400 font-black">{tx.price} ETH</span>
                      </div>
                      <span className={`text-xs font-medium capitalize ${tx.type === 'buy' ? 'text-green-400' : 'text-blue-400'}`}>
                        {tx.type}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;