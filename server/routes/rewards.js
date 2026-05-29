const express = require('express');
const db = require('../db');

const router = express.Router();

// Submit listening session
router.post('/submit_session', async (req, res) => {
    try {
        const { userAddress, startTime, endTime, duration, stationId } = req.body;
        
        if (!userAddress || !startTime || !endTime || !duration) {
            return res.status(400).json({ success: false, error: 'Missing required fields' });
        }

        // Insert session
        const sessionResult = await db.query(
            'INSERT INTO listening_sessions (user_address, start_time, end_time, duration, station_id, verified) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
            [userAddress, startTime, endTime, duration, stationId || null, true]
        );

        // Update or insert user stats
        await db.query(`
            INSERT INTO user_stats (user_address, total_listening_time, verified_listening_time)
            VALUES ($1, $2, $2)
            ON CONFLICT (user_address)
            DO UPDATE SET 
                total_listening_time = user_stats.total_listening_time + $2,
                verified_listening_time = user_stats.verified_listening_time + $2,
                updated_at = NOW()
        `, [userAddress, duration]);

        res.json({ success: true, verifiedTime: duration, sessionId: sessionResult.rows[0].id });
    } catch (error) {
        console.error('Submit session error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get listening time
router.get('/listening_time/:userAddress', async (req, res) => {
    try {
        const { userAddress } = req.params;
        
        const result = await db.query(
            'SELECT verified_listening_time FROM user_stats WHERE user_address = $1',
            [userAddress]
        );

        const totalListeningTime = result.rows.length > 0 ? result.rows[0].verified_listening_time : 0;
        res.json({ totalListeningTime });
    } catch (error) {
        console.error('Get listening time error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Claim reward (mock implementation for local dev)
router.post('/claim_reward', async (req, res) => {
    try {
        const { userAddress } = req.body;
        
        // Mocking the reward claim signature for local dev
        const rewardData = {
            userAddress,
            listeningTime: 3600,
            rewardAmount: "1000000000000000000", // 1 W3R
            signature: "mock_signature_for_local_dev",
            nonce: Date.now()
        };

        // Insert into reward_claims
        await db.query(
            'INSERT INTO reward_claims (user_address, listening_time, reward_amount, signature, nonce) VALUES ($1, $2, $3, $4, $5)',
            [rewardData.userAddress, rewardData.listeningTime, rewardData.rewardAmount, rewardData.signature, rewardData.nonce]
        );

        res.json(rewardData);
    } catch (error) {
        console.error('Claim reward error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Check eligibility
router.get('/eligibility/:userAddress', async (req, res) => {
    try {
        const { userAddress } = req.params;
        
        const result = await db.query(
            'SELECT verified_listening_time FROM user_stats WHERE user_address = $1',
            [userAddress]
        );

        const listeningTime = result.rows.length > 0 ? result.rows[0].verified_listening_time : 0;
        
        // Mock eligibility logic: 1 hour (3600s) = 1 reward
        const eligible = listeningTime >= 3600;
        const availableRewards = Math.floor(listeningTime / 3600);
        const nextRewardIn = eligible ? 0 : 3600 - (listeningTime % 3600);

        res.json({ eligible, availableRewards, nextRewardIn });
    } catch (error) {
        console.error('Check eligibility error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get crypto price from CoinGecko (Proxy)
router.post('/get_price', async (req, res) => {
    try {
        const { ids, vs_currencies } = req.body;
        
        const response = await fetch(
            `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=${vs_currencies}`
        );
        
        if (!response.ok) {
            throw new Error('CoinGecko API error');
        }
        
        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('Get price error:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
