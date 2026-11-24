# Redesigned Homingo frontend

Install Node.js and npm. Then run these commands from this folder.

```sh
npm ci
npm run dev
```

Open http://localhost:5173/. The dashboard and assistant can use the bundled Bhopal shop data while the backend is offline. Live approvals require the separate Homingo FastAPI backend, which defaults to http://127.0.0.1:8000. Set `VITE_API_URL` if the backend runs elsewhere.

Run `npm run build` to create a production build in `dist/`.
