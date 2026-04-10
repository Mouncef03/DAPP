import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaHorse, FaEthereum, FaUser, FaShieldAlt, FaSpinner, FaArrowLeft, FaUpload, FaFile, FaTrash, FaUniversity } from 'react-icons/fa';
import { useWeb3 } from '../context/Web3Context';
import { useHorse } from '../context/HorseContext';
import { formatAddress } from '../utils/web3Helper';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import api from '../utils/api';
import { QRCodeSVG } from 'qrcode.react';
import toast from 'react-hot-toast';

const HorseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { account, contract } = useWeb3();
  const { fetchHorseById, selectedHorse, isLoading, uploadImage } = useHorse();
  const [isBuying, setIsBuying] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [isUploadingDoc, setIsUploadingDoc] = useState(false);
  const [isUpdatingPhoto, setIsUpdatingPhoto] = useState(false);
  const [docForm, setDocForm] = useState({ name: '', type: 'other', file: null });
  const [showDocForm, setShowDocForm] = useState(false);

  useEffect(() => {
    fetchHorseById(id);
    fetchDocuments();
  }, [id]);

  const fetchDocuments = async () => {
    try {
      const response = await api.get(`/documents/${id}`);
      setDocuments(response.data.data);
    } catch (error) {
      console.error('Failed to fetch documents:', error);
    }
  };


     const handleSignDocument = async (docId, docName) => {
  if (!account) { toast.error('Connect your wallet first!'); return; }
  try {
    toast.loading('Waiting for MetaMask signature...', { id: 'sign' });

    // Create message to sign
    const message = `I certify that I am the owner of document: ${docName} | Document ID: ${docId} | Horse: ${selectedHorse.name} | Timestamp: ${new Date().toISOString()}`;

    // Sign with MetaMask
    const { ethers } = await import('ethers');
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const signature = await signer.signMessage(message);

    // Save signature to backend
    await api.put(`/documents/${docId}/sign`, {
      signature,
      messageHash: message,
      signerAddress: account,
    });

    toast.success('Document signed successfully! 🔐', { id: 'sign' });
    fetchDocuments();
  } catch (error) {
    toast.error('Failed to sign: ' + error.message, { id: 'sign' });
  }
};

const handleVerifyDocument = async (docId) => {
  try {
    toast.loading('Verifying signature...', { id: 'verify' });
    const response = await api.get(`/documents/${docId}/verify`);
    const { isValid, recoveredAddress, signedAt } = response.data;

    if (isValid) {
      toast.success(`✅ Valid! Signed by ${recoveredAddress.slice(0,6)}...${recoveredAddress.slice(-4)}`, { id: 'verify' });
    } else {
      toast.error('❌ Invalid signature!', { id: 'verify' });
    }
  } catch (error) {
    toast.error('Verification failed', { id: 'verify' });
  }
};

  const handleBuy = async () => {
    if (!account) { toast.error('Please connect your wallet first!'); return; }
    if (!contract) { toast.error('Contract not connected!'); return; }
    try {
      setIsBuying(true);
      const { ethers } = await import('ethers');
      const priceInWei = ethers.parseEther(selectedHorse.price.toString());
      toast.loading('Confirming in MetaMask...', { id: 'buying' });
      const tx = await contract.buyHorse(selectedHorse.tokenId, { value: priceInWei });
      toast.loading('Waiting for confirmation...', { id: 'buying' });
      const receipt = await tx.wait();
      await api.put(`/horses/${selectedHorse._id}/buy`, {
        newOwner: account,
        transactionHash: receipt.hash,
      });
      toast.success('Horse purchased successfully!', { id: 'buying' });
      navigate('/my-horses');
    } catch (error) {
      toast.error('Failed: ' + error.message, { id: 'buying' });
    } finally {
      setIsBuying(false);
    }
  };

  const handleUpdatePhoto = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      setIsUpdatingPhoto(true);
      toast.loading('Uploading new photo...', { id: 'photo' });
      const ipfsResult = await uploadImage(file);
      await api.put(`/horses/${selectedHorse._id}`, {
        imageUrl: ipfsResult.imageUrl,
        ipfsHash: ipfsResult.ipfsHash,
      });
      toast.success('Photo updated!', { id: 'photo' });
      fetchHorseById(id);
    } catch (error) {
      toast.error('Failed to update photo', { id: 'photo' });
    } finally {
      setIsUpdatingPhoto(false);
    }
  };

  const handleUploadDocument = async () => {
    if (!docForm.file || !docForm.name) { toast.error('Please fill all fields'); return; }
    try {
      setIsUploadingDoc(true);
      toast.loading('Uploading document...', { id: 'doc' });
      const formData = new FormData();
      formData.append('document', docForm.file);
      formData.append('name', docForm.name);
      formData.append('type', docForm.type);
      formData.append('uploadedBy', account);
      await api.post(`/documents/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('Document uploaded!', { id: 'doc' });
      setShowDocForm(false);
      setDocForm({ name: '', type: 'other', file: null });
      fetchDocuments();
    } catch (error) {
      toast.error('Failed to upload document', { id: 'doc' });
    } finally {
      setIsUploadingDoc(false);
    }
  };

  const handleDeleteDocument = async (docId) => {
    try {
      await api.delete(`/documents/delete/${docId}`);
      toast.success('Document deleted');
      fetchDocuments();
    } catch (error) {
      toast.error('Failed to delete document');
    }
  };

  if (isLoading) { return <LoadingSpinner message="Loading horse details..." />; }

  if (!selectedHorse) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <FaHorse className="text-gray-700 text-7xl mx-auto mb-4" />
          <p className="text-gray-500 text-xl">Horse not found</p>
          <button onClick={() => navigate('/marketplace')} className="mt-4 text-amber-400">
            Back to Marketplace
          </button>
        </div>
      </div>
    );
  }
    

  const isOwner = account && selectedHorse.owner.toLowerCase() === account.toLowerCase();

  return (
    <div className="min-h-screen bg-gray-950 py-10 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.button initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} onClick={() => navigate(-1)} className="flex items-center space-x-2 text-gray-400 hover:text-amber-400 mb-8 transition-colors">
          <FaArrowLeft />
          <span>Back</span>
        </motion.button>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
            <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden relative">
              {selectedHorse.imageUrl ? (
                <img src={selectedHorse.imageUrl} alt={selectedHorse.name} className="w-full h-96 object-cover" />
              ) : (
                <div className="w-full h-96 flex items-center justify-center">
                  <FaHorse className="text-gray-700 text-8xl" />
                </div>
              )}
              {isOwner && (
                <div className="absolute bottom-3 right-3">
                  <label className="cursor-pointer bg-amber-400 hover:bg-amber-500 text-gray-900 font-bold px-3 py-2 rounded-xl flex items-center space-x-2 text-sm transition-all">
                    {isUpdatingPhoto ? <FaSpinner className="animate-spin" /> : <FaUpload />}
                    <span>{isUpdatingPhoto ? 'Uploading...' : 'Update Photo'}</span>
                    <input type="file" accept="image/*" onChange={handleUpdatePhoto} className="hidden" />
                  </label>
                </div>
              )}
            </div>
            {selectedHorse.transactionHash && (
              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 mt-4">
                <div className="flex items-center space-x-2 mb-3">
                  <FaShieldAlt className="text-green-400" />
                  <h3 className="text-white font-bold">Blockchain Verified</h3>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-500 text-sm">Token ID</span>
                    <span className="text-amber-400 text-sm font-mono">#{selectedHorse.tokenId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 text-sm">TX Hash</span>
                    <span className="text-amber-400 text-sm font-mono">{formatAddress(selectedHorse.transactionHash)}</span>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }} className="space-y-6">
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <h1 className="text-4xl font-black text-white">{selectedHorse.name}</h1>
                {selectedHorse.isForSale && (
                  <span className="bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full">For Sale</span>
                )}
              </div>
              <p className="text-gray-400 text-lg">{selectedHorse.breed}</p>
            </div>
            <div className="bg-gray-900 border border-amber-400/30 rounded-2xl p-6">
              <p className="text-gray-400 text-sm mb-1">Current Price</p>
              <div className="flex items-center space-x-2">
                <FaEthereum className="text-amber-400 text-3xl" />
                <span className="text-amber-400 text-4xl font-black">{selectedHorse.price} ETH</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                <p className="text-gray-500 text-sm mb-1">Age</p>
                <p className="font-bold text-lg text-white">{selectedHorse.age} years</p>
              </div>
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                <p className="text-gray-500 text-sm mb-1">Status</p>
                <p className={`font-bold text-lg ${selectedHorse.isForSale ? 'text-green-400' : 'text-red-400'}`}>
                  {selectedHorse.isForSale ? 'For Sale' : 'Sold'}
                </p>
              </div>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
              <h3 className="text-white font-bold mb-3">Description</h3>
              <p className="text-gray-400 leading-relaxed">{selectedHorse.description}</p>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
              <div className="flex items-center space-x-3">
                <div className="bg-amber-400/10 border border-amber-400/30 rounded-full p-2">
                  <FaUser className="text-amber-400" />
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Current Owner</p>
                  <p className="text-white font-mono font-bold">
                    {formatAddress(selectedHorse.owner)}
                    {isOwner && <span className="ml-2 text-amber-400 text-xs">(You)</span>}
                  </p>
                </div>
              </div>
            </div>
   {selectedHorse.isForSale && !isOwner && (
  <div className="space-y-3">
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={handleBuy}
      disabled={isBuying || !account}
      className="w-full bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-gray-900 font-black py-4 rounded-xl text-xl transition-all duration-200 flex items-center justify-center space-x-3"
    >
      {isBuying ? (
        <span className="flex items-center space-x-2"><FaSpinner className="animate-spin" /><span>Processing...</span></span>
      ) : (
        <span className="flex items-center space-x-2"><FaEthereum /><span>Buy for {selectedHorse.price} ETH</span></span>
      )}
    </motion.button>

    <Link to={`/bank-checkout/${selectedHorse._id}`}>
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="w-full bg-gray-800 hover:bg-gray-700 border-2 border-amber-400/50 hover:border-amber-400 text-white font-black py-4 rounded-xl text-lg transition-all duration-200 flex items-center justify-center space-x-3"
      >
        <FaUniversity className="text-amber-400" />
        <div className="text-left">
          <p className="text-white font-black">Buy with Bank Transfer</p>
          <p className="text-amber-400 text-xs font-medium">Pay in Moroccan Dirhams (MAD)</p>
        </div>
      </motion.button>
    </Link>
  </div>
)}
            {isOwner && (
              <div className="bg-gray-800 border border-gray-700 rounded-xl p-4 text-center">
                <p className="text-gray-400 text-sm">You own this horse</p>
              </div>
            )}
            {!account && selectedHorse.isForSale && (
              <div className="bg-amber-400/10 border border-amber-400/30 rounded-xl p-4 text-center">
                <p className="text-amber-400 text-sm">Connect your wallet to purchase this horse</p>
              </div>
            )}
          </motion.div>
        </div>
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="mt-10 bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-white font-black text-2xl">Documents</h2>
              <p className="text-gray-400 text-sm">Certificates, pedigree, health records</p>
            </div>
            {isOwner && (
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setShowDocForm(!showDocForm)} className="bg-gradient-to-r from-amber-400 to-orange-500 text-gray-900 font-bold px-4 py-2 rounded-xl flex items-center space-x-2">
                <FaUpload />
                <span>Upload Document</span>
              </motion.button>
            )}
          </div>
          {showDocForm && isOwner && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-gray-800 border border-gray-700 rounded-xl p-5 mb-6">
              <h3 className="text-white font-bold mb-4">Upload New Document</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <input type="text" placeholder="Document name" value={docForm.name} onChange={(e) => setDocForm({ ...docForm, name: e.target.value })} className="bg-gray-700 border border-gray-600 focus:border-amber-400 rounded-xl px-4 py-3 text-white placeholder-gray-500 outline-none" />
                <select value={docForm.type} onChange={(e) => setDocForm({ ...docForm, type: e.target.value })} className="bg-gray-700 border border-gray-600 focus:border-amber-400 rounded-xl px-4 py-3 text-white outline-none">
                  <option value="certificate">Certificate</option>
                  <option value="pedigree">Pedigree</option>
                  <option value="health">Health Record</option>
                  <option value="insurance">Insurance</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="border-2 border-dashed border-gray-600 hover:border-amber-400 rounded-xl p-4 text-center cursor-pointer mb-4 transition-all" onClick={() => document.getElementById('docInput').click()}>
                <FaFile className="text-gray-500 text-3xl mx-auto mb-2" />
                <p className="text-gray-400 text-sm">{docForm.file ? docForm.file.name : 'Click to select file'}</p>
                <input id="docInput" type="file" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" onChange={(e) => setDocForm({ ...docForm, file: e.target.files[0] })} className="hidden" />
              </div>
              <div className="flex space-x-3">
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleUploadDocument} disabled={isUploadingDoc} className="flex-1 bg-gradient-to-r from-amber-400 to-orange-500 text-gray-900 font-bold py-3 rounded-xl flex items-center justify-center space-x-2 disabled:opacity-50">
                  {isUploadingDoc ? (
                    <span className="flex items-center space-x-2"><FaSpinner className="animate-spin" /><span>Uploading...</span></span>
                  ) : (
                    <span className="flex items-center space-x-2"><FaUpload /><span>Upload to IPFS</span></span>
                  )}
                </motion.button>
                <button onClick={() => setShowDocForm(false)} className="px-5 py-3 bg-gray-700 text-gray-300 rounded-xl hover:bg-gray-600 transition-all">Cancel</button>
              </div>
            </motion.div>
          )}
          {documents.length === 0 ? (
            <div className="text-center py-10">
              <FaFile className="text-gray-700 text-5xl mx-auto mb-3" />
              <p className="text-gray-500">No documents uploaded yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {documents.map((doc) => (
                <div key={doc._id} className="bg-gray-800 border border-gray-700 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="bg-amber-400/10 border border-amber-400/30 rounded-lg p-2">
                        <FaFile className="text-amber-400" />
                      </div>
                      <div>
                        <p className="text-white font-medium text-sm">{doc.name}</p>
                        <p className="text-gray-500 text-xs capitalize">{doc.type}</p>
                        {doc.isSigned && (
                          <p className="text-green-400 text-xs">🔐 Cryptographically Signed</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 flex-wrap gap-1">
                      <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer" className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1.5 rounded-lg transition-all">View</a>
                      {isOwner && !doc.isSigned && (
                        <button onClick={() => handleSignDocument(doc._id, doc.name)} className="bg-purple-600 hover:bg-purple-700 text-white text-xs px-3 py-1.5 rounded-lg transition-all">
                          <span>🔐 Sign</span>
                        </button>
                      )}
                      {doc.isSigned && (
                        <button onClick={() => handleVerifyDocument(doc._id)} className="bg-green-600 hover:bg-green-700 text-white text-xs px-3 py-1.5 rounded-lg transition-all">
                          <span>✅ Verify</span>
                        </button>
                      )}
                      {doc.isSigned && (
                        <span className="bg-green-400/10 border border-green-400/30 text-green-400 text-xs px-2 py-1 rounded-full">
                          Signed
                        </span>
                      )}
                      {isOwner && (
                        <button onClick={() => handleDeleteDocument(doc._id)} className="bg-red-600 hover:bg-red-700 text-white text-xs px-3 py-1.5 rounded-lg transition-all">
                          <FaTrash />
                        </button>
                      )}
                    </div>
                  </div>
                  {doc.isSigned && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="border-t border-gray-700 pt-3 mt-3"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="text-gray-400 text-xs mb-1">🔗 Public Verification URL</p>
                          <p className="text-amber-400 text-xs font-mono break-all">
                            {`${window.location.origin}/verify?id=${doc._id}`}
                          </p>
                          <p className="text-gray-600 text-xs mt-1">
                            Anyone can scan this QR code to verify document authenticity
                          </p>
                        </div>
                        <div className="ml-4 bg-white p-2 rounded-xl">
                          <QRCodeSVG
                            value={`${window.location.origin}/verify?id=${doc._id}`}
                            size={80}
                            level="H"
                            includeMargin={false}
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default HorseDetail;