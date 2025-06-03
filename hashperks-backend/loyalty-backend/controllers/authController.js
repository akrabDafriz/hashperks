//const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../db');
const bcrypt = require('bcryptjs');

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';

exports.register = async (req, res) => {
  const { name, email, password, role, wallet_address } = req.body;
  try {
    const hash = await bcrypt.hash(password, 10);
    const result = await pool.query(
      `INSERT INTO users (name, email, password_hash, role, wallet_address)
       VALUES ($1, $2, $3, $4, $5) RETURNING id, email, role`,
      [name, email, hash, role, wallet_address]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Registration failed', detail: err.message });
    console.log(req.body);
    console.log(err.message);
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await pool.query(
      `SELECT * FROM users WHERE email = $1`,
      [email]
    );
    if (user.rows.length === 0) return res.status(404).json({ error: 'User not found' });

    const valid = await bcrypt.compare(password, user.rows[0].password_hash);
    if (!valid) return res.status(401).json({ error: 'Invalid password' });

    const token = jwt.sign({ id: user.rows[0].id, role: user.rows[0].role }, JWT_SECRET, { expiresIn: '1d' });
    console.log("Berhasil cokkk si anu login: ", email);
    res.json({ token });
  } catch (err) {
    res.status(500).json({ error: 'Login failed', detail: err.message });
  }
};

exports.getAccount = async (req, res) => {
  try {
    const result = await pool.query('SELECT id, name, email, role, wallet_address FROM users WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Account not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch account' });
  }
};

exports.updateAccount = async (req, res) => {
  const { name, wallet_address } = req.body;
  try {
    const result = await pool.query(
      `UPDATE users SET name = $1, wallet_address = $2, updated_at = NOW() WHERE id = $3 RETURNING *`,
      [name, wallet_address, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update account' });
  }
};

exports.deleteAccount = async (req, res) => {
  try {
    await pool.query(`DELETE FROM users WHERE id = $1`, [req.params.id]);
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete account' });
  }
};
