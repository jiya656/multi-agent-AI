// authController.js
//
// "What should happen when the API receives this request?"
// Controllers hold the actual business logic. Routes just point a URL
// at one of these functions.
//
// Day 42: migrated to asyncHandler + AppError + zod validation.
// Validation now runs BEFORE any database/bcrypt work, so bad input
// never reaches those. Duplicate-email (11000) race condition is now
// caught by errorMiddleware's generic handler, not locally.

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const asyncHandler = require("../middleware/asyncHandler");
const AppError = require("../utils/AppError");
const { registerSchema, loginSchema } = require("../validators/authValidator");

function generateToken(userId) {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: "7d" });
}

// POST /api/auth/register
const registerUser = asyncHandler(async (req, res) => {
  const result = registerSchema.safeParse(req.body);
  if (!result.success) {
    throw new AppError(result.error.issues[0].message, 400);
  }
  const { name, email, password } = result.data;

  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    throw new AppError("A user with that email already exists", 409);
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email, password: hashedPassword });

  res.status(201).json({
    message: "User registered successfully",
    user: { id: user._id, name: user.name, email: user.email },
  });
});

// POST /api/auth/login
const loginUser = asyncHandler(async (req, res) => {
  const result = loginSchema.safeParse(req.body);
  if (!result.success) {
    throw new AppError(result.error.issues[0].message, 400);
  }
  const { email, password } = result.data;

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    // Deliberately vague — same message whether the email doesn't exist
    // or the password is wrong, so an attacker can't enumerate accounts.
    throw new AppError("Invalid email or password", 401);
  }

  const passwordMatches = await bcrypt.compare(password, user.password);
  if (!passwordMatches) {
    throw new AppError("Invalid email or password", 401);
  }

  const token = generateToken(user._id);

  res.status(200).json({
    message: "Login successful",
    token,
    user: { id: user._id, name: user.name, email: user.email },
  });
});

module.exports = { registerUser, loginUser };