const express = require('express');
const fetch = require('node-fetch');
const NodeCache = require('node-cache');
const router = express.Router();

const geoCache = new NodeCache({ stdTTL: 86400 * 30 }); // 30 days

// GET /api/geocode?zip=02101
router.get('/', async (req, res) => {
  const { zip } = req.query;
  if (!zip || zip.length !== 5) {
    return res.status(400).json({ error: 'Valid 5-digit US zip required' });
  }

  const cached = geoCache.get(zip);
  if (cached) return res.json(cached);

  try {
    const url = `https://nominatim.openstreetmap.org/search?postalcode=${zip}&country=US&format=json&limit=1`;
    const response = await fetch(url, {
      headers: { 'User-Agent': 'CampusScout/1.0' },
      timeout: 8000,
    });

    if (!response.ok) throw new Error('Geocode API error');

    const data = await response.json();
    if (!data?.[0]) return res.status(404).json({ error: 'Zip code not found' });

    const result = {
      lat: parseFloat(data[0].lat),
      lng: parseFloat(data[0].lon),
      displayName: data[0].display_name,
    };

    geoCache.set(zip, result);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
