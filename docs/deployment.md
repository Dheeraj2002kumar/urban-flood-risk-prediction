# Production Deployment Guide: Vercel + Render

This guide provides step-by-step instructions for deploying the **Urban Flood Risk Prediction System** using:
- **Backend API**: Hosted on **Render** (Free Web Service via Docker / Python)
- **Frontend Web GIS Dashboard**: Hosted on **Vercel** (Global Edge CDN for React + Vite)

---

## Architecture Overview

```
                      ┌────────────────────────────────────────┐
                      │             End User                   │
                      └──────────────────┬─────────────────────┘
                                         │
                                         ▼
                      ┌────────────────────────────────────────┐
                      │          Vercel Edge Network           │
                      │       React 19 + TypeScript SPA        │
                      │   (https://your-app.vercel.app)        │
                      └──────────────────┬─────────────────────┘
                                         │
                                         │ API REST Calls
                                         │ (VITE_API_BASE_URL)
                                         ▼
                      ┌────────────────────────────────────────┐
                      │             Render Cloud               │
                      │           FastAPI Service              │
                      │  (https://your-api.onrender.com)       │
                      │   • Sub-50ms Inference                 │
                      │   • Random Forest & XGBoost Pipelines  │
                      │   • Swagger Docs: /docs                │
                      │   • Health: /health                    │
                      └────────────────────────────────────────┘
```

---

## Step 1: Push Local Code to GitHub

If you haven't pushed your latest code to GitHub yet, run the following commands:

```bash
# Check git status
git status

# Stage all files
git add .

# Commit changes
git commit -m "feat: complete end-to-end urban flood risk prediction system with best UI, docs, and deployment configs"

# Set remote origin (replace with your repo URL if needed)
# git remote add origin https://github.com/<your-username>/urban-food-risk-prediction.git

# Push to GitHub
git push -u origin master
```

---

## Step 2: Deploy Backend to Render

### Method A: One-Click Blueprint (`render.yaml`)

1. Log in to [Render](https://dashboard.render.com/).
2. In the top-right corner, click **New +** $\rightarrow$ **Blueprint**.
3. Select your GitHub repository (`urban-food-risk-prediction`).
4. Render will automatically detect [`render.yaml`](../render.yaml) and configure:
   - **Service Name**: `urban-flood-risk-api`
   - **Runtime**: Docker (`backend/Dockerfile` with context `.`)
   - **Health Check**: `/health`
   - **Plan**: Free
5. Click **Apply**.
6. Once deployed (typically 2–3 minutes), Render will assign a public URL, for example:
   ```
   https://urban-flood-risk-api.onrender.com
   ```
7. Verify by opening in your browser:
   - Health check: `https://your-api.onrender.com/health` $\rightarrow$ should return `{"status": "healthy"}`
   - Interactive docs: `https://your-api.onrender.com/docs` $\rightarrow$ Swagger UI

### Method B: Manual Web Service Setup on Render

If you prefer manual configuration:
1. Go to [Render Dashboard](https://dashboard.render.com/) $\rightarrow$ **New +** $\rightarrow$ **Web Service**.
2. Connect your GitHub repository.
3. Configure the settings:
   - **Name**: `urban-flood-risk-api`
   - **Language**: **Docker**
   - **Dockerfile Path**: `./backend/Dockerfile`
   - **Docker Context**: `.`
   - **Region**: Oregon (US West) or Frankfurt (EU)
   - **Instance Type**: **Free**
4. Under **Environment Variables**, add:
   - `ENVIRONMENT` = `production`
   - `PORT` = `8000`
5. Click **Create Web Service**.

> **Note on Render Free Tier**: Free tier instances spin down after 15 minutes of inactivity and take ~30–50 seconds to wake up on the first incoming request.

---

## Step 3: Deploy Frontend to Vercel

1. Log in to [Vercel](https://vercel.com/).
2. Click **Add New...** $\rightarrow$ **Project**.
3. Import your GitHub repository (`urban-food-risk-prediction`).
4. In the **Configure Project** screen:
   - **Project Name**: `urban-flood-risk-prediction` (or custom name)
   - **Framework Preset**: **Vite** (automatically detected)
   - **Root Directory**: Click **Edit** and select `frontend` (or leave default if using root `vercel.json`)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Expand the **Environment Variables** section and add:
   - **Key**: `VITE_API_BASE_URL`
   - **Value**: Your Render Backend URL from Step 2 (e.g., `https://urban-flood-risk-api.onrender.com`)
   *(Do NOT include a trailing slash)*
6. Click **Deploy**.
7. Vercel will build and deploy your application within ~45 seconds and give you a live production URL:
   ```
   https://urban-flood-risk-prediction.vercel.app
   ```

---

## Step 4: Verification & Smoke Testing

Once both services are live:

1. Open your Vercel deployment URL (`https://your-app.vercel.app`).
2. Verify the top header status indicator reads **"API Ready"** with a green glowing badge.
3. On the **Geospatial Vulnerability Map**, verify all 20 Mumbai monitoring stations load with high-contrast markers.
4. Select a station (e.g., *Kurla West (Mithi River Basin)*).
5. Click one of the storm presets (e.g., **Severe Deluge (195mm)** or **Extreme Cloudburst (260mm)**).
6. Click **"Evaluate Flood Inundation Risk"**.
7. Observe the circular SVG probability meter fill and review the dominant physical risk drivers.

---

## Troubleshooting & FAQ

| Issue | Cause | Solution |
|---|---|---|
| Frontend shows **"API Offline"** | Render free instance is cold sleeping. | Open `https://your-api.onrender.com/health` directly in browser to trigger wake-up (~40s), then refresh the frontend. |
| CORS error in browser console | Backend CORS origin mismatch. | The backend is preconfigured with `allow_origins=["*"]`, but ensure the `VITE_API_BASE_URL` has no trailing slash. |
| Vercel page reload gives 404 | Single-page client routing missing rewrite. | Both `frontend/vercel.json` and root `vercel.json` include SPA rewrite rules to route all subpaths to `/index.html`. |
| Out of memory during Render build | Building with too many parallel threads. | The `backend/Dockerfile` uses pre-compiled wheels via pip to maintain minimal RAM usage. |
