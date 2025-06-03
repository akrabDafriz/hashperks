// controllers/transactionController.js
const pool = require('../db');
require('dotenv').config();
const { ethers } = require('ethers');

// Blockchain setup
const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
const contractABI = require('../blockchain/LoyaltyTokenABI.json').abi;
const contractAddress = process.env.CONTRACT_ADDRESS;
const loyaltyToken = new ethers.Contract(contractAddress, contractABI, wallet);
console.log("📦 Backend wallet address:", wallet.address);

exports.createTransaction = async (req, res) => {
  const { membership_id, transaction_type, amount } = req.body;

  if (!['earn', 'redeem'].includes(transaction_type)) {
    return res.status(400).json({ error: 'Invalid transaction type' });
  }

  try {
    const memberRes = await pool.query(
      `SELECT u.wallet_address FROM memberships m
       JOIN users u ON m.customer_id = u.id
       WHERE m.id = $1`,
      [membership_id]
    );

    if (memberRes.rows.length === 0) return res.status(404).json({ error: 'Membership not found' });
    const walletAddress = memberRes.rows[0].wallet_address;

    // Blockchain interaction
    const weiAmount = ethers.parseUnits(amount.toString(), 18);
    let tx;
    if (transaction_type === 'earn') {
      tx = await loyaltyToken.issueTokens(walletAddress, weiAmount);
    } else {
      // Cek saldo terlebih dahulu
      const currentBalance = await loyaltyToken.balanceOf(walletAddress);
      if (currentBalance < weiAmount) {
        return res.status(400).json({ error: 'Insufficient token balance to redeem' });
      }
      tx = await loyaltyToken.redeemTokens(walletAddress, weiAmount);
    }
    
    const receipt = await tx.wait();

    const result = await pool.query(
      `INSERT INTO transactions (membership_id, transaction_type, amount, blockchain_tx_hash)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [membership_id, transaction_type, amount, receipt.hash]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create transaction', detail: err.message });
  }
};

exports.getTransactionHistory = async (req, res) => {
  const { membership_id } = req.params;
  try {
    const result = await pool.query(
      `SELECT id, transaction_type, amount, blockchain_tx_hash, created_at
       FROM transactions
       WHERE membership_id = $1
       ORDER BY created_at DESC`,
      [membership_id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch transaction history', detail: err.message });
  }
};

