import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaShieldAlt, FaSearch, FaCheckCircle, FaTimesCircle, FaFileAlt, FaUser, FaClock } from 'react-icons/fa';
import { MdVerified } from 'react-icons/md';
import api from '../utils/api';
import toast from 'react-hot-toast';

const VerifyDocument = () => {
  const [documentId, setDocumentId] = useState('');
const [isVerifying, setIsVerifying] = useState(false);
const [result, setResult] = useState(null);
const [documentInfo, setDocumentInfo] = useState(null);
const [searchParams] = useSearchParams();

useEffect(() => {
  const idFromUrl = searchParams.get('id');
  if (idFromUrl) {
    setDocumentId(idFromUrl);
  }
}, [searchParams]);

  const handleVerify = async () => {
    if (!documentId.trim()) {
      toast.error('Please enter a document ID');
      return;
    }
    try {
      setIsVerifying(true);
      setResult(null);
      setDocumentInfo(null);

      // Get document info
      const docResponse = await api.get(`/documents/single/${documentId}`);
      setDocumentInfo(docResponse.data.data);

      // Verify signature
      const verifyResponse = await api.get(`/documents/${documentId}/verify`);
      setResult(verifyResponse.data);

    } catch (error) {
      toast.error('Document not found or invalid ID');
      console.error(error);
    } finally {
      setIsVerifying(false);
    }
  };
  return (
    <div className="min-h-screen bg-gray-950 py-10 px-4">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <div className="bg-amber-400/10 border border-amber-400/30 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
            <FaShieldAlt className="text-amber-400 text-4xl" />
          </div>
          <h1 className="text-4xl font-black text-white mb-3">
            Document{' '}
            <span className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
              Verifier
            </span>
          </h1>
          <p className="text-gray-400 text-lg">
            Verify the cryptographic authenticity of any horse document on the blockchain
          </p>
        </motion.div>

        {/* Search Box */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-8">
          <label className="text-gray-300 font-medium mb-3 block">Enter Document ID</label>
          <div className="flex space-x-3">
            <input
              type="text"
              value={documentId}
              onChange={(e) => setDocumentId(e.target.value)}
              placeholder="e.g. 69d14cd7c09d6944584e47fc"
              className="flex-1 bg-gray-800 border border-gray-700 focus:border-amber-400 rounded-xl px-4 py-3 text-white placeholder-gray-500 outline-none transition-colors font-mono text-sm"
              onKeyPress={(e) => e.key === 'Enter' && handleVerify()}
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleVerify}
              disabled={isVerifying}
              className="bg-gradient-to-r from-amber-400 to-orange-500 text-gray-900 font-bold px-6 py-3 rounded-xl flex items-center space-x-2 disabled:opacity-50"
            >
              {isVerifying ? (
                <span className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-gray-900 border-t-transparent rounded-full animate-spin"></div>
                  <span>Verifying...</span>
                </span>
              ) : (
                <span className="flex items-center space-x-2">
                  <FaSearch />
                  <span>Verify</span>
                </span>
              )}
            </motion.button>
          </div>
          <p className="text-gray-600 text-xs mt-2">
            You can find the Document ID in MongoDB Compass or via the API
          </p>
        </motion.div>

        {/* Result */}
        {result && documentInfo && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3 }} className="space-y-6">

            {/* Verification Status */}
            <div className={`border-2 rounded-2xl p-6 text-center ${result.isValid ? 'bg-green-400/10 border-green-400/30' : 'bg-red-400/10 border-red-400/30'}`}>
              <div className="flex justify-center mb-4">
                {result.isValid ? (
                  <div className="bg-green-400/20 rounded-full p-4">
                    <FaCheckCircle className="text-green-400 text-5xl" />
                  </div>
                ) : (
                  <div className="bg-red-400/20 rounded-full p-4">
                    <FaTimesCircle className="text-red-400 text-5xl" />
                  </div>
                )}
              </div>
              <h2 className={`text-2xl font-black mb-2 ${result.isValid ? 'text-green-400' : 'text-red-400'}`}>
                {result.isValid ? '✅ Document is Authentic!' : '❌ Document is Invalid!'}
              </h2>
              <p className="text-gray-400">
                {result.isValid
                  ? 'The cryptographic signature is valid. This document has not been tampered with.'
                  : 'The signature is invalid. This document may have been modified or forged.'}
              </p>
            </div>

            {/* Document Info */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
              <h3 className="text-white font-black text-xl mb-5 flex items-center space-x-2">
                <FaFileAlt className="text-amber-400" />
                <span>Document Information</span>
              </h3>
              <div className="space-y-4">
                {[
                  { label: 'Document Name', value: documentInfo.name, icon: <FaFileAlt className="text-amber-400" /> },
                  { label: 'Document Type', value: documentInfo.type, icon: <FaFileAlt className="text-blue-400" /> },
                  { label: 'Signed By', value: result.recoveredAddress || 'Not signed', icon: <FaUser className="text-purple-400" /> },
                  { label: 'Signed At', value: documentInfo.signedAt ? new Date(documentInfo.signedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Not signed', icon: <FaClock className="text-green-400" /> },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between border-b border-gray-800 pb-3">
                    <div className="flex items-center space-x-2">
                      {item.icon}
                      <span className="text-gray-400 text-sm">{item.label}</span>
                    </div>
                    <span className="text-white font-medium text-sm font-mono">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Cryptographic Details */}
            {result.isValid && (
              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                <h3 className="text-white font-black text-xl mb-5 flex items-center space-x-2">
                  <MdVerified className="text-green-400" />
                  <span>Cryptographic Proof</span>
                </h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-gray-500 text-xs mb-1">Signed Message</p>
                    <p className="text-gray-300 text-xs font-mono bg-gray-800 p-3 rounded-xl break-all">
                      {documentInfo.messageHash}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs mb-1">Digital Signature (ECDSA)</p>
                    <p className="text-amber-400 text-xs font-mono bg-gray-800 p-3 rounded-xl break-all">
                      {documentInfo.signature}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs mb-1">Recovered Signer Address</p>
                    <p className="text-green-400 text-xs font-mono bg-gray-800 p-3 rounded-xl">
                      {result.recoveredAddress}
                    </p>
                  </div>
                </div>
                <div className="mt-4 bg-blue-400/10 border border-blue-400/30 rounded-xl p-4">
                  <p className="text-blue-400 text-xs">
                    🔐 This signature uses <strong>ECDSA (Elliptic Curve Digital Signature Algorithm)</strong> — the same cryptography that secures Ethereum transactions. The signer's private key was used to create this signature, and anyone can verify it using only the public key (wallet address).
                  </p>
                </div>
              </div>
            )}

            {/* View Document */}
            {documentInfo.fileUrl && (
              <a href={documentInfo.fileUrl} target="_blank" rel="noopener noreferrer" className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl text-center transition-all">
                📄 View Original Document on IPFS
              </a>
            )}
          </motion.div>
        )}

        {/* How it works */}
        {!result && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <h3 className="text-white font-bold text-lg mb-4">How it works</h3>
            <div className="space-y-4">
              {[
                { step: '1', title: 'Owner signs document', desc: 'The horse owner signs the document with their private key using ECDSA cryptography', color: 'bg-amber-400' },
                { step: '2', title: 'Signature stored on IPFS', desc: 'The cryptographic signature and document hash are stored permanently', color: 'bg-blue-400' },
                { step: '3', title: 'Anyone can verify', desc: 'Using the public key (wallet address), anyone can verify the signature is valid', color: 'bg-green-400' },
                { step: '4', title: 'Tamper detection', desc: 'If the document is modified, the signature becomes invalid immediately', color: 'bg-red-400' },
              ].map((item) => (
                <div key={item.step} className="flex items-start space-x-4">
                  <div className={`${item.color} text-gray-900 font-black w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-sm`}>
                    {item.step}
                  </div>
                  <div>
                    <p className="text-white font-medium text-sm">{item.title}</p>
                    <p className="text-gray-500 text-xs">{item.desc}</p>
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

export default VerifyDocument;