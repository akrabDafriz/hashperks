// In hashperks-backend/loyalty-backend/controllers/transactionController.js
const pool = require('../db');

// Record a new transaction (earn, redeem, etc.)
exports.recordTransaction = async (req, res) => {
    // user_id is the backend ID of the member, if known/registered.
    // member_wallet_address is the blockchain address of the member.
    // store_id is the ID of the store performing the transaction.
    // loyalty_program_id is the ID of the program under which points are issued/redeemed.
    // points_changed: positive for earn, negative for redeem.
    // transaction_type: 'earn', 'redeem_perk', 'redeem_general', 'admin_adjustment'.
    // transaction_hash: blockchain tx hash.
    // notes: optional notes.
    // perk_id: optional, if redeeming a specific perk.
    const { 
        user_id, member_wallet_address, store_id, loyalty_program_id, 
        points_changed, transaction_type, transaction_hash, notes, perk_id 
    } = req.body;

    const authenticatedUserId = req.user && req.user.id; // ID of the user making the API call (e.g., store owner)

    if (!authenticatedUserId) {
        return res.status(403).json({ error: "User not authenticated to record transaction." });
    }

    if (!member_wallet_address || !store_id || !loyalty_program_id || points_changed === undefined || !transaction_type) {
        return res.status(400).json({ error: 'Missing required fields for transaction record.' });
    }
    if (transaction_type === 'earn' && points_changed <= 0) {
        return res.status(400).json({ error: 'Points earned must be positive.' });
    }
    if ((transaction_type === 'redeem_perk' || transaction_type === 'redeem_general') && points_changed >= 0) {
        return res.status(400).json({ error: 'Points redeemed/burned must be negative.' });
    }


    try {
        // Authorization: For 'earn' transactions, check if authenticated user owns the store_id
        if (transaction_type === 'earn') {
            const storeCheck = await pool.query('SELECT user_id FROM stores WHERE id = $1', [store_id]);
            if (storeCheck.rows.length === 0) {
                return res.status(404).json({ error: 'Store not found for transaction.' });
            }
            if (storeCheck.rows[0].user_id !== authenticatedUserId) {
                return res.status(403).json({ error: 'Forbidden: You do not own this store to issue points from.' });
            }
        }
        // Add similar checks for redeem if needed (e.g., user_id matches authenticated user)

        const result = await pool.query(
            `INSERT INTO transactions (user_id, member_wallet_address, store_id, loyalty_program_id, points_changed, transaction_type, transaction_hash, notes, perk_id, created_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW()) RETURNING *`,
            [user_id, member_wallet_address, store_id, loyalty_program_id, points_changed, transaction_type, transaction_hash, notes, perk_id]
        );

        // Optionally, update points_balance in memberships table
        if (user_id && loyalty_program_id) { // Only if we have a backend user and program ID
            await pool.query(
                `UPDATE memberships 
                 SET points_balance = points_balance + $1, updated_at = NOW()
                 WHERE user_id = $2 AND loyalty_program_id = $3`,
                [points_changed, user_id, loyalty_program_id]
            );
             // If no rows updated (user not a member yet), you could auto-create a membership here
             // For simplicity, this is omitted for now.
        }


        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Error recording transaction:', err);
        res.status(500).json({ error: 'Failed to record transaction', detail: err.message });
    }
};

// Add other transaction-related functions here (e.g., list transactions for user, for store)
exports.listTransactionsForStore = async (req, res) => {
    const { storeId } = req.params;
    const authenticatedUserId = req.user && req.user.id;

    try {
        // Authorization: Check if authenticated user owns the store_id
        const storeCheck = await pool.query('SELECT user_id FROM stores WHERE id = $1', [storeId]);
        if (storeCheck.rows.length === 0) {
            return res.status(404).json({ error: 'Store not found.' });
        }
        if (storeCheck.rows[0].user_id !== authenticatedUserId) {
            return res.status(403).json({ error: 'Forbidden: You do not own this store.' });
        }

        const result = await pool.query(
            `SELECT t.*, u.username as member_username 
             FROM transactions t 
             LEFT JOIN users u ON t.user_id = u.id
             WHERE t.store_id = $1 
             ORDER BY t.created_at DESC`,
            [storeId]
        );
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching transactions for store:', err);
        res.status(500).json({ error: 'Failed to fetch transactions', detail: err.message });
    }
};



// // controllers/transactionController.js
// const pool = require('../db');
// require('dotenv').config();
// const { ethers } = require('ethers');

// // Blockchain setup
// const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
// const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
// const contractABI = require('../blockchain/LoyaltyTokenABI.json').abi;
// const contractAddress = process.env.CONTRACT_ADDRESS;
// const loyaltyToken = new ethers.Contract(contractAddress, contractABI, wallet);
// console.log("📦 Backend wallet address:", wallet.address);

// exports.createTransaction = async (req, res) => {
//   const { membership_id, transaction_type, amount } = req.body;

//   if (!['earn', 'redeem'].includes(transaction_type)) {
//     return res.status(400).json({ error: 'Invalid transaction type' });
//   }

//   try {
//     const memberRes = await pool.query(
//       `SELECT u.wallet_address FROM memberships m
//        JOIN users u ON m.customer_id = u.id
//        WHERE m.id = $1`,
//       [membership_id]
//     );

//     if (memberRes.rows.length === 0) return res.status(404).json({ error: 'Membership not found' });
//     const walletAddress = memberRes.rows[0].wallet_address;

//     // Blockchain interaction
//     const weiAmount = ethers.parseUnits(amount.toString(), 18);
//     let tx;
//     if (transaction_type === 'earn') {
//       tx = await loyaltyToken.issueTokens(walletAddress, weiAmount);
//     } else {
//       // Cek saldo terlebih dahulu
//       const currentBalance = await loyaltyToken.balanceOf(walletAddress);
//       if (currentBalance < weiAmount) {
//         return res.status(400).json({ error: 'Insufficient token balance to redeem' });
//       }
//       tx = await loyaltyToken.redeemTokens(walletAddress, weiAmount);
//     }
    
//     const receipt = await tx.wait();

//     const result = await pool.query(
//       `INSERT INTO transactions (membership_id, transaction_type, amount, blockchain_tx_hash)
//        VALUES ($1, $2, $3, $4) RETURNING *`,
//       [membership_id, transaction_type, amount, receipt.hash]
//     );

//     res.status(201).json(result.rows[0]);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: 'Failed to create transaction', detail: err.message });
//   }
// };

// exports.getTransactionHistory = async (req, res) => {
//   const { membership_id } = req.params;
//   try {
//     const result = await pool.query(
//       `SELECT id, transaction_type, amount, blockchain_tx_hash, created_at
//        FROM transactions
//        WHERE membership_id = $1
//        ORDER BY created_at DESC`,
//       [membership_id]
//     );
//     res.json(result.rows);
//   } catch (err) {
//     res.status(500).json({ error: 'Failed to fetch transaction history', detail: err.message });
//   }
// };

