// authController.js
//
// "What should happen when the API receives this request?"
// Controllers hold the actual business logic. Routes just point a URL
// at one of these functions.

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Small helper so we don't repeat this logic in both register and login.
function generateToken(userId) {
  return jwt.sign(
    { id: userId },           // payload: what's encoded inside the token
    process.env.JWT_SECRET,   // secret used to SIGN the token (proves it's really from us)
    { expiresIn: "7d" }       // token becomes invalid after 7 days
  );
}

// POST /api/auth/register
async function registerUser(req, res) {
  try {
    const { name, email, password } = req.body;

    // 1. Check required fields
    if (!name || !email || !password) {
      return res.status(400).json({ error: "name, email, and password are all required" });
    }

    // 2. Check whether email already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({ error: "A user with that email already exists" });
    }

    // 3. Hash the password — NEVER store the plain password.
    // The "10" is the salt rounds: how much computational work bcrypt does.
    // Higher = slower to hash (and slower for an attacker to brute-force
    // guess), but also slower for legitimate logins. 10 is a common default.
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4. Create the user with the HASHED password, not the original.
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    // 5. Send response — deliberately not sending the password back,
    // hashed or not. The frontend doesn't need it.
    res.status(201).json({
      message: "User registered successfully",
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ error: "A user with that email already exists" });
    }
    console.error(err);
    res.status(500).json({ error: "Something went wrong during registration" });
  }
}

// POST /api/auth/login
async function loginUser(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "email and password are required" });
    }

    // Find the user by email
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      // Deliberately vague: we don't say "email not found" vs "wrong
      // password" separately. That would let an attacker enumerate which
      // emails are registered. Same generic message either way.
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // bcrypt.compare hashes the incoming plain password the same way and
    // checks if it matches the stored hash — we never "un-hash" anything.
    const passwordMatches = await bcrypt.compare(password, user.password);
    if (!passwordMatches) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const token = generateToken(user._id);

    res.status(200).json({
      message: "Login successful",
      token,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong during login" });
  }
}

module.exports = { registerUser, loginUser };