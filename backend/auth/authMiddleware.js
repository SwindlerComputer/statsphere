// auth/authMiddleware.js
import jwt from "jsonwebtoken";

export function authMiddleware(req, res, next) {
  // Try to get token from cookie first
  let token = req.cookies.token;

  // If no cookie, check Authorization header (for incognito / cross-site)
  // Frontend sends: Authorization: Bearer <token>
  if (!token && req.headers.authorization) {
    const parts = req.headers.authorization.split(" ");
    if (parts[0] === "Bearer" && parts[1]) {
      token = parts[1];
    }
  }

  if (!token) {
    return res.status(401).json({ message: "Not authorized" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // gives us { id, email, name }
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
}
