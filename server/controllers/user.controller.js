import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import { sendToken } from "../configs/sendToken.js";
import ErrorHandler from "../middlewares/error.middleware.js";
import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";

/**
 * =========================
 * REGISTER USER 
 * =========================
 */
export const register = catchAsyncErrors(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new ErrorHandler("Email and password are required", 400));
  }

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return next(new ErrorHandler("User already exists. Please login.", 409));
  }

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Create user
  const user = await User.create({
    email,
    password: hashedPassword,
    lastLogin: Date.now(),
  });

  // Send JWT immediately
  sendToken(user, 201, "Registration successful", res);
});

/**
 * =========================
 * LOGIN USER
 * =========================
 */
export const login = catchAsyncErrors(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new ErrorHandler("Email and password are required", 400));
  }

  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    return next(new ErrorHandler("Invalid email or password", 401));
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return next(new ErrorHandler("Invalid email or password", 401));
  }

  user.lastLogin = Date.now();
  await user.save();

  sendToken(user, 200, "Login successful", res);
});

/**
 * =========================
 * GET USER PROFILE
 * =========================
 */
export const getProfile = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.userId).select("-password");

  if (!user) {
    return next(new ErrorHandler("User not found", 404));
  }

  res.status(200).json({
    success: true,
    user,
  });
});

/**
 * =========================
 * LOGOUT USER
 * =========================
 */
export const logout = catchAsyncErrors(async (req, res) => {
  res
    .status(200)
    .cookie("token", null, {
      expires: new Date(Date.now()),
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    })
    .json({
      success: true,
      message: "Logged out successfully",
    });
});
