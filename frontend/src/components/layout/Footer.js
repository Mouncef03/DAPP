import React from 'react';
import { Link } from 'react-router-dom';
import { FaHorse, FaGithub, FaTwitter, FaDiscord } from 'react-icons/fa';
import { SiEthereum } from 'react-icons/si';

const Footer = () => {
  return (
    <footer className="bg-gray-900 border-t border-gray-800 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">

          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <FaHorse className="text-amber-400 text-2xl" />
              <span className="text-xl font-bold bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
                HorseChain
              </span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed mb-4">
              The world's first decentralized horse marketplace. Buy, sell, and trade horses securely on the blockchain with IPFS-powered storage.
            </p>
            <div className="flex items-center space-x-2 text-gray-500 text-sm">
              <SiEthereum className="text-purple-400" />
              <span>Powered by Ethereum & IPFS</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              {[
                { label: 'Home', path: '/' },
                { label: 'Marketplace', path: '/marketplace' },
                { label: 'List a Horse', path: '/list-horse' },
                { label: 'My Horses', path: '/my-horses' },
              ].map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-gray-400 hover:text-amber-400 text-sm transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Tech Stack */}
          <div>
            <h3 className="text-white font-semibold mb-4">Built With</h3>
            <ul className="space-y-2">
              {[
                'Solidity Smart Contracts',
                'Hardhat Framework',
                'React.js Frontend',
                'Node.js Backend',
                'MongoDB Database',
                'IPFS via Pinata',
                'MetaMask Wallet',
              ].map((tech) => (
                <li key={tech} className="text-gray-400 text-sm flex items-center space-x-2">
                  <div className="w-1.5 h-1.5 bg-amber-400 rounded-full"></div>
                  <span>{tech}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-500 text-sm">
            © 2026 HorseChain. Built on Blockchain.
          </p>
          <div className="flex items-center space-x-4 mt-4 md:mt-0">
            <a href="#" className="text-gray-500 hover:text-amber-400 transition-colors">
              <FaGithub size={20} />
            </a>
            <a href="#" className="text-gray-500 hover:text-amber-400 transition-colors">
              <FaTwitter size={20} />
            </a>
            <a href="#" className="text-gray-500 hover:text-amber-400 transition-colors">
              <FaDiscord size={20} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;