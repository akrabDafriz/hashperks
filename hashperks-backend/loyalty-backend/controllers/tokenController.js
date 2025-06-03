const pool = require('../db');
const { ethers } = require('ethers');
require('dotenv').config();

const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
const contractABI = require('../blockchain/LoyaltyTokenABI.json').abi;
const contractAddress = process.env.CONTRACT_ADDRESS;
const loyaltyToken = new ethers.Contract(contractAddress, contractABI, provider);

exports.getBalance = async (req, res) => {
  const { user_id } = req.params;

  try {
    const result = await pool.query(
      `SELECT wallet_address FROM users WHERE id = $1`,
      [user_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const walletAddress = result.rows[0].wallet_address;
    const balance = await loyaltyToken.balanceOf(walletAddress);
    const formatted = ethers.formatUnits(balance, 18);

    res.json({ wallet_address: walletAddress, token_balance: formatted });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get token balance', detail: err.message });
  }
};
