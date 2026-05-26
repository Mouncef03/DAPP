import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaGavel, FaEthereum, FaClock, FaUser, FaArrowLeft, FaSpinner, FaTrophy, FaFire } from 'react-icons/fa';
import { useWeb3 } from '../context/Web3Context';
import { formatAddress } from '../utils/web3Helper';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import api from '../utils/api';
import toast from 'react-hot-toast';

const AuctionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { account, contract } = useWeb3();
  const [auction, setAuction] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [bidAmount, setBidAmount] = useState('');
  const [isPlacingBid, setIsPlacingBid] = useState(false);
  const [isAccepting, setIsAccepting] = useState(false);
  const [timeLeft, setTimeLeft] = useState({});

  useEffect(() => {
    fetchAuction();
  }, [id]);

  useEffect(() => {
    const timer = setInterval(() => {
      if (auction) setTimeLeft(getTimeLeft(auction.endTime));
    }, 1000);
    return () => clearInterval(timer);
  }, [auction]);

  const fetchAuction = async () => {
    try {
      setIsLoading(true);
      const response = await api.get(`/auctions/${id}`);
      setAuction(response.data.data);
      setTimeLeft(getTimeLeft(response.data.data.endTime));
    } catch (error) {
      toast.error('Auction not found');
      navigate('/auctions');
    } finally {
      setIsLoading(false);
    }
  };

  const getTimeLeft = (endTime) => {
    const now = new Date().getTime();
    const end = new Date(endTime).getTime();
    const diff = end - now;
    if (diff <= 0) return { hours: 0, minutes: 0, seconds: 0, expired: true };
    return {
      hours: Math.floor(diff / (1000 * 60 * 60)),
      minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
      seconds: Math.floor((diff % (1000 * 60)) / 1000),
      expired: false,
    };
  };

  const handlePlaceBid = async () => {
    if (!account) { toast.error('Connect your wallet first!'); return; }
    if (!bidAmount || parseFloat(bidAmount) <= 0) { toast.error('Enter a valid bid amount!'); return; }
    if (parseFloat(bidAmount) <= auction.highestBid) {
      toast.error(`Bid must be higher than ${auction.highestBid} ETH!`);
      return;
    }
    try {
      setIsPlacingBid(true);
      const { ethers } = await import('ethers');
      const bidInWei = ethers.parseEther(bidAmount.toString());

      toast.loading('Confirming bid in MetaMask...', { id: 'bid' });
      const tx = await contract.placeBid(auction.tokenId, { value: bidInWei });
      toast.loading('Waiting for confirmation...', { id: 'bid' });
      const receipt = await tx.wait();

      await api.post(`/auctions/${id}/bid`, {
        bidder: account,
        amount: parseFloat(bidAmount),
        transactionHash: receipt.hash,
      });

      toast.success(`🎉 Bid of ${bidAmount} ETH placed successfully!`, { id: 'bid' });
      setBidAmount('');
      fetchAuction();
    } catch (error) {
      toast.error('Failed to place bid: ' + error.message, { id: 'bid' });
    } finally {
      setIsPlacingBid(false);
    }
  };

  const handleAcceptBid = async () => {
    if (!account) { toast.error('Connect your wallet first!'); return; }
    try {
      setIsAccepting(true);
      toast.loading('Accepting bid on blockchain...', { id: 'accept' });
      await api.put(`/auctions/${id}/accept`);
      toast.success('🏆 Bid accepted! Horse transferred to winner!', { id: 'accept' });
      navigate('/my-horses');
    } catch (error) {
      toast.error('Failed to accept bid: ' + error.message, { id: 'accept' });
    } finally {
      setIsAccepting(false);
    }
  };

  if (isLoading) return <LoadingSpinner message="Loading auction..." />;
  if (!auction) return null;

  const isOwner = account && auction.seller.toLowerCase() === account.toLowerCase();
  const isHighestBidder = account && auction.highestBidder.toLowerCase() === account.toLowerCase();
  const minBid = auction.highestBid > 0 ? auction.highestBid + 0.001 : auction.startingPrice;
  return (
    <div className="min-h-screen bg-gray-950 py-10 px-4">
      <div className="max-w-6xl mx-auto">

        <motion.button initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} onClick={() => navigate(-1)} className="flex items-center space-x-2 text-gray-400 hover:text-amber-400 mb-8 transition-colors">
          <FaArrowLeft />
          <span>Back</span>
        </motion.button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">

          {/* Left: Image + Timer */}
          <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
            <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden relative">
              {auction.horseImage ? (
                <img src={auction.horseImage} alt={auction.horseName} className="w-full h-80 object-cover" />
              ) : (
                <div className="w-full h-80 flex items-center justify-center">
                  <FaGavel className="text-gray-700 text-8xl" />
                </div>
              )}
              {!timeLeft.expired && (
                <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-black px-2 py-1 rounded-full flex items-center space-x-1">
                  <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
                  <span>LIVE AUCTION</span>
                </div>
              )}
            </div>

            {/* Timer */}
            <div className={`bg-gray-900 border rounded-2xl p-6 mt-4 text-center ${timeLeft.expired ? 'border-red-400/30' : 'border-amber-400/30'}`}>
              <p className="text-gray-400 text-sm mb-3 flex items-center justify-center space-x-2">
                <FaClock className="text-amber-400" />
                <span>{timeLeft.expired ? 'Auction Ended' : 'Time Remaining'}</span>
              </p>
              {timeLeft.expired ? (
                <p className="text-red-400 font-black text-2xl">ENDED</p>
              ) : (
                <div className="flex justify-center space-x-4">
                  {[
                    { value: timeLeft.hours, label: 'Hours' },
                    { value: timeLeft.minutes, label: 'Min' },
                    { value: timeLeft.seconds, label: 'Sec' },
                  ].map((t) => (
                    <div key={t.label} className="bg-gray-800 rounded-xl p-3 min-w-16 text-center">
                      <p className="text-amber-400 font-black text-3xl">{String(t.value).padStart(2, '0')}</p>
                      <p className="text-gray-500 text-xs">{t.label}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>

          {/* Right: Auction Info */}
          <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }} className="space-y-6">

            <div>
              <h1 className="text-4xl font-black text-white mb-2">{auction.horseName}</h1>
              <div className="flex items-center space-x-2">
                <FaFire className="text-orange-400" />
                <span className="text-gray-400">{auction.bids.length} bids placed</span>
              </div>
            </div>

            {/* Price Info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
                <p className="text-gray-400 text-sm mb-1">Starting Price</p>
                <div className="flex items-center space-x-2">
                  <FaEthereum className="text-gray-400 text-xl" />
                  <span className="text-white font-black text-2xl">{auction.startingPrice} ETH</span>
                </div>
              </div>
              <div className="bg-gray-900 border border-amber-400/30 rounded-2xl p-5">
                <p className="text-gray-400 text-sm mb-1">Highest Bid</p>
                <div className="flex items-center space-x-2">
                  <FaEthereum className="text-amber-400 text-xl" />
                  <span className="text-amber-400 font-black text-2xl">
                    {auction.highestBid > 0 ? `${auction.highestBid} ETH` : 'No bids'}
                  </span>
                </div>
              </div>
            </div>

            {/* Highest Bidder */}
            {auction.highestBidder && (
              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
                <div className="flex items-center space-x-3">
                  <div className="bg-amber-400/10 border border-amber-400/30 rounded-full p-2">
                    <FaTrophy className="text-amber-400" />
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Highest Bidder</p>
                    <p className="text-white font-mono font-bold">
                      {formatAddress(auction.highestBidder)}
                      {isHighestBidder && <span className="ml-2 text-amber-400 text-xs">(You)</span>}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Seller */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
              <div className="flex items-center space-x-3">
                <div className="bg-gray-800 rounded-full p-2">
                  <FaUser className="text-gray-400" />
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Seller</p>
                  <p className="text-white font-mono font-bold">
                    {formatAddress(auction.seller)}
                    {isOwner && <span className="ml-2 text-amber-400 text-xs">(You)</span>}
                  </p>
                </div>
              </div>
            </div>

            {/* Place Bid */}
            {!isOwner && !timeLeft.expired && account && (
              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
                <h3 className="text-white font-bold mb-4">Place Your Bid</h3>
                <p className="text-gray-500 text-xs mb-3">
                  Minimum bid: <span className="text-amber-400 font-bold">{minBid.toFixed(3)} ETH</span>
                </p>
                <div className="flex space-x-3">
                  <div className="relative flex-1">
                    <FaEthereum className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-400" />
                    <input
                      type="number"
                      value={bidAmount}
                      onChange={(e) => setBidAmount(e.target.value)}
                      placeholder={`Min: ${minBid.toFixed(3)}`}
                      step="0.001"
                      min={minBid}
                      className="w-full bg-gray-800 border border-gray-700 focus:border-amber-400 rounded-xl pl-10 pr-4 py-3 text-white placeholder-gray-500 outline-none transition-colors"
                    />
                  </div>
                  <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handlePlaceBid} disabled={isPlacingBid} className="bg-gradient-to-r from-amber-400 to-orange-500 text-gray-900 font-black px-6 py-3 rounded-xl flex items-center space-x-2 disabled:opacity-50">
                    {isPlacingBid ? <FaSpinner className="animate-spin" /> : <FaGavel />}
                    <span>{isPlacingBid ? 'Bidding...' : 'Bid'}</span>
                  </motion.button>
                </div>
              </div>
            )}

            {/* Accept Bid (Owner only) */}
            {isOwner && auction.highestBidder && !timeLeft.expired && (
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleAcceptBid} disabled={isAccepting} className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-black py-4 rounded-xl text-lg flex items-center justify-center space-x-3 disabled:opacity-50">
                {isAccepting ? (
                  <span className="flex items-center space-x-2"><FaSpinner className="animate-spin" /><span>Processing...</span></span>
                ) : (
                  <span className="flex items-center space-x-2"><FaTrophy /><span>Accept Highest Bid — {auction.highestBid} ETH</span></span>
                )}
              </motion.button>
            )}

            {!account && (
              <div className="bg-amber-400/10 border border-amber-400/30 rounded-xl p-4 text-center">
                <p className="text-amber-400 text-sm">Connect your wallet to place a bid</p>
              </div>
            )}
          </motion.div>
        </div>

        {/* Bid History */}
        {auction.bids.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="mt-10 bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <h2 className="text-white font-black text-2xl mb-6 flex items-center space-x-2">
              <FaFire className="text-orange-400" />
              <span>Bid History</span>
            </h2>
            <div className="space-y-3">
              {[...auction.bids].reverse().map((bid, index) => (
                <div key={index} className={`flex items-center justify-between p-4 rounded-xl border ${index === 0 ? 'bg-amber-400/10 border-amber-400/30' : 'bg-gray-800 border-gray-700'}`}>
                  <div className="flex items-center space-x-3">
                    {index === 0 && <FaTrophy className="text-amber-400" />}
                    <div>
                      <p className="text-white font-mono text-sm">{formatAddress(bid.bidder)}</p>
                      <p className="text-gray-500 text-xs">{new Date(bid.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    <FaEthereum className={index === 0 ? 'text-amber-400' : 'text-gray-400'} />
                    <span className={`font-black ${index === 0 ? 'text-amber-400 text-lg' : 'text-white'}`}>{bid.amount} ETH</span>
                    {index === 0 && <span className="ml-2 bg-amber-400 text-gray-900 text-xs font-black px-2 py-0.5 rounded-full">Highest</span>}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default AuctionDetail;