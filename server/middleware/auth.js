import jwt from "jsonwebtoken";

const verifyToken = (token, secret) =>
  new Promise((resolve, reject) => {
    jwt.verify(token, secret, (err, decoded) => {
      if (err) reject(err);
      else resolve(decoded);
    });
  });

const getUser = (db, userId) =>
  new Promise((resolve, reject) => {
    db.get(
      "SELECT id, username, isAdmin FROM users WHERE id = ?",
      [userId],
      (err, user) => {
        if (err) reject(err);
        else resolve(user);
      }
    );
  });

// Initialize auth middleware with db instance
const initializeAuth = (db) => {
  const authenticateUser = (req, res, next) => {
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    verifyToken(token, process.env.JWT_SECRET)
      .then((decoded) => getUser(db, decoded.id))
      .then((user) => {
        if (!user) {
          return res.status(401).json({ message: "User not found" });
        }
        req.user = user;
        next();
      })
      .catch((err) => {
        console.error("Authentication error:", err);
        return res.status(401).json({ message: "Invalid token" });
      });
  };

  const requireAdmin = (req, res, next) => {
    if (!req.user?.isAdmin) {
      return res.status(403).json({ message: "Admin access required" });
    }
    next();
  };

  return { authenticateUser, requireAdmin };
};

export { initializeAuth };
