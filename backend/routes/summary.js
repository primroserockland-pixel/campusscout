const express = require('express');
const fetch = require('node-fetch');
const NodeCache = require('node-cache');
const router = express.Router();

// Cache summaries for 7 days
const summaryCache = new NodeCache({ stdTTL: 604800 });

// POST /api/summary
router.post('/', async (req, res) => {
  try {
    const { school, majorLabel, majorType } = req.body;
    if (!school || !majorLabel) {
      return res.status(400).json({ error: 'school and majorLabel are required' });
    }

    const cacheKey = `summary_${school.id}_${majorType}`;
    const cached = summaryCache.get(cacheKey);
    if (cached) return res.json(cached);

    const apiKey = process.env.ANTHROPIC_API_KEY;

    // If no key or placeholder, return a helpful default
    if (!apiKey || apiKey === 'skip_for_now') {
      return res.json({
        pros: [
          `${school.name} is located in ${school.location}`,
          school.accept_rate ? `${school.accept_rate}% acceptance rate — ${school.accept_rate <= 20 ? 'very selective' : school.accept_rate <= 50 ? 'moderately selective' : 'accessible'}` : 'Admissions data available on school website',
          school.coa_net ? `Average net price ~$${Math.round(school.coa_net/1000)}K/yr after aid` : 'Check school website for financial aid details',
          school.earnings_10yr ? `Graduates earn ~$${Math.round(school.earnings_10yr/1000)}K median after 10 years` : 'Strong career outcomes reported by alumni',
        ],
        cons: [
          'Add your Anthropic API key to enable personalized AI summaries',
          'Use the ranking criteria scores to compare this school',
          'Visit the school website for program-specific details',
        ],
        bottom_line: `${school.name} — add your Anthropic API key in Render settings to unlock personalized AI insights for ${majorLabel}.`
      });
    }

    const scores = school.data || {};
    const prompt = `You are an expert college counselor writing a concise evaluation for a student interested in ${majorLabel}.

School: ${school.name} (${school.location})
Type: ${school.type}
Acceptance rate: ${school.accept_rate ? school.accept_rate + '%' : 'N/A'}
Average net price: ${school.coa_net ? '$' + Math.round(school.coa_net / 1000) + 'K/yr' : 'N/A'}
10yr median earnings: ${school.earnings_10yr ? '$' + Math.round(school.earnings_10yr / 1000) + 'K' : 'N/A'}
Student enrollment: ${school.size ? school.size.toLocaleString() : 'N/A'}
Scores (1-10): Job Placement ${scores.job_placement || 'N/A'}, ROI ${scores.roi || 'N/A'}, Diversity ${scores.diversity || 'N/A'}

Return ONLY valid JSON with no markdown or extra text:
{"pros":["pro 1","pro 2","pro 3","pro 4"],"cons":["con 1","con 2","con 3"],"bottom_line":"One sentence for a ${majorLabel} student."}

Rules: Each item max 12 words. Be specific and honest. No generic statements.`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-opus-4-5',
        max_tokens: 500,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Anthropic API ${response.status}: ${errText.slice(0, 200)}`);
    }

    const data = await response.json();
    const text = data.content?.[0]?.text || '';
    // Strip any markdown fences just in case
    const clean = text.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(clean);

    summaryCache.set(cacheKey, parsed);
    res.json(parsed);

  } catch (err) {
    console.error('Summary route error:', err.message);
    // Return a graceful fallback instead of 500
    res.status(200).json({
      pros: ['Check the school\'s official website for program details', 'Review the scoring criteria above for comparison', 'Contact admissions for major-specific information', 'Schedule a campus visit for a personal assessment'],
      cons: ['AI summary temporarily unavailable', `Error: ${err.message.slice(0, 80)}`, 'Try again in a moment'],
      bottom_line: 'AI summary unavailable — use the ranking scores above to evaluate this school.'
    });
  }
});

module.exports = router;
