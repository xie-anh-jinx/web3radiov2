const express = require('express');
const db = require('../db');

const router = express.Router();

// Get all events (with optional category filter)
router.get('/', async (req, res) => {
    try {
        const { category } = req.query;
        let query = 'SELECT * FROM events';
        let params = [];

        if (category) {
            query += ' WHERE category = $1';
            params.push(category);
        }

        query += ' ORDER BY date ASC';
        
        const result = await db.query(query, params);
        res.json({ data: result.rows, error: null });
    } catch (error) {
        console.error('Fetch events error:', error);
        res.status(500).json({ data: null, error: error.message });
    }
});

// Get event by ID or Slug
router.get('/:idOrSlug', async (req, res) => {
    try {
        const { idOrSlug } = req.params;
        const isId = /^\d+$/.test(idOrSlug);

        const query = isId
            ? 'SELECT * FROM events WHERE id = $1'
            : 'SELECT * FROM events WHERE slug = $1';

        const result = await db.query(query, [idOrSlug]);

        if (result.rows.length === 0) {
            return res.status(404).json({ data: null, error: 'Event not found' });
        }

        res.json({ data: result.rows[0], error: null });
    } catch (error) {
        console.error('Fetch event details error:', error);
        res.status(500).json({ data: null, error: error.message });
    }
});

// Add event
router.post('/', async (req, res) => {
    try {
        const { title, date, location, description, image_url, slug, category } = req.body;

        if (!title || !date || !location || !description) {
            return res.status(400).json({ data: null, error: 'Title, date, location, and description required' });
        }

        const finalSlug = slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
        const finalCategory = category || 'event';

        const result = await db.query(
            'INSERT INTO events (title, date, location, description, image_url, slug, category) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
            [title, date, location, description, image_url || null, finalSlug, finalCategory]
        );

        res.json({ data: result.rows[0], error: null });
    } catch (error) {
        console.error('Add event error:', error);
        res.status(500).json({ data: null, error: error.message });
    }
});

// Update event
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { title, date, location, description, image_url, slug, category } = req.body;

        if (!title || !date || !location || !description) {
            return res.status(400).json({ data: null, error: 'Title, date, location, and description required' });
        }

        const finalSlug = slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

        const result = await db.query(
            'UPDATE events SET title = $1, date = $2, location = $3, description = $4, image_url = $5, slug = $6, category = $7, updated_at = NOW() WHERE id = $8 RETURNING *',
            [title, date, location, description, image_url || null, finalSlug, category || 'event', id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ data: null, error: 'Event not found' });
        }

        res.json({ data: result.rows[0], error: null });
    } catch (error) {
        console.error('Update event error:', error);
        res.status(500).json({ data: null, error: error.message });
    }
});

// Delete event
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await db.query('DELETE FROM events WHERE id = $1', [id]);
        res.json({ error: null });
    } catch (error) {
        console.error('Delete event error:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
