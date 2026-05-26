import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaHorse, FaUpload, FaEthereum, FaSpinner } from 'react-icons/fa';
import { useWeb3 } from '../context/Web3Context';
import { useHorse } from '../context/HorseContext';
import toast from 'react-hot-toast';

const ListHorse = () => {
  const { account } = useWeb3();
  const { createHorse, uploadImage, uploadMetadata, isLoading } = useHorse();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    breed: '',
    age: '',
    price: '',
    description: '',
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState('');

  // ─── Handle Input Change ──────────────────────────────────
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // ─── Handle Image Change ──────────────────────────────────
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // ─── Handle Submit ────────────────────────────────────────
 const handleSubmit = async (e) => {
  e.preventDefault();

  if (!account) {
    toast.error('Please connect your wallet first!');
    return;
  }

  if (!imageFile) {
    toast.error('Please upload a horse image!');
    return;
  }

  try {
    setIsSubmitting(true);

    // Step 1: Upload image to IPFS
    setCurrentStep('Uploading image to IPFS...');
    const ipfsImage = await uploadImage(imageFile);

    // Step 2: Upload metadata to IPFS
    setCurrentStep('Uploading metadata to IPFS...');
    const ipfsMetadata = await uploadMetadata({
      name: formData.name,
      breed: formData.breed,
      age: formData.age,
      price: formData.price,
      description: formData.description,
      imageUrl: ipfsImage.imageUrl,
    });

    // Step 3: Mint NFT on blockchain + Save to MongoDB
    setCurrentStep('Minting NFT on blockchain... 🐴');
    await createHorse({
      ...formData,
      owner: account,
      imageUrl: ipfsImage.imageUrl,
      ipfsHash: ipfsMetadata.ipfsHash,
      metadataUrl: ipfsMetadata.metadataUrl,
    });

    toast.success('🐴 Horse NFT minted successfully!');
    navigate('/marketplace');

  } catch (error) {
    toast.error('Failed to mint NFT: ' + error.message);
    console.error(error);
  } finally {
    setIsSubmitting(false);
    setCurrentStep('');
  }
};

  // ─── Redirect if not connected ────────────────────────────
  if (!account) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gray-900 border border-gray-800 rounded-2xl p-10 text-center max-w-md"
        >
          <FaHorse className="text-amber-400 text-6xl mx-auto mb-6" />
          <h2 className="text-white text-2xl font-black mb-3">Connect Your Wallet</h2>
          <p className="text-gray-400 mb-6">
            You need to connect your MetaMask wallet to list a horse.
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 py-10 px-4">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <h1 className="text-4xl font-black text-white mb-3">
            List Your{' '}
            <span className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
              Horse
            </span>
          </h1>
          <p className="text-gray-400">
            Fill in the details below to list your horse on the blockchain marketplace.
          </p>
        </motion.div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gray-900 border border-gray-800 rounded-2xl p-8"
        >
          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Image Upload */}
            <div>
              <label className="text-gray-300 font-medium mb-2 block">
                Horse Image *
              </label>
              <div
                className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-200 ${
                  imagePreview
                    ? 'border-amber-400'
                    : 'border-gray-700 hover:border-amber-400/50'
                }`}
                onClick={() => document.getElementById('imageInput').click()}
              >
                {imagePreview ? (
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="max-h-48 mx-auto rounded-xl object-cover"
                    />
                    <p className="text-amber-400 text-sm mt-3">
                      Click to change image
                    </p>
                  </div>
                ) : (
                  <div>
                    <FaUpload className="text-gray-600 text-4xl mx-auto mb-3" />
                    <p className="text-gray-400 text-sm">
                      Click to upload horse image
                    </p>
                    <p className="text-gray-600 text-xs mt-1">
                      JPG, PNG, GIF up to 10MB
                    </p>
                  </div>
                )}
                <input
                  id="imageInput"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </div>
            </div>

            {/* Name & Breed */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-gray-300 font-medium mb-2 block">
                  Horse Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Black Thunder"
                  required
                  className="w-full bg-gray-800 border border-gray-700 focus:border-amber-400 rounded-xl px-4 py-3 text-white placeholder-gray-500 outline-none transition-colors"
                />
              </div>

              <div>
                <label className="text-gray-300 font-medium mb-2 block">
                  Breed *
                </label>
                <input
                  type="text"
                  name="breed"
                  value={formData.breed}
                  onChange={handleChange}
                  placeholder="e.g. Arabian"
                  required
                  className="w-full bg-gray-800 border border-gray-700 focus:border-amber-400 rounded-xl px-4 py-3 text-white placeholder-gray-500 outline-none transition-colors"
                />
              </div>
            </div>

            {/* Age & Price */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-gray-300 font-medium mb-2 block">
                  Age (years) *
                </label>
                <input
                  type="number"
                  name="age"
                  value={formData.age}
                  onChange={handleChange}
                  placeholder="e.g. 5"
                  min="0"
                  max="40"
                  required
                  className="w-full bg-gray-800 border border-gray-700 focus:border-amber-400 rounded-xl px-4 py-3 text-white placeholder-gray-500 outline-none transition-colors"
                />
              </div>

              <div>
                <label className="text-gray-300 font-medium mb-2 block">
                  Price (ETH) *
                </label>
                <div className="relative">
                  <FaEthereum className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-400" />
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    placeholder="e.g. 0.5"
                    step="0.001"
                    min="0"
                    required
                    className="w-full bg-gray-800 border border-gray-700 focus:border-amber-400 rounded-xl pl-10 pr-4 py-3 text-white placeholder-gray-500 outline-none transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="text-gray-300 font-medium mb-2 block">
                Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe your horse — temperament, training, health, history..."
                required
                rows={4}
                className="w-full bg-gray-800 border border-gray-700 focus:border-amber-400 rounded-xl px-4 py-3 text-white placeholder-gray-500 outline-none transition-colors resize-none"
              />
            </div>

            {/* Submission Status */}
            {isSubmitting && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-amber-400/10 border border-amber-400/30 rounded-xl p-4 flex items-center space-x-3"
              >
                <FaSpinner className="text-amber-400 animate-spin" />
                <span className="text-amber-400 text-sm font-medium">
                  {currentStep}
                </span>
              </motion.div>
            )}

            {/* Submit Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-gray-900 font-black py-4 rounded-xl text-lg transition-all duration-200 flex items-center justify-center space-x-2"
            >
              {isSubmitting ? (
                <>
                  <FaSpinner className="animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <FaHorse />
                  <span>Mint Horse NFT 🐴</span>
                </>
              )}
            </motion.button>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default ListHorse;