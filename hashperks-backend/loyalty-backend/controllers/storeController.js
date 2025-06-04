const pool = require('../db');

exports.createStore = async (req, res) => {
    const { name, description, category, token_contract_address } = req.body;
    const userId = req.user && req.user.id;

    if (!userId) {
        return res.status(403).json({ message: "User not authenticated." });
    }
    if (!name || !token_contract_address) {
        return res.status(400).json({ message: "Store name and token contract address are required." });
    }

    try {
      console.log("Berhasil masuk ke create store backend");
      console.log(req.body);
        const result = await pool.query(
            'INSERT INTO stores (user_id, name, description, category, token_contract_address, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, NOW(), NOW()) RETURNING *',
            [userId, name, description, category, token_contract_address]
        );
        const newStore = result.rows[0];
        res.status(201).json(newStore);
    } catch (error) {
        console.error('Error creating store:', error);
        if (error.code === '23505') { // Unique constraint violation
            if (error.constraint && error.constraint.includes('token_contract_address')) {
              return res.status(409).json({ message: 'Store with this token contract address already exists.' });
            }
            return res.status(409).json({ message: 'Failed to create store due to a unique constraint violation.', detail: error.detail });
        }
        res.status(500).json({ message: 'Error creating store', error: error.message });
    }
};

exports.getAllStores = async (req, res) => {
    try {
        const result = await pool.query('SELECT id, name, description, category FROM stores ORDER BY name ASC');
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching all stores:', err);
        res.status(500).json({ error: 'Failed to fetch stores', detail: err.message });
    }
};

exports.getStoreById = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query(
            `SELECT s.*, lp.id as default_loyalty_program_id 
             FROM stores s
             LEFT JOIN loyalty_programs lp ON lp.store_id = s.id AND lp.is_default_for_store = TRUE
             WHERE s.id = $1`,
            [id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Store not found' });
        }
        res.json(result.rows[0]); 
    } catch (err) {
        console.error('Error fetching store by ID:', err);
        res.status(500).json({ error: 'Failed to fetch store', detail: err.message });
    }
};

exports.getMyStore = async (req, res) => {
    const userId = req.user && req.user.id;

    if (!userId) {
        return res.status(403).json({ message: "User not authenticated." });
    }

    try {
      console.log(req.user);
        const result = await pool.query(
            `SELECT s.*, lp.id as default_loyalty_program_id 
             FROM stores s
             LEFT JOIN loyalty_programs lp ON lp.store_id = s.id AND lp.is_default_for_store = TRUE
             WHERE s.user_id = $1 
             LIMIT 1`,
            [userId]
        );

        if (result.rows.length === 0) {
            return res.status(200).json({ store: null, message: "No store registered for this user." });
        }
        res.json({ store: result.rows[0] });
        console.log(result.rows[0]);
    } catch (error) {
        console.error('Error fetching user\'s store:', error);
        res.status(500).json({ message: 'Error fetching store for user', error: error.message });
    }
};

exports.updateStore = async (req, res) => {
    const storeId = req.params.id;
    const userId = req.user && req.user.id;
    const { name, description, category } = req.body; 

    if (!userId) {
        return res.status(403).json({ message: "User not authenticated." });
    }
    if (!name && !description && !category) {
        return res.status(400).json({ message: "No fields provided for update." });
    }

    try {
        const storeCheck = await pool.query('SELECT user_id FROM stores WHERE id = $1', [storeId]);
        if (storeCheck.rows.length === 0) {
            return res.status(404).json({ error: 'Store not found.' });
        }
        if (storeCheck.rows[0].user_id !== userId) {
            return res.status(403).json({ error: 'Forbidden: You do not own this store.' });
        }

        const fieldsToUpdate = [];
        const values = [];
        let queryParamIndex = 1;

        if (name !== undefined) {
            fieldsToUpdate.push(`name = $${queryParamIndex++}`);
            values.push(name);
        }
        if (description !== undefined) {
            fieldsToUpdate.push(`description = $${queryParamIndex++}`);
            values.push(description);
        }
        if (category !== undefined) {
            fieldsToUpdate.push(`category = $${queryParamIndex++}`);
            values.push(category);
        }
        
        if (fieldsToUpdate.length === 0) {
             return res.status(400).json({ message: "No valid fields provided for update."});
        }

        fieldsToUpdate.push(`updated_at = NOW()`);
        values.push(storeId);

        const result = await pool.query(
            `UPDATE stores SET ${fieldsToUpdate.join(', ')} WHERE id = $${queryParamIndex} RETURNING *`,
            values
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Store not found or update failed.'})
        }
        res.json(result.rows[0]);

    } catch (err) {
        console.error('Error updating store:', err);
        res.status(500).json({ error: 'Failed to update store', detail: err.message });
    }
};

exports.deleteStore = async (req, res) => {
    const storeId = req.params.id;
    const userId = req.user && req.user.id;

    if (!userId) {
        return res.status(403).json({ message: "User not authenticated." });
    }

    try {
        // Verify ownership
        const storeCheck = await pool.query('SELECT user_id FROM stores WHERE id = $1', [storeId]);
        if (storeCheck.rows.length === 0) {
            return res.status(404).json({ error: 'Store not found.' });
        }
        if (storeCheck.rows[0].user_id !== userId) {
            return res.status(403).json({ error: 'Forbidden: You do not own this store.' });
        }

        await pool.query('DELETE FROM stores WHERE id = $1', [storeId]);
        res.status(204).send(); 
    } catch (err) {
        console.error('Error deleting store:', err);
        res.status(500).json({ error: 'Failed to delete store', detail: err.message });
    }
};
