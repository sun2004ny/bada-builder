import express from 'express';
// import fetch from 'node-fetch'; // Native fetch used in Node 18+

const router = express.Router();

// Nominatim Search Proxy
router.get('/nominatim/search', async (req, res) => {
    try {
        const { q } = req.query;
        if (!q) {
            return res.status(400).json({ error: 'Query parameter "q" is required' });
        }

        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&countrycodes=in&limit=5`;

        // Add User-Agent as required by Nominatim usage policy
        const headers = {
            'User-Agent': 'BadaBuilder/1.0 (contact@badabuilder.com)'
        };

        const response = await fetch(url, { headers });

        if (!response.ok) {
            throw new Error(`Nominatim API error: ${response.status}`);
        }

        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('Proxy Search Error:', error);
        res.status(500).json({ error: 'Failed to fetch location data' });
    }
});

// Nominatim Reverse Geocoding Proxy
router.get('/nominatim/reverse', async (req, res) => {
    try {
        const { lat, lon } = req.query;
        if (!lat || !lon) {
            return res.status(400).json({ error: 'Parameters "lat" and "lon" are required' });
        }

        const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&addressdetails=1`;

        const headers = {
            'User-Agent': 'BadaBuilder/1.0 (contact@badabuilder.com)'
        };

        const response = await fetch(url, { headers });

        if (!response.ok) {
            // If 403, it might be rate limiting or policy violation
            if (response.status === 403) {
                console.error('Nominatim 403 Forbidden - Check User-Agent or Rate Limits');
            }
            throw new Error(`Nominatim API error: ${response.status}`);
        }

        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('Proxy Reverse Geocode Error:', error);
        res.status(500).json({ error: 'Failed to fetch address data' });
    }
});

export default router;
