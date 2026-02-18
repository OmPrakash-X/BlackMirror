import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./database/db.js";
import { errorMiddleware } from "./middlewares/error.middleware.js";
import userRouter from "./routes/user.routes.js";
import analysisJobRouter from "./routes/analysisJob.routes.js";
import analysisReportRouter from "./routes/analysisReport.routes.js";
import cookieParser from "cookie-parser";
import cors from "cors";

dotenv.config();

export const app = express();

// Middlewares
app.use(express.json());
app.use(cookieParser())
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true,
}));

// Routes
app.use("/api/user", userRouter);
app.use("/api/job", analysisJobRouter);
app.use("/api/report", analysisReportRouter);


app.listen(process.env.PORT, () => {
  console.log(`Server is listening at port ${process.env.PORT}`);
  connectDB();
});

app.use(errorMiddleware);
