# 🎓 CampusScout — Full Stack App

A college ranking and decision tool powered by the US College Scorecard API (500+ schools), React frontend, and Claude AI for personalized school summaries.

---

## 📁 Project Structure

```
campusscout/
├── backend/          Node.js + Express API server
│   ├── routes/
│   │   ├── schools.js    College Scorecard integration
│   │   ├── summary.js    Claude AI proxy
│   │   └── geocode.js    Zip → lat/lng
│   ├── server.js
│   └── package.json
│
├── frontend/         React + Vite app
│   ├── src/
│   │   ├── App.jsx       Main app component
│   │   ├── utils/
│   │   │   ├── criteria.js   Criteria & major definitions
│   │   │   └── scoring.js    Score math & helpers
│   │   └── hooks/
│   │       └── useSchools.js  Data fetching hooks
│   └── package.json
│
└── README.md
```

---

## 🔑 API Keys You Need

### 1. College Scorecard API Key (Free)
This is the US government's college data API — completely free, no credit card.

1. Go to: https://collegescorecard.ed.gov/data/documentation/
2. Click **"Request an API Key"**
3. Fill out the form (name, email, organization = "Personal")
4. You'll receive the key by email within minutes

### 2. Anthropic API Key (For AI Summaries)
Used for the ℹ pros/cons panel on each school card.

1. Go to: https://console.anthropic.com
2. Sign up / log in
3. Click **API Keys** → **Create Key**
4. Copy the key (starts with `sk-ant-...`)
5. Add $5 credit to your account (costs ~$0.003 per summary)

---

## 💻 Running Locally (Step by Step)

### Prerequisites
You need Node.js installed. Check by running:
```bash
node --version
```
If not installed, download from: https://nodejs.org (install the LTS version)

---

### Step 1 — Set up the Backend

Open a terminal and run:

```bash
cd campusscout/backend
npm install
```

Create your environment file:
```bash
cp .env.example .env
```

Open `.env` in any text editor and fill in:
```
SCORECARD_API_KEY=your_key_from_step_1_above
ANTHROPIC_API_KEY=sk-ant-your_key_from_step_2_above
PORT=3001
FRONTEND_URL=http://localhost:5173
```

Start the backend:
```bash
npm run dev
```

You should see:
```
CampusScout backend running on port 3001
  Scorecard API: ✅ configured
  Anthropic API: ✅ configured
```

Test it by opening in your browser: http://localhost:3001/api/health

---

### Step 2 — Set up the Frontend

Open a **second terminal** (keep the backend running) and run:

```bash
cd campusscout/frontend
npm install
```

Create your environment file:
```bash
cp .env.example .env
```

The `.env` file can stay empty for local dev (Vite automatically proxies `/api` calls to `localhost:3001`).

Start the frontend:
```bash
npm run dev
```

You should see:
```
  VITE v5.x.x  ready in 300ms
  ➜  Local:   http://localhost:5173/
```

Open http://localhost:5173 in your browser — CampusScout is running! 🎉

---

## 🚀 Deploying to Production (Free Hosting)

We'll use **GitHub + Render** — both free, both easy.

### Step 1 — Push to GitHub

If you don't have a GitHub account: https://github.com/join

Create a new repository:
1. Go to https://github.com/new
2. Repository name: `campusscout`
3. Set to **Public**
4. Click **Create repository**

Push your code:
```bash
cd campusscout
git init
git add .
git commit -m "Initial CampusScout build"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/campusscout.git
git push -u origin main
```

---

### Step 2 — Deploy the Backend on Render

1. Go to https://render.com and sign up (use your GitHub account)
2. Click **New +** → **Web Service**
3. Connect your GitHub account and select `campusscout`
4. Fill in settings:

   | Setting | Value |
   |---------|-------|
   | Name | `campusscout-api` |
   | Root Directory | `backend` |
   | Runtime | `Node` |
   | Build Command | `npm install` |
   | Start Command | `node server.js` |
   | Instance Type | Free |

5. Click **Add Environment Variable** for each:

   | Key | Value |
   |-----|-------|
   | `SCORECARD_API_KEY` | your College Scorecard key |
   | `ANTHROPIC_API_KEY` | your Anthropic key |
   | `FRONTEND_URL` | https://campusscout.onrender.com (add after frontend is deployed) |

6. Click **Create Web Service**

Render will deploy and give you a URL like:
`https://campusscout-api.onrender.com`

Test it: open `https://campusscout-api.onrender.com/api/health` in your browser.

---

### Step 3 — Deploy the Frontend on Render

1. In Render, click **New +** → **Static Site**
2. Select your `campusscout` repo again
3. Fill in settings:

   | Setting | Value |
   |---------|-------|
   | Name | `campusscout` |
   | Root Directory | `frontend` |
   | Build Command | `npm install && npm run build` |
   | Publish Directory | `dist` |

4. Add environment variable:

   | Key | Value |
   |-----|-------|
   | `VITE_API_URL` | `https://campusscout-api.onrender.com` |

5. Click **Create Static Site**

Your live URL will be: `https://campusscout.onrender.com`

---

### Step 4 — Update Backend CORS

Go back to your backend service on Render:
1. Click **Environment** tab
2. Update `FRONTEND_URL` to your actual frontend URL (e.g. `https://campusscout.onrender.com`)
3. Click **Save Changes** — Render auto-redeploys

---

## 🔄 Updating the App

### Local changes:
1. Edit files in `frontend/src/` or `backend/routes/`
2. Changes appear instantly in your browser (Vite hot reload)

### Push updates to production:
```bash
git add .
git commit -m "describe your changes"
git push
```
Render automatically redeploys both services within ~2 minutes.

---

## 🐛 Troubleshooting

### "Schools not loading" / API error
- Check backend is running: `http://localhost:3001/api/health`
- Verify `SCORECARD_API_KEY` is set correctly in `.env`
- College Scorecard sometimes has brief outages — wait a minute and retry

### "AI summary not working" / 401 error
- Verify `ANTHROPIC_API_KEY` in backend `.env` starts with `sk-ant-`
- Check you have credit at https://console.anthropic.com

### Backend deploys but shows error on Render
- Check the Logs tab in Render for the exact error message
- Most common cause: missing environment variables

### Schools load but distance filter doesn't work
- The geocoding uses OpenStreetMap's free API — make sure the zip code is valid
- Check browser console for geocode errors

### Render "sleeping" after inactivity (free tier)
- Render free tier spins down after 15 minutes of inactivity
- First request after sleep takes ~30 seconds to wake up
- Upgrade to Render Starter ($7/mo) for always-on

---

## 📊 About the Data

Schools come from the **US Department of Education College Scorecard API**:
- Free, no rate limits for reasonable usage
- Updated annually with federal IPEDS data
- Covers ~6,000 accredited US colleges
- Includes: tuition, acceptance rates, SAT/ACT ranges, earnings outcomes, financial aid

Data fields used:
- `admission_rate` → accept_rate, acceptance_ease score
- `sat_scores`, `act_scores` → SAT/ACT filter ranges
- `avg_net_price` → tuition_value score, COA filter
- `earnings.10_yrs_after_entry.median` → job_placement score, ROI score
- `latitude/longitude` → distance filter
- `program_percentage.*` → major availability flags

---

## 💰 Cost Summary

| Item | Cost |
|------|------|
| College Scorecard API | **Free** |
| Render backend (free tier) | **Free** (sleeps after 15min idle) |
| Render frontend (static site) | **Free** |
| Claude API (AI summaries) | ~$0.003 per summary |
| Domain name (optional) | ~$12/yr |
| **Total to get started** | **$0** |

---

## 🗺️ Roadmap

Things you could add next:

- **User accounts** — save favorite schools, return to your ranked list
- **Email alerts** — get notified when a school's acceptance rate changes
- **Application tracker** — track deadlines, essays, requirements per school
- **Scholarship database** — link to merit aid opportunities per school
- **Campus photos** — pull from Google Places API
- **SAT/ACT percentile calculator** — show exactly where your scores land
- **Net price calculator** — estimate aid based on family income

---

Built with ❤️ using React, Node.js, College Scorecard API, and Claude AI.
