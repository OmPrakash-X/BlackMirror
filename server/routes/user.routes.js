import express from "express";
import { isAuth } from "../middlewares/isAuth.js";
import {
  getProfile,
  logout,
  login,
  register,
} from "../controllers/user.controller.js";

const userRouter = express.Router();

// Public routes
userRouter.post("/register", register);
userRouter.post("/login", login);

// Protected routes
userRouter.get("/me", isAuth, getProfile);
userRouter.get("/logout", isAuth, logout);

export default userRouter;
