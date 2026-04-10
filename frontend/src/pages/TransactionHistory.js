import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FaHistory, FaEthereum, FaArrowRight, FaExternalLinkAlt } from 'react-icons/fa';
import { MdCallMade, MdCallReceived, MdAddCircle } from 'react-icons/md';
import { useWeb3 } from '../context/Web3Context';
import { formatAddress } from '../utils/web3Helper';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import api from '../utils/api';

const TransactionHistory = () => {
  const { account } = useWeb3();
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    if (account) {
      fetchTransactions();
    }
  }, [account]);

  const fetchTransactions = async () => {
    try {
      setIsLoading(true);
      const response = await api.get(`/transactions/${account}`);
      setTransactions(response.data.data);
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getTypeConfig = (type, from) => {
    if (type === 'list') return {
      icon: <MdAddCircle className="text-blue-400 text-xl" />,
      label: 'Listed',
      color: 'text-blue-400',
      bg: 'bg-blue-400/10 border-blue-400/30',
    };
    if (type === 'buy' && from.toLowerCase() !== account.toLowerCase()) return {
      icon: <MdCallReceived className="text-green-400 text-xl" />,
      label: 'Bought',
      color: 'text-green-400',
      bg: 'bg-green-400/10 border-green-400/30',
    };
    return {
      icon: <MdCallMade className="text-red-400 text-xl" />,
      label: 'Sold',
      color: 'text-red-400',
      bg: 'bg-red-400/10 border-red-400/30',
    };
  };

  const filteredTransactions = transactions.filter((tx) => {
    if (filter === 'all') return true;
    if (filter === 'list') return tx.type === 'list';
    if (filter === 'buy') return tx.type === 'buy' && tx.to.toLowerCase() === account.toLowerCase();
    if (filter === 'sell') return tx.type === 'buy' && tx.from.toLowerCase() === account.toLowerCase();
    return true;
  });

  if (!account) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gray-900 border border-gray-800 rounded-2xl p-10 text-center max-w-md"
        >
          <FaHistory className="text-amber-400 text-6xl mx-auto mb-6" />
          <h2 className="text-white text-2xl font-black mb-3">Connect Your Wallet</h2>
          <p className="text-gray-400">Connect your wallet to view your transaction history.</p>
        </motion.div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-gray-950 py-10 px-4">
      <div className="max-w-5xl mx-auto">

        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <h1 className="text-4xl font-black text-white mb-3">
            Transaction{' '}
            <span className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
              History
            </span>
          </h1>
          <p className="text-gray-400">All your blockchain transactions in one place.</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total', value: transactions.length, color: 'text-white' },
            { label: 'Listed', value: transactions.filter(t => t.type === 'list').length, color: 'text-blue-400' },
            { label: 'Bought', value: transactions.filter(t => t.type === 'buy' && t.to.toLowerCase() === account.toLowerCase()).length, color: 'text-green-400' },
            { label: 'Sold', value: transactions.filter(t => t.type === 'buy' && t.from.toLowerCase() === account.toLowerCase()).length, color: 'text-red-400' },
          ].map((stat, i) => (
            <div key={i} className="bg-gray-900 border border-gray-800 rounded-2xl p-5 text-center">
              <p className={`text-3xl font-black ${stat.color}`}>{stat.value}</p>
              <p className="text-gray-400 text-sm">{stat.label}</p>
            </div>
          ))}
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="flex space-x-2 mb-6">
          {[
            { value: 'all', label: 'All' },
            { value: 'buy', label: 'Bought' },
            { value: 'sell', label: 'Sold' },
            { value: 'list', label: 'Listed' },
          ].map((f) => (
            <button key={f.value} onClick={() => setFilter(f.value)} className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${filter === f.value ? 'bg-amber-400 text-gray-900' : 'bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700'}`}>
              {f.label}
            </button>
          ))}
        </motion.div>

        {isLoading ? (
          <LoadingSpinner message="Loading transactions..." />
        ) : filteredTransactions.length === 0 ? (
          <div className="text-center py-20">
            <FaHistory className="text-gray-700 text-7xl mx-auto mb-4" />
            <p className="text-gray-500 text-xl">No transactions found</p>
          </div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            {filteredTransactions.map((tx, index) => {
              const config = getTypeConfig(tx.type, tx.from);
              return (
                <motion.div key={tx._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }} className="bg-gray-900 border border-gray-800 hover:border-amber-400/50 rounded-2xl p-5 transition-all">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-14 h-14 rounded-xl overflow-hidden bg-gray-800 flex-shrink-0">
                        {tx.horseImage ? (
                          <img src={tx.horseImage} alt={tx.horseName} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-600 text-xl">🐴</div>
                        )}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2 mb-1">
                          <span className={`inline-flex items-center space-x-1 border rounded-full px-2 py-0.5 text-xs font-bold ${config.bg} ${config.color}`}>
                            {config.icon}
                            <span>{config.label}</span>
                          </span>
                          <h3 className="text-white font-bold">{tx.horseName}</h3>
                        </div>
                        <div className="flex items-center space-x-2 text-xs text-gray-500">
                          <span className="font-mono">{formatAddress(tx.from)}</span>
                          {tx.to && (
                            <>
                              <FaArrowRight className="text-gray-600" />
                              <span className="font-mono">{formatAddress(tx.to)}</span>
                            </>
                          )}
                        </div>
                        <p className="text-gray-600 text-xs mt-1">
                          {new Date(tx.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center space-x-1 justify-end mb-2">
                        <FaEthereum className="text-amber-400" />
                        <span className="text-amber-400 font-black text-lg">{tx.price} ETH</span>
                      </div>
                      {tx.transactionHash && (
                        <div className="flex items-center space-x-1 text-blue-400 text-xs justify-end">
                          <span className="font-mono">{formatAddress(tx.transactionHash)}</span>
                          <FaExternalLinkAlt size={10} />
                        </div>
                      )}
                      <span className="text-green-400 text-xs font-medium capitalize">{tx.status}</span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default TransactionHistory;