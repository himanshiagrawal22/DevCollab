const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// =========================
// COOKIE OPTIONS
// =========================

const isProduction =
  process.env.NODE_ENV === "production";

const cookieOptions = {
  httpOnly: true,

  // Production (Vercel + Render)
  secure: isProduction,

  // Cross-site cookie needed in production
  sameSite: isProduction ? "none" : "lax",

  maxAge: 7 * 24 * 60 * 60 * 1000,
};

// =========================
// REGISTER USER
// =========================

const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({
      email,
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(
      password,
      10
    );

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Registration failed",
    });
  }
};

// =========================
// LOGIN USER
// =========================

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({
      email,
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const isPasswordCorrect =
      await bcrypt.compare(
        password,
        user.password
      );

    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: "Invalid Password",
      });
    }

    const token = jwt.sign(
      {
        userId: user._id,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    res.cookie(
      "token",
      token,
      cookieOptions
    );

    return res.status(200).json({
      success: true,
      message: "Login Successful",
      token,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Login failed",
    });
  }
};

// =========================
// LOGOUT USER
// =========================

const logoutUser = async (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction
      ? "none"
      : "lax",
  });

  return res.status(200).json({
    success: true,
    message: "Logout successful",
  });
};

// =========================
// GET CURRENT USER
// =========================

const getMe = async (req, res) => {
  try {
    const user = await User.findById(
      req.userId
    ).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch user",
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getMe,
  logoutUser,
};