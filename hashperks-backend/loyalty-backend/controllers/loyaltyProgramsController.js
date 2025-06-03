const pool = require('../db');

exports.createLoyaltyProgram = async (req, res) => {
  const { id: store_id } = req.params;
  const { program_name, description, token_exchange_rate } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO loyalty_programs (business_id, program_name, description, token_exchange_rate)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [store_id, program_name, description, token_exchange_rate]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create loyalty program', detail: err.message });
  }
};
