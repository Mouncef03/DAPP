import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Web3Provider } from './context/Web3Context';
import { HorseProvider } from './context/HorseContext';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import Home from './pages/Home';
import Marketplace from './pages/Marketplace';
import ListHorse from './pages/ListHorse';
import MyHorses from './pages/MyHorses';
import HorseDetail from './pages/HorseDetail';
import TransactionHistory from './pages/TransactionHistory';
import BankCheckout from './pages/BankCheckout';
import Orders from './pages/Orders';
import Auctions from './pages/Auctions';
import AuctionDetail from './pages/AuctionDetail';
import VerifyDocument from './pages/VerifyDocument';
import Dashboard from './pages/Dashboard';
import './index.css';

function App() {
  return (
    <Web3Provider>
      <HorseProvider>
        <Router>
          <div className="min-h-screen bg-gray-950 text-white flex flex-col">
            <Toaster
              position="top-right"
              toastOptions={{
                style: {
                  background: '#1f2937',
                  color: '#fff',
                  border: '1px solid #374151',
                },
              }}
            />
            <Navbar />
            <main className="flex-grow">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/marketplace" element={<Marketplace />} />
                <Route path="/list-horse" element={<ListHorse />} />
                <Route path="/my-horses" element={<MyHorses />} />
                <Route path="/transactions" element={<TransactionHistory />} />
                <Route path="/bank-checkout/:id" element={<BankCheckout />} />
                <Route path="/orders" element={<Orders />} />
                <Route path="/horse/:id" element={<HorseDetail />} />
                <Route path="/verify" element={<VerifyDocument />} />
                <Route path="/auctions" element={<Auctions />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/auction/:id" element={<AuctionDetail />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </Router>
      </HorseProvider>
    </Web3Provider>
  );
}

export default App;