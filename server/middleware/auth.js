import jwt from "jsonwebtoken";

// Middleware factory function for authentication using JWT
export const authenticateUser = (db) => (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ message: "Authentication required" });
  }

  const jwtSecret = process.env.JWT_SECRET;

  jwt.verify(token, jwtSecret, (err, decodedToken) => {
    if (err) {
      console.error("JWT verification error:", err);
      res.clearCookie("token");
      return res.status(401).json({ message: "Invalid or expired token" });
    }

    db.get(
      "SELECT * FROM users WHERE id = ?",
      [decodedToken.id],
      (err, user) => {
        if (err) {
          console.error("Authentication DB error:", err);
          res.clearCookie("token");
          return res
            .status(500)
            .json({ message: "Database error during authentication" });
        }

        if (!user) {
          res.clearCookie("token");
          return res.status(401).json({ message: "User not found" });
        }

        req.user = user;
        next();
      }
    );
  });
};

// Middleware for requiring admin privileges (does not need db or bcrypt directly)
export const requireAdmin = (req, res, next) => {
  if (!req.user || !req.user.isAdmin) {
    return res.status(403).json({ message: "Admin privileges required" });
  }
  next();
};
