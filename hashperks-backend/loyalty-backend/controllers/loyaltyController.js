const pool = require('../db');

exports.getLoyaltyProgram = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM loyalty_programs WHERE id = $1 AND business_id = $2`,
      [req.params.lid, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Loyalty program not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch loyalty program' });
  }
};

exports.createLoyaltyProgram = async (req, res) => {
  const { program_name, description, token_exchange_rate } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO loyalty_programs (business_id, program_name, description, token_exchange_rate)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [req.params.id, program_name, description, token_exchange_rate]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create loyalty program' });
  }
};

exports.updateLoyaltyProgram = async (req, res) => {
  const { program_name, description, token_exchange_rate } = req.body;
  try {
    const result = await pool.query(
      `UPDATE loyalty_programs SET program_name = $1, description = $2, token_exchange_rate = $3, updated_at = NOW()
       WHERE id = $4 AND business_id = $5 RETURNING *`,
      [program_name, description, token_exchange_rate, req.params.lid, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update loyalty program' });
  }
};

exports.deleteLoyaltyProgram = async (req, res) => {
  try {
    await pool.query(
      `DELETE FROM loyalty_programs WHERE id = $1 AND business_id = $2`,
      [req.params.lid, req.params.id]
    );
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete loyalty program' });
  }
};
