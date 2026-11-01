# People registry: Netlify + Render + Neon

```
project/
├── frontend/   → deploy to Netlify
│   ├── index.html
│   ├── style.css
│   ├── script.js
│   └── netlify.toml
└── backend/    → deploy to Render
    ├── server.js
    ├── package.json
    └── .env.example
```

## 1. Database (Neon)
1. Create a project at https://neon.tech.
2. Copy the **connection string** (it looks like `postgresql://user:pass@host/db?sslmode=require`).
3. You don't need to create the table. The backend creates the `people` table on first start.

## 2. Backend (Render)
1. Push the `backend` folder to a GitHub repo (or push the whole project and set **Root Directory** to `backend`).
2. On https://render.com choose **New → Web Service** and connect the repo.
3. Settings:
   - Runtime: **Node**
   - Build command: `npm install`
   - Start command: `npm start`
   - Root directory: `backend`
4. Under **Environment**, add:
   - `DATABASE_URL` = your Neon connection string
   - `FRONTEND_URL` = your Netlify URL (add it after step 3; use `*` while testing)
5. Deploy and copy the Render URL, e.g. `https://people-backend.onrender.com`.

## 3. Frontend (Netlify)
1. Open `frontend/script.js` and set `API_URL` to your Render URL.
2. On https://netlify.com choose **Add new site → Import from Git** (or drag and drop the `frontend` folder).
3. If using Git: Base directory `frontend`, Build command empty, Publish directory `frontend`.
4. Copy your Netlify URL and put it in `FRONTEND_URL` on Render, then redeploy the backend.

## Test locally
```
cd backend
npm install
cp .env.example .env     # fill in DATABASE_URL
npm run dev
```
Then open `frontend/index.html` in the browser (`API_URL` defaults to `http://localhost:3000`).

Note: Render's free plan sleeps after inactivity, so the first request can take about 30–60 seconds.
