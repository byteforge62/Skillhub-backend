const { verifyAccessToken } = require("../utils/jwt");

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({
      message: "No token provided",
    });
  }

  const [scheme, token] = authHeader.split(" ");

  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({
      message: "Invalid token format",
    });
  }

  try {
    const decoded = verifyAccessToken(token);

    req.user = decoded;

    next();
  } catch (error) {
    return res.status(403).json({
      message: "Invalid or expired token",
    });
  }
};

/**
 * Public endpoints that can personalise their response when a token happens to
 * be present (e.g. RSVP state on the public event list). Invalid tokens are
 * treated as anonymous rather than rejected, so browsing never breaks.
 */
const optionalAuth = (req, _res, next) => {
  const authHeader = req.headers.authorization;

  if (authHeader) {
    const [scheme, token] = authHeader.split(" ");

    if (scheme === "Bearer" && token) {
      try {
        req.user = verifyAccessToken(token);
      } catch (error) {
        req.user = undefined;
      }
    }
  }

  next();
};

const isAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({
      message: "Access Denied, Admins Only",
    });
  }

  next();
};

module.exports = {
  verifyToken,
  optionalAuth,
  isAdmin,
};
