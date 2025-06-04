// In hashperks-backend/loyalty-backend/controllers/membershipController.js
const pool = require('../db');

// List all members for a specific store's default loyalty program
// The route for this is likely GET /api/store/:storeId/memberships
exports.listMembershipsForStore = async (req, res) => {
  const { id: storeId } = req.params; // storeId from the route

  if (!storeId) {
    return res.status(400).json({ error: 'Store ID is required.' });
  }

  try {
    // First, find the default loyalty program for the given storeId
    const programQuery = await pool.query(
      'SELECT id FROM loyalty_programs WHERE store_id = $1 AND is_default_for_store = TRUE LIMIT 1',
      [storeId]
    );

    if (programQuery.rows.length === 0) {
      return res.status(404).json({ error: 'Default loyalty program not found for this store.' });
    }
    const loyaltyProgramId = programQuery.rows[0].id;

    // Now, fetch memberships for that loyalty program
    const result = await pool.query(
      `SELECT m.id as membership_id, m.join_date, m.points_balance,
              u.id as user_id, u.username, u.email, u.wallet_address
       FROM memberships m
       JOIN users u ON m.user_id = u.id
       WHERE m.loyalty_program_id = $1
       ORDER BY u.username`,
      [loyaltyProgramId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Failed to fetch memberships for store:', err);
    res.status(500).json({ error: 'Failed to fetch memberships for store', detail: err.message });
  }
};

// Allow an authenticated user to join a store's default loyalty program
// The route for this is likely POST /api/store/:storeId/memberships
exports.joinMembership = async (req, res) => {
  const { id: storeId } = req.params; // storeId from the route
  const userId = req.user && req.user.id; // Get user_id from authenticated user (JWT)

  if (!userId) {
    return res.status(403).json({ error: 'User not authenticated.' });
  }
  if (!storeId) {
    return res.status(400).json({ error: 'Store ID is required.' });
  }

  try {
    console.log("Masuk join membership");
    console.log(req.user);
    // Find the default loyalty program for the store
    const programRes = await pool.query(
      `SELECT id FROM loyalty_programs WHERE store_id = $1 AND is_default_for_store = TRUE LIMIT 1`,
      [storeId]
    );

    if (programRes.rows.length === 0) {
      return res.status(404).json({ error: 'Default loyalty program not found for this store.' });
    }
    const loyaltyProgramId = programRes.rows[0].id;

    // Check if the user has already joined this specific loyalty program
    const existingMembership = await pool.query(
      `SELECT id FROM memberships WHERE user_id = $1 AND loyalty_program_id = $2`,
      [userId, loyaltyProgramId]
    );

    if (existingMembership.rows.length > 0) {
      return res.status(409).json({ error: 'User has already joined this loyalty program.' });
    }

    // Create the new membership
    // Initial points_balance is 0 by default from the table schema
    const result = await pool.query(
      `INSERT INTO memberships (user_id, loyalty_program_id, join_date, created_at, updated_at)
       VALUES ($1, $2, NOW(), NOW(), NOW()) RETURNING *`,
      [userId, loyaltyProgramId]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Failed to join loyalty program:', err);
    res.status(500).json({ error: 'Failed to join loyalty program', detail: err.message });
  }
};

// List all loyalty programs (and associated stores) a user is a member of
// The route for this is likely GET /api/memberships/my-programs (or similar)
exports.listProgramsForMember = async (req, res) => {
  const userId = req.user && req.user.id; // Get user_id from authenticated user
  if (!userId) {
    return res.status(403).json({ error: 'User not authenticated.' });
  }

  try {
    const query = `
      SELECT
          s.id AS store_id,
          s.name AS store_name,
          s.description AS store_description,
          s.category AS store_category,
          s.token_contract_address,
          u_owner.username AS store_owner_username,
          lp.id AS loyalty_program_id,
          lp.name AS loyalty_program_name,
          lp.description AS loyalty_program_description,
          lp.points_conversion_rate,
          m.id AS membership_id,
          m.join_date,
          m.points_balance AS current_points_balance
      FROM
          memberships m
      JOIN
          loyalty_programs lp ON m.loyalty_program_id = lp.id
      JOIN
          stores s ON lp.store_id = s.id
      JOIN
          users u_owner ON s.user_id = u_owner.id -- To get store owner's username
      WHERE
          m.user_id = $1
      ORDER BY
          s.name, lp.name;
    `;
    const result = await pool.query(query, [userId]);
    console.log(result.rows);

    // It's okay if a user is not a member of any programs yet
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching member programs:', err);
    res.status(500).json({ error: 'Failed to fetch programs user is a member of', detail: err.message });
  }
};
