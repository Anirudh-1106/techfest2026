const isProd = process.env.NODE_ENV === "production";

// httpOnly: JavaScript (and so XSS) cannot read the cookie
// secure: cookie is only sent over HTTPS
// sameSite: "lax" locally; "none" in production because the frontend (Netlify)
// and API (Render) are on different sites - CSRF is then blocked by the
// CORS allow-list and the Origin check in middleware/csrf.js
const cookieOptions = {
  httpOnly: true,
  secure: isProd,
  sameSite: isProd ? "none" : "lax"
};

module.exports = cookieOptions;
