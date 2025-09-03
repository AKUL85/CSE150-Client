# Frontend (React + Vite + Leaflet)

## Local Run
```bash
cd frontend
npm install
cp .env.example .env   # set VITE_API_BASE to your backend URL
npm run dev
```
Open http://localhost:5173

## Build
```bash
npm run build
npm run preview
```

## Deploy
- **Vercel/Netlify**: set environment variable `VITE_API_BASE` to your backend URL (e.g., `https://your-backend.onrender.com`).
