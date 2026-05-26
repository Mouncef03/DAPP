import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaBell, FaTimes, FaCheckCircle, FaUniversity, FaHorse } from 'react-icons/fa';
import { useWeb3 } from '../../context/Web3Context';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';

const Notifications = () => {
  const { account } = useWeb3();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (account) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 15000);
      return () => clearInterval(interval);
    }
  }, [account]);

  const fetchNotifications = async () => {
    try {
      const response = await api.get(`/notifications/${account}`);
      setNotifications(response.data.data);
      setUnreadCount(response.data.data.filter(n => !n.isRead).length);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.put(`/notifications/${account}/read-all`);
      fetchNotifications();
    } catch (error) {
      console.error(error);
    }
  };

const handleNotificationClick = async (notification) => {
  try {
    await api.put(`/notifications/${notification._id}/read`);
    fetchNotifications();
    setIsOpen(false);
    if (notification.type === 'payment_sent') {
      if (notification.message.includes('bid') || notification.message.includes('ETH on')) {
        navigate('/auctions');
      } else {
        navigate('/orders');
      }
    } else if (notification.type === 'order_confirmed') {
      navigate('/my-horses');
    }
  } catch (error) {
    console.error(error);
  }
};

  const getNotificationIcon = (type) => {
    if (type === 'payment_sent') return <FaUniversity className="text-blue-400" />;
    if (type === 'order_confirmed') return <FaCheckCircle className="text-green-400" />;
    return <FaHorse className="text-amber-400" />;
  };

  if (!account) return null;

  return (
    <div className="relative">
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative bg-gray-800 border border-gray-700 hover:border-amber-400 p-2 rounded-lg transition-all"
      >
        <FaBell className={`text-lg ${unreadCount > 0 ? 'text-amber-400' : 'text-gray-400'}`} />
        {unreadCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-black w-5 h-5 rounded-full flex items-center justify-center animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute right-0 mt-2 w-80 bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl z-50 overflow-hidden"
            >
              {/* Header */}
              <div className="flex justify-between items-center p-4 border-b border-gray-800">
                <h3 className="text-white font-bold">Notifications</h3>
                <div className="flex items-center space-x-2">
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllRead}
                      className="text-amber-400 text-xs hover:text-amber-300 transition-colors"
                    >
                      Mark all read
                    </button>
                  )}
                  <button onClick={() => setIsOpen(false)} className="text-gray-500 hover:text-white">
                    <FaTimes />
                  </button>
                </div>
              </div>

              {/* Notifications List */}
              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="text-center py-8">
                    <FaBell className="text-gray-700 text-4xl mx-auto mb-2" />
                    <p className="text-gray-500 text-sm">No notifications yet</p>
                  </div>
                ) : (
                  notifications.map((notification) => (
                    <motion.div
                      key={notification._id}
                      whileHover={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
                      onClick={() => handleNotificationClick(notification)}
                      className={`p-4 border-b border-gray-800 cursor-pointer transition-all ${!notification.isRead ? 'bg-amber-400/5' : ''}`}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="bg-gray-800 rounded-full p-2 mt-0.5">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1">
                          <p className={`text-sm ${!notification.isRead ? 'text-white font-medium' : 'text-gray-400'}`}>
                            {notification.message}
                          </p>
                          <p className="text-gray-600 text-xs mt-1">
                            {new Date(notification.createdAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        </div>
                        {!notification.isRead && (
                          <div className="w-2 h-2 bg-amber-400 rounded-full mt-1 flex-shrink-0"></div>
                        )}
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Notifications;