const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors({
        origin: "http://localhost:5173", // your frontend Vite dev server
        credentials: true, // allow cookies and credentials
    }));
app.use(express.json());

// Import routes
const authRoutes = require('./routes/auth');
const storeRoutes = require('./routes/store');
const loyaltyRoutes = require('./routes/loyaltyPrograms');
const membershipRoutes = require('./routes/membership');
const transactionRoutes = require('./routes/transaction');
const tokenRoutes = require('./routes/token');
const dapatesting = require('./routes/dapatest')


// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/stores',storeRoutes);
//app.use('/api/store',storeRoutes);
app.use('/api/store/:id/loyalty', loyaltyRoutes);
app.use('/api/store/:id/membership', membershipRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/token', tokenRoutes);
app.use('/api/transaction', transactionRoutes);
app.use('/api/stores', loyaltyRoutes);       
app.use('/api/stores', membershipRoutes);
app.use('/api/stores-of-member', dapatesting);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));