import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FaUniversity, FaCheckCircle, FaTimesCircle, FaSpinner, FaEye, FaCheck, FaTimes } from 'react-icons/fa';
import { MdPending, MdPayment } from 'react-icons/md';
import { useWeb3 } from '../context/Web3Context';
import { formatAddress } from '../utils/web3Helper';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import api from '../utils/api';
import toast from 'react-hot-toast';

const statusConfig = {
  pending: { label: 'Pending', color: 'text-yellow-400', bg: 'bg-yellow-400/10 border-yellow-400/30', icon: <MdPending className="text-yellow-400" /> },
  payment_sent: { label: 'Payment Sent', color: 'text-blue-400', bg: 'bg-blue-400/10 border-blue-400/30', icon: <MdPayment className="text-blue-400" /> },
  confirmed: { label: 'Confirmed', color: 'text-green-400', bg: 'bg-green-400/10 border-green-400/30', icon: <FaCheckCircle className="text-green-400" /> },
  cancelled: { label: 'Cancelled', color: 'text-red-400', bg: 'bg-red-400/10 border-red-400/30', icon: <FaTimesCircle className="text-red-400" /> },
};

const Orders = () => {
  const { account } = useWeb3();
  const [buyerOrders, setBuyerOrders] = useState([]);
  const [sellerOrders, setSellerOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('buying');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isConfirming, setIsConfirming] = useState(false);

  useEffect(() => {
    if (account) {
      fetchOrders();
    }
  }, [account]);

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      const [buyerRes, sellerRes] = await Promise.all([
        api.get(`/bankorders/buyer/${account}`),
        api.get(`/bankorders/seller/${account}`),
      ]);
      setBuyerOrders(buyerRes.data.data);
      setSellerOrders(sellerRes.data.data);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setIsLoading(false);
    }
  };

const handleConfirmOrder = async (orderId) => {
  try {
    setIsConfirming(true);
    await api.put(`/bankorders/${orderId}/confirm`);
    toast.success('Order confirmed! Horse transferred to buyer! 🐴');
    await fetchOrders();
    setSelectedOrder(null);
  } catch (error) {
    toast.error('Failed to confirm order: ' + error.message);
    console.error(error);
  } finally {
    setIsConfirming(false);
  }
};

  const handleCancelOrder = async (orderId) => {
    try {
      await api.put(`/bankorders/${orderId}/cancel`);
      toast.success('Order cancelled');
      fetchOrders();
      setSelectedOrder(null);
    } catch (error) {
      toast.error('Failed to cancel order');
    }
  };

  if (!account) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-gray-900 border border-gray-800 rounded-2xl p-10 text-center max-w-md">
          <FaUniversity className="text-amber-400 text-6xl mx-auto mb-6" />
          <h2 className="text-white text-2xl font-black mb-3">Connect Your Wallet</h2>
          <p className="text-gray-400">Connect your wallet to view your orders.</p>
        </motion.div>
      </div>
    );
  }
  const orders = activeTab === 'buying' ? buyerOrders : sellerOrders;

  return (
    <div className="min-h-screen bg-gray-950 py-10 px-4">
      <div className="max-w-5xl mx-auto">

        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <h1 className="text-4xl font-black text-white mb-3">
            My{' '}
            <span className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
              Orders
            </span>
          </h1>
          <p className="text-gray-400">Manage your bank transfer orders.</p>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Buying', value: buyerOrders.length, color: 'text-blue-400' },
            { label: 'Selling', value: sellerOrders.length, color: 'text-amber-400' },
            { label: 'Pending', value: [...buyerOrders, ...sellerOrders].filter(o => o.status === 'pending' || o.status === 'payment_sent').length, color: 'text-yellow-400' },
            { label: 'Confirmed', value: [...buyerOrders, ...sellerOrders].filter(o => o.status === 'confirmed').length, color: 'text-green-400' },
          ].map((stat, i) => (
            <div key={i} className="bg-gray-900 border border-gray-800 rounded-2xl p-5 text-center">
              <p className={`text-3xl font-black ${stat.color}`}>{stat.value}</p>
              <p className="text-gray-400 text-sm">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex space-x-2 mb-6">
          <button onClick={() => setActiveTab('buying')} className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'buying' ? 'bg-amber-400 text-gray-900' : 'bg-gray-800 text-gray-400 hover:text-white'}`}>
            Buying ({buyerOrders.length})
          </button>
          <button onClick={() => setActiveTab('selling')} className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'selling' ? 'bg-amber-400 text-gray-900' : 'bg-gray-800 text-gray-400 hover:text-white'}`}>
            Selling ({sellerOrders.length})
          </button>
        </div>

        {/* Orders List */}
        {isLoading ? (
          <LoadingSpinner message="Loading orders..." />
        ) : orders.length === 0 ? (
          <div className="text-center py-20">
            <FaUniversity className="text-gray-700 text-7xl mx-auto mb-4" />
            <p className="text-gray-500 text-xl">No orders found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order, index) => {
              const config = statusConfig[order.status];
              return (
                <motion.div key={order._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }} className="bg-gray-900 border border-gray-800 hover:border-amber-400/50 rounded-2xl p-5 transition-all">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-800 flex-shrink-0">
                        {order.horseImage ? (
                          <img src={order.horseImage} alt={order.horseName} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-2xl">🐴</div>
                        )}
                      </div>
                      <div>
                        <h3 className="text-white font-black text-lg">{order.horseName}</h3>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className={`inline-flex items-center space-x-1 border rounded-full px-2 py-0.5 text-xs font-bold ${config.bg} ${config.color}`}>
                            {config.icon}
                            <span>{config.label}</span>
                          </span>
                        </div>
                        <p className="text-gray-500 text-xs mt-1">
                          {new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-amber-400 font-black text-xl">{order.horsePrice} ETH</p>
                      <p className="text-green-400 text-sm font-bold">{order.priceInMAD.toLocaleString()} MAD</p>
                      <div className="flex items-center space-x-2 mt-2 justify-end">
                        <button onClick={() => setSelectedOrder(order)} className="bg-gray-800 hover:bg-gray-700 text-white text-xs px-3 py-1.5 rounded-lg flex items-center space-x-1 transition-all">
                          <FaEye />
                          <span>Details</span>
                        </button>
                        {activeTab === 'selling' && order.status === 'payment_sent' && (
                          <button onClick={() => handleConfirmOrder(order._id)} disabled={isConfirming} className="bg-green-600 hover:bg-green-700 text-white text-xs px-3 py-1.5 rounded-lg flex items-center space-x-1 transition-all disabled:opacity-50">
                            {isConfirming ? <FaSpinner className="animate-spin" /> : <FaCheck />}
                            <span>Confirm</span>
                          </button>
                        )}
                        {order.status === 'pending' && (
                          <button onClick={() => handleCancelOrder(order._id)} className="bg-red-600 hover:bg-red-700 text-white text-xs px-3 py-1.5 rounded-lg flex items-center space-x-1 transition-all">
                            <FaTimes />
                            <span>Cancel</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Order Detail Modal */}
        {selectedOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelectedOrder(null)}>
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} onClick={(e) => e.stopPropagation()} className="bg-gray-900 border border-gray-700 rounded-2xl p-6 w-full max-w-lg">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-white font-black text-xl">Order Details</h2>
                <button onClick={() => setSelectedOrder(null)} className="text-gray-400 hover:text-white">✕</button>
              </div>
              <div className="space-y-3">
                {[
                  { label: 'Order ID', value: selectedOrder._id },
                  { label: 'Horse', value: selectedOrder.horseName },
                  { label: 'Buyer Name', value: selectedOrder.buyerName },
                  { label: 'Buyer Phone', value: selectedOrder.buyerPhone },
                  { label: 'Buyer Email', value: selectedOrder.buyerEmail },
                  { label: 'Buyer Bank', value: selectedOrder.buyerBank },
                  { label: 'Buyer RIB', value: selectedOrder.buyerRIB },
                  { label: 'Buyer Wallet', value: formatAddress(selectedOrder.buyerWallet) },
                  { label: 'Price', value: `${selectedOrder.horsePrice} ETH / ${selectedOrder.priceInMAD.toLocaleString()} MAD` },
                  { label: 'Status', value: statusConfig[selectedOrder.status].label },
                ].map((item) => (
                  <div key={item.label} className="flex justify-between border-b border-gray-800 pb-2">
                    <span className="text-gray-400 text-sm">{item.label}</span>
                    <span className="text-white text-sm font-medium">{item.value}</span>
                  </div>
                ))}
                {selectedOrder.paymentProofUrl && (
                  <a href={selectedOrder.paymentProofUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-xl text-sm transition-all mt-2">
                    <FaEye />
                    <span>View Payment Proof</span>
                  </a>
                )}
                {activeTab === 'selling' && selectedOrder.status === 'payment_sent' && (
                  <button onClick={() => handleConfirmOrder(selectedOrder._id)} disabled={isConfirming} className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white font-bold py-3 rounded-xl flex items-center justify-center space-x-2 disabled:opacity-50 mt-2">
                    {isConfirming ? <><FaSpinner className="animate-spin" /><span>Confirming...</span></> : <><FaCheck /><span>Confirm Payment Received</span></>}
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;