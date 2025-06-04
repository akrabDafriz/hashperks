// In hashperks-backend/loyalty-backend/controllers/loyaltyProgramsController.js
const pool = require('../db');

exports.createLoyaltyProgram = async (req, res) => {
  const { id: storeId } = req.params; // storeId from the route /api/store/:id/loyalty

  const { name, description, points_conversion_rate } = req.body; 
  const userId = req.user && req.user.id; 

  if (!userId) {
    return res.status(403).json({ error: 'User not authenticated.' });
  }
  if (!storeId) {
    return res.status(400).json({ error: 'Store ID is missing in the request path.' });
  }
  if (!name) {
    return res.status(400).json({ error: 'Loyalty program name is required.' });
  }

  try {
    console.log("Berhasil masuk ke create loyal prog");
    const storeCheck = await pool.query(
      'SELECT user_id FROM stores WHERE id = $1',
      [storeId]
    );

    if (storeCheck.rows.length === 0) {
      return res.status(404).json({ error: "Store not found." });
    }
    if (storeCheck.rows[0].user_id !== userId) {
      return res.status(403).json({ error: "Forbidden: You do not own this store and cannot create a loyalty program for it." });
    }

    const isDefaultForStore = true; 
    const actualPointsConversionRate = points_conversion_rate === undefined ? 1.00 : points_conversion_rate;


    console.log("Attempting to create loyalty program with payload:", { storeId, name, description, actualPointsConversionRate, isDefaultForStore });
    console.log("Request body received by controller:", req.body);

    const result = await pool.query(
      `INSERT INTO loyalty_programs (store_id, name, description, points_conversion_rate, is_default_for_store, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, NOW(), NOW()) RETURNING *`,
      [storeId, name, description, actualPointsConversionRate, isDefaultForStore]
    );

    console.log("Loyalty program created successfully:", result.rows[0]);
    res.status(201).json(result.rows[0]);

  } catch (err) {
    console.log(err);
    console.error('Error creating loyalty program:', err); // Log the full error
    console.error('Request body was:', req.body);
    console.error('Store ID was:', storeId);
    res.status(500).json({ error: 'Failed to create loyalty program', detail: err.message });
  }
};