require('dotenv').config();
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const schoolsRouter = require('./routes/schools');
const summaryRouter = require('./routes/summary');
const geocodeRouter = require('./routes/geocode');

const app = express();
const PORT = process.env.PORT || 3001;

// Trust Render's proxy (required for rate limiting behind a reverse proxy)
app.set('trust proxy', 1);
app.use(express.json());
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:5173',
    /\.onrender\.com$/,
    /\.netlify\.app$/,
    'http://localhost:3000',
    'http://localhost:5173',
  ],
  credentials: true,
}));

// Rate limiting — prevent abuse
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  message: { error: 'Too many requests, please try again later.' }
});
app.use('/api/', limiter);

// Tighter limit for AI summaries (costs money per call)
const summaryLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 20,
  message: { error: 'Summary rate limit reached, try again in a minute.' }
});
app.use('/api/summary', summaryLimiter);

// ── Routes ────────────────────────────────────────────────────────────────
app.use('/api/schools', schoolsRouter);
app.use('/api/summary', summaryRouter);
app.use('/api/geocode', geocodeRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err.message);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`CampusScout backend running on port ${PORT}`);
  console.log(`  Scorecard API: ${process.env.SCORECARD_API_KEY ? '✅ configured' : '❌ missing'}`);
  console.log(`  Anthropic API: ${process.env.ANTHROPIC_API_KEY ? '✅ configured' : '❌ missing'}`);
});
