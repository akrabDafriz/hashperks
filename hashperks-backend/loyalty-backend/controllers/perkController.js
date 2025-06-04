const pool = require('../db');

exports.listPerksForProgram = async (req, res) => {
    const { loyaltyProgramId } = req.params;
    try {
        const result = await pool.query(
            'SELECT * FROM perks WHERE loyalty_program_id = $1 ORDER BY points_required ASC, name ASC',
            [loyaltyProgramId]
        );
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching perks for program:', err);
        res.status(500).json({ error: 'Failed to fetch perks', detail: err.message });
    }
};

exports.createPerk = async (req, res) => {
    const { loyaltyProgramId } = req.params;
    const { name, description, points_required } = req.body;
    const userId = req.user && req.user.id; // Authenticated user's ID

    if (!name || !points_required) {
        return res.status(400).json({ error: 'Perk name and points required are mandatory.' });
    }
    if (isNaN(parseInt(points_required)) || parseInt(points_required) <= 0) {
        return res.status(400).json({ error: 'Points required must be a positive number.' });
    }

    try {
        const authCheck = await pool.query(
            `SELECT s.user_id
             FROM loyalty_programs lp
             JOIN stores s ON lp.store_id = s.id
             WHERE lp.id = $1 AND s.user_id = $2`,
            [loyaltyProgramId, userId]
        );

        if (authCheck.rows.length === 0) {
            return res.status(403).json({ error: 'Forbidden: You do not own the store for this loyalty program.' });
        }

        const result = await pool.query(
            'INSERT INTO perks (loyalty_program_id, name, description, points_required, created_at, updated_at) VALUES ($1, $2, $3, $4, NOW(), NOW()) RETURNING *',
            [loyaltyProgramId, name, description, parseInt(points_required)]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Error creating perk:', err);
        // Handle potential unique constraint on perk name for a program if you add one
        res.status(500).json({ error: 'Failed to create perk', detail: err.message });
    }
};
