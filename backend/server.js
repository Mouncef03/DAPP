const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const horseRoutes = require('./routes/horseRoutes');
const ipfsRoutes = require('./routes/ipfsRoutes');
const documentRoutes = require('./routes/documentRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const bankOrderRoutes = require('./routes/bankOrderRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const errorHandler = require('./middleware/errorHandler');

dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get('/', (req, res) => {
  res.json({ message: '🐴 Horse Marketplace API is running!' });
});
app.use('/api/horses', horseRoutes);
app.use('/api/ipfs', ipfsRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/bankorders', bankOrderRoutes);
app.use('/api/notifications', notificationRoutes);


// Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});