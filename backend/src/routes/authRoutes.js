// authRoutes.js
//
// Routes only define WHICH URL maps to WHICH controller function.
// No business logic lives here — that's the controller's job.

const express = require("express");
const { registerUser, loginUser } = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);

// Step 13: a protected test route. Notice `protect` is passed as a
// second argument, BEFORE the route's own handler — Express runs
// middleware in the order listed, so `protect` runs first and only
// calls next() (letting this handler run) if the JWT is valid.
router.get("/profile", protect, (req, res) => {
  res.status(200).json({
    message: "Protected route accessed",
    user: { id: req.user.id }, // came from the decoded JWT, not a DB lookup
  });
});

module.exports = router;