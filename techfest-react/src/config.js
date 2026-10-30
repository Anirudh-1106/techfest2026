// Backend address - set VITE_API_URL on Netlify/Vercel, falls back to local server
export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
