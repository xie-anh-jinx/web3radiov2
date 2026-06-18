const express = require('express');
const db = require('../db');

const router = express.Router();

// Get all whitelisted admins
router.get('/', async (req, res) => {
    try {
        const result = await db.query('SELECT address, chain_type, role FROM admins ORDER BY created_at ASC');
        res.json({ data: result.rows, error: null });
    } catch (error) {
        console.error('Fetch admins error:', error);
        res.status(500).json({ data: null, error: error.message });
    }
});

// Check if a specific address is as admin
router.get('/:address', async (req, res) => {
    try {
        const { address } = req.params;
        const result = await db.query('SELECT * FROM admins WHERE LOWER(address) = LOWER($1)', [address]);
        
        if (result.rows.length === 0) {
            return res.json({ data: null, is_admin: false });
        }
        
        res.json({ data: result.rows[0], is_admin: true });
    } catch (error) {
        console.error('Check admin error:', error);
        res.status(500).json({ data: null, error: error.message });
    }
});

module.exports = router;
