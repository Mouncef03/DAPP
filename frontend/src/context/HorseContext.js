import React, { createContext, useContext, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import api from '../utils/api';

const HorseContext = createContext();

export const useHorse = () => useContext(HorseContext);

export const HorseProvider = ({ children }) => {
  const [horses, setHorses] = useState([]);
  const [myHorses, setMyHorses] = useState([]);
  const [selectedHorse, setSelectedHorse] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // ─── Fetch All Horses ─────────────────────────────────────
  const fetchHorses = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/horses');
      setHorses(response.data.data);
    } catch (error) {
      toast.error('Failed to fetch horses');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ─── Fetch My Horses ──────────────────────────────────────
const fetchMyHorses = useCallback(async (walletAddress) => {
  try {
    setIsLoading(true);
    const response = await api.get(`/horses/owner/${walletAddress.toLowerCase()}`);
    setMyHorses(response.data.data);
  } catch (error) {
    toast.error('Failed to fetch your horses');
    console.error(error);
  } finally {
    setIsLoading(false);
  }
}, []);

  // ─── Fetch Single Horse ───────────────────────────────────
  const fetchHorseById = useCallback(async (id) => {
    try {
      setIsLoading(true);
      const response = await api.get(`/horses/${id}`);
      setSelectedHorse(response.data.data);
      return response.data.data;
    } catch (error) {
      toast.error('Failed to fetch horse details');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ─── Create Horse ─────────────────────────────────────────
  const createHorse = useCallback(async (horseData) => {
    try {
      setIsLoading(true);
      const response = await api.post('/horses', horseData);
      setHorses(prev => [response.data.data, ...prev]);
      toast.success('Horse listed successfully! 🐴');
      return response.data.data;
    } catch (error) {
      toast.error('Failed to list horse');
      console.error(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ─── Upload Image to IPFS ─────────────────────────────────
  const uploadImage = useCallback(async (file) => {
    try {
      const formData = new FormData();
      formData.append('image', file);
      const response = await api.post('/ipfs/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    } catch (error) {
      toast.error('Failed to upload image to IPFS');
      throw error;
    }
  }, []);

  // ─── Upload Metadata to IPFS ──────────────────────────────
  const uploadMetadata = useCallback(async (metadata) => {
    try {
      const response = await api.post('/ipfs/metadata', metadata);
      return response.data;
    } catch (error) {
      toast.error('Failed to upload metadata to IPFS');
      throw error;
    }
  }, []);

  return (
    <HorseContext.Provider
      value={{
        horses,
        myHorses,
        selectedHorse,
        isLoading,
        fetchHorses,
        fetchMyHorses,
        fetchHorseById,
        createHorse,
        uploadImage,
        uploadMetadata,
      }}
    >
      {children}
    </HorseContext.Provider>
  );
};