import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaUniversity, FaUser, FaPhone, FaEnvelope, FaMoneyBillWave, FaArrowLeft, FaSpinner, FaUpload, FaCheckCircle } from 'react-icons/fa';
import { useWeb3 } from '../context/Web3Context';
import { useHorse } from '../context/HorseContext';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import api from '../utils/api';
import toast from 'react-hot-toast';

const SELLER_BANK_INFO = {
  bankName: 'Attijariwafa Bank',
  accountName: 'HorseChain Marketplace',
  rib: '007 780 0001234567890112',
  swift: 'BCMAMAMC',
};

const ETH_TO_MAD = 35000;

const BankCheckout = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { account } = useWeb3();
  const { fetchHorseById, selectedHorse, isLoading } = useHorse();
  const [step, setStep] = useState(1);
  const [orderId, setOrderId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [proofFile, setProofFile] = useState(null);
  const [isUploadingProof, setIsUploadingProof] = useState(false);

  const [formData, setFormData] = useState({
    buyerName: '',
    buyerPhone: '',
    buyerEmail: '',
    buyerBank: '',
    buyerRIB: '',
  });

  useEffect(() => {
    fetchHorseById(id);
  }, [id]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    if (!account) { toast.error('Please connect your wallet!'); return; }
    try {
      setIsSubmitting(true);
      const response = await api.post('/bankorders', {
        horseId: id,
        buyerWallet: account,
        ...formData,
      });
      setOrderId(response.data.data._id);
      setStep(2);
      toast.success('Order created successfully!');
    } catch (error) {
      toast.error('Failed to create order: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUploadProof = async () => {
    if (!proofFile) { toast.error('Please select a proof file!'); return; }
    try {
      setIsUploadingProof(true);
      const formDataProof = new FormData();
      formDataProof.append('proof', proofFile);
      await api.put(`/bankorders/${orderId}/proof`, formDataProof, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setStep(3);
      toast.success('Payment proof uploaded!');
    } catch (error) {
      toast.error('Failed to upload proof: ' + error.message);
    } finally {
      setIsUploadingProof(false);
    }
  };

  if (isLoading) return <LoadingSpinner message="Loading horse details..." />;
  if (!selectedHorse) return null;

  const priceInMAD = (selectedHorse.price * ETH_TO_MAD).toLocaleString();
  return (
    <div className="min-h-screen bg-gray-950 py-10 px-4">
      <div className="max-w-3xl mx-auto">

        <motion.button initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} onClick={() => navigate(-1)} className="flex items-center space-x-2 text-gray-400 hover:text-amber-400 mb-8 transition-colors">
          <FaArrowLeft />
          <span>Back</span>
        </motion.button>

        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-4xl font-black text-white mb-3">
            Bank{' '}
            <span className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
              Transfer
            </span>
          </h1>
          <p className="text-gray-400">Buy this horse using a bank transfer in Moroccan Dirhams (MAD)</p>
        </motion.div>

        {/* Steps */}
        <div className="flex items-center space-x-4 mb-8">
          {[
            { num: 1, label: 'Your Info' },
            { num: 2, label: 'Transfer' },
            { num: 3, label: 'Confirmed' },
          ].map((s, i) => (
            <React.Fragment key={s.num}>
              <div className="flex items-center space-x-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${step >= s.num ? 'bg-amber-400 text-gray-900' : 'bg-gray-800 text-gray-500'}`}>
                  {step > s.num ? <FaCheckCircle /> : s.num}
                </div>
                <span className={`text-sm font-medium ${step >= s.num ? 'text-white' : 'text-gray-500'}`}>{s.label}</span>
              </div>
              {i < 2 && <div className={`flex-1 h-0.5 ${step > s.num ? 'bg-amber-400' : 'bg-gray-800'}`}></div>}
            </React.Fragment>
          ))}
        </div>

        {/* Horse Summary */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 mb-6 flex items-center space-x-4">
          <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-800">
            {selectedHorse.imageUrl ? (
              <img src={selectedHorse.imageUrl} alt={selectedHorse.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-3xl">🐴</div>
            )}
          </div>
          <div className="flex-1">
            <h3 className="text-white font-black text-xl">{selectedHorse.name}</h3>
            <p className="text-gray-400">{selectedHorse.breed} • {selectedHorse.age} years</p>
          </div>
          <div className="text-right">
            <p className="text-amber-400 font-black text-2xl">{selectedHorse.price} ETH</p>
            <p className="text-green-400 font-bold">{priceInMAD} MAD</p>
          </div>
        </div>

        {/* Step 1 — Buyer Info Form */}
        {step === 1 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <h2 className="text-white font-black text-xl mb-6">Your Information</h2>
            <form onSubmit={handleSubmitOrder} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-gray-400 text-sm mb-2 block">Full Name</label>
                  <div className="relative">
                    <FaUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input type="text" name="buyerName" value={formData.buyerName} onChange={handleChange} placeholder="Ahmed Benali" required className="w-full bg-gray-800 border border-gray-700 focus:border-amber-400 rounded-xl pl-10 pr-4 py-3 text-white placeholder-gray-500 outline-none transition-colors" />
                  </div>
                </div>
                <div>
                  <label className="text-gray-400 text-sm mb-2 block">Phone Number</label>
                  <div className="relative">
                    <FaPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input type="tel" name="buyerPhone" value={formData.buyerPhone} onChange={handleChange} placeholder="+212 6XX XXX XXX" required className="w-full bg-gray-800 border border-gray-700 focus:border-amber-400 rounded-xl pl-10 pr-4 py-3 text-white placeholder-gray-500 outline-none transition-colors" />
                  </div>
                </div>
              </div>
              <div>
                <label className="text-gray-400 text-sm mb-2 block">Email Address</label>
                <div className="relative">
                  <FaEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input type="email" name="buyerEmail" value={formData.buyerEmail} onChange={handleChange} placeholder="ahmed@example.com" required className="w-full bg-gray-800 border border-gray-700 focus:border-amber-400 rounded-xl pl-10 pr-4 py-3 text-white placeholder-gray-500 outline-none transition-colors" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-gray-400 text-sm mb-2 block">Your Bank</label>
                  <div className="relative">
                    <FaUniversity className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                    <select name="buyerBank" value={formData.buyerBank} onChange={handleChange} required className="w-full bg-gray-800 border border-gray-700 focus:border-amber-400 rounded-xl pl-10 pr-4 py-3 text-white outline-none transition-colors appearance-none">
                      <option value="">Select your bank</option>
                      <option value="Attijariwafa">Attijariwafa Bank</option>
                      <option value="CIH">CIH Bank</option>
                      <option value="BMCE">BMCE Bank</option>
                      <option value="BCP">Banque Populaire</option>
                      <option value="BMCI">BMCI</option>
                      <option value="Société Générale">Société Générale</option>
                      <option value="CFG">CFG Bank</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-gray-400 text-sm mb-2 block">Your RIB</label>
                  <div className="relative">
                    <FaMoneyBillWave className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input type="text" name="buyerRIB" value={formData.buyerRIB} onChange={handleChange} placeholder="007 780 XXXXXXXXXXXXXXX" required className="w-full bg-gray-800 border border-gray-700 focus:border-amber-400 rounded-xl pl-10 pr-4 py-3 text-white placeholder-gray-500 outline-none transition-colors" />
                  </div>
                </div>
              </div>
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" disabled={isSubmitting} className="w-full bg-gradient-to-r from-amber-400 to-orange-500 text-gray-900 font-black py-4 rounded-xl text-lg flex items-center justify-center space-x-2 disabled:opacity-50">
                {isSubmitting ? <><FaSpinner className="animate-spin" /><span>Processing...</span></> : <><FaUniversity /><span>Continue to Payment</span></>}
              </motion.button>
            </form>
          </motion.div>
        )}

        {/* Step 2 — Bank Transfer Instructions */}
        {step === 2 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="bg-gray-900 border border-amber-400/30 rounded-2xl p-6">
              <h2 className="text-white font-black text-xl mb-6 flex items-center space-x-2">
                <FaUniversity className="text-amber-400" />
                <span>Transfer Details</span>
              </h2>
              <div className="space-y-4">
                {[
                  { label: 'Bank Name', value: SELLER_BANK_INFO.bankName },
                  { label: 'Account Name', value: SELLER_BANK_INFO.accountName },
                  { label: 'RIB', value: SELLER_BANK_INFO.rib },
                  { label: 'SWIFT Code', value: SELLER_BANK_INFO.swift },
                  { label: 'Amount to Transfer', value: `${priceInMAD} MAD`, highlight: true },
                ].map((item) => (
                  <div key={item.label} className="flex justify-between items-center border-b border-gray-800 pb-3">
                    <span className="text-gray-400 text-sm">{item.label}</span>
                    <span className={`font-bold ${item.highlight ? 'text-amber-400 text-xl' : 'text-white'}`}>{item.value}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 bg-amber-400/10 border border-amber-400/30 rounded-xl p-4">
                <p className="text-amber-400 text-sm font-medium">
                  ⚠️ Please include your Order ID in the transfer reference: <span className="font-mono font-black">{orderId}</span>
                </p>
              </div>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
              <h2 className="text-white font-black text-xl mb-4">Upload Payment Proof</h2>
              <p className="text-gray-400 text-sm mb-4">After completing the transfer, upload a screenshot or PDF of your bank receipt.</p>
              <div className="border-2 border-dashed border-gray-700 hover:border-amber-400 rounded-xl p-6 text-center cursor-pointer transition-all mb-4" onClick={() => document.getElementById('proofInput').click()}>
                <FaUpload className="text-gray-500 text-3xl mx-auto mb-2" />
                <p className="text-gray-400 text-sm">{proofFile ? proofFile.name : 'Click to upload bank receipt'}</p>
                <input id="proofInput" type="file" accept=".jpg,.jpeg,.png,.pdf" onChange={(e) => setProofFile(e.target.files[0])} className="hidden" />
              </div>
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleUploadProof} disabled={isUploadingProof || !proofFile} className="w-full bg-gradient-to-r from-amber-400 to-orange-500 text-gray-900 font-black py-4 rounded-xl text-lg flex items-center justify-center space-x-2 disabled:opacity-50">
                {isUploadingProof ? <><FaSpinner className="animate-spin" /><span>Uploading...</span></> : <><FaUpload /><span>Submit Payment Proof</span></>}
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* Step 3 — Confirmation */}
        {step === 3 && (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-gray-900 border border-green-400/30 rounded-2xl p-10 text-center">
            <div className="w-20 h-20 bg-green-400/10 border border-green-400/30 rounded-full flex items-center justify-center mx-auto mb-6">
              <FaCheckCircle className="text-green-400 text-4xl" />
            </div>
            <h2 className="text-white font-black text-3xl mb-3">Order Submitted!</h2>
            <p className="text-gray-400 mb-2">Your payment proof has been submitted successfully.</p>
            <p className="text-gray-400 mb-6">The seller will verify your payment and confirm the transfer. You will receive the horse once confirmed.</p>
            <div className="bg-gray-800 rounded-xl p-4 mb-6">
              <p className="text-gray-400 text-sm">Order ID</p>
              <p className="text-amber-400 font-mono font-bold">{orderId}</p>
            </div>
            <div className="flex space-x-4 justify-center">
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => navigate('/orders')} className="bg-gradient-to-r from-amber-400 to-orange-500 text-gray-900 font-bold px-6 py-3 rounded-xl">
                View My Orders
              </motion.button>
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => navigate('/marketplace')} className="bg-gray-800 text-white font-bold px-6 py-3 rounded-xl border border-gray-700">
                Back to Marketplace
              </motion.button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default BankCheckout;