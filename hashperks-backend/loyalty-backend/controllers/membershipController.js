const pool = require('../db');

exports.listMembershipsForStore = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT m.*, u.name AS customer_name FROM memberships m
       JOIN loyalty_programs lp ON m.loyalty_program_id = lp.id
       JOIN users u ON m.customer_id = u.id
       WHERE lp.business_id = $1`,
      [req.params.id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch memberships' });
  }
};


exports.joinMembership = async (req, res) => {
  const { id: store_id } = req.params;
  const customer_id = req.user.id;

  try {
    // Ambil program loyalty toko
    const programRes = await pool.query(
      `SELECT id FROM loyalty_programs WHERE business_id = $1 LIMIT 1`,
      [store_id]
    );
    if (programRes.rows.length === 0) {
      return res.status(404).json({ error: 'Loyalty program not found for this store' });
    }

    const loyalty_program_id = programRes.rows[0].id;

    // Cek apakah sudah join
    const exists = await pool.query(
      `SELECT * FROM memberships WHERE customer_id = $1 AND loyalty_program_id = $2`,
      [customer_id, loyalty_program_id]
    );
    if (exists.rows.length > 0) {
      return res.status(400).json({ error: 'Already joined this loyalty program' });
    }

    const result = await pool.query(
      `INSERT INTO memberships (loyalty_program_id, customer_id)
       VALUES ($1, $2) RETURNING *`,
      [loyalty_program_id, customer_id]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to join loyalty program', detail: err.message });
  }
};

exports.listStoreForMembership = async (req, res) => {
  const customer_id = req.user.id; // Get customer_id from authenticated user
  // console.log(req.user);
  if (!customer_id) {
    return res.status(400).json({ error: 'Customer ID not found in token.' });
  }

  try {
    const query = `
      SELECT
          s.id AS store_id,
          s.business_name,
          s.description AS store_description,
          s.location AS store_location,
          s.user_id AS store_owner_user_id,
          u_owner.name AS store_owner_name,
          lp.id AS loyalty_program_id,
          lp.program_name,
          lp.description AS loyalty_program_description,
          lp.token_exchange_rate,
          m.id AS membership_id,
          m.join_date,
          m.status AS membership_status
      FROM
          memberships m
      JOIN
          loyalty_programs lp ON m.loyalty_program_id = lp.id
      JOIN
          stores s ON lp.business_id = s.id
      JOIN
          users u_owner ON s.user_id = u_owner.id -- Join to get store owner's name
      WHERE
          m.customer_id = $1
      ORDER BY
          s.business_name, lp.program_name;
    `;
    const result = await pool.query(query, [customer_id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User is not a member of any stores yet.' });
    }

    res.json(result.rows);
  } catch (err) {
    console.log("error: ", err);
    console.error('Error fetching member stores:', err);
    res.status(500).json({ error: 'Failed to fetch stores user is a member of', detail: err.message });
  }
};
