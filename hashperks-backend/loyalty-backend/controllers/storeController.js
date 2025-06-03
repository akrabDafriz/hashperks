const pool = require('../db');

exports.getAllStores = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM stores');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch stores' });
  }
};

exports.getStoreById = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM stores WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Store not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch store' });
  }
};

exports.createStore = async (req, res) => {
  const { user_id, business_name, description, location } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO stores (user_id, business_name, description, location)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [user_id, business_name, description, location]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create store' });
  }
};

exports.updateStore = async (req, res) => {
  const { business_name, description, location } = req.body;
  try {
    const result = await pool.query(
      `UPDATE stores SET business_name = $1, description = $2, location = $3, updated_at = NOW()
       WHERE id = $4 RETURNING *`,
      [business_name, description, location, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update store' });
  }
};

exports.deleteStore = async (req, res) => {
  try {
    await pool.query('DELETE FROM stores WHERE id = $1', [req.params.id]);
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete store' });
  }
};

exports.getAllStores = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT s.id, s.business_name, s.description, s.location, u.name AS owner_name
       FROM stores s
       JOIN users u ON s.user_id = u.id`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch stores', detail: err.message });
  }
};

exports.getLoyaltyProgramsByStore = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `SELECT id, program_name, description, token_exchange_rate
       FROM loyalty_programs
       WHERE business_id = $1`,
      [id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch loyalty programs', detail: err.message });
  }
};
