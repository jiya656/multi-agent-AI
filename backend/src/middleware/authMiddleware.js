// authMiddleware.js
//
// Middleware = code that runs BETWEEN the incoming request and the
// controller. Its job here: check whether this request is coming from
// someone who's actually logged in, before letting it reach a protected
// controller at all.

const jwt = require("jsonwebtoken");

function protect(req, res, next) {
  // Expected header format: "Authorization: Bearer eyJhbGciOi..."
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Not authorized, no token provided" });
  }

  // "Bearer eyJhbGci..." → split on the space → take the second part
  const token = authHeader.split(" ")[1];

  try {
    // jwt.verify does two things at once: checks the signature is valid
    // (i.e. it was really signed with OUR JWT_SECRET, not forged) AND
    // checks it hasn't expired. Throws if either check fails.
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach the decoded payload (which has { id: userId }) to the
    // request object, so any controller running after this middleware
    // can access req.user.id without re-verifying anything.
    req.user = decoded;

    next(); // hand off to the next middleware / the actual route controller
  } catch (err) {
    return res.status(401).json({ error: "Not authorized, invalid or expired token" });
  }
}

module.exports = { protect };