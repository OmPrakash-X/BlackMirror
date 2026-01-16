import express from "express";
import {
  createReport,
  getAllReports,
  getUserReports,
  getReportById,
  verifyReport,
  deleteReport,
  getReportPDF,
} from "../controllers/analysisReport.controller.js";
import { isAuth } from "../middlewares/isAuth.js";

const router = express.Router();

// ✅ Create report manually (optional/internal)
router.post("/", isAuth, createReport);

// ✅ Get all reports (admin/analyst)
router.get("/", isAuth, getAllReports);

// ✅ Get reports for logged-in user
router.get("/my-reports", isAuth, getUserReports);

// ✅ Get single report by ID
router.get("/:id", isAuth, getReportById);

// ✅ Verify report (admin)
router.put("/:id/verify", isAuth, verifyReport);

// ✅ Delete report (admin only)
router.delete("/:id", isAuth, deleteReport);

// Add this route for PDF download
router.get("/:id/pdf", isAuth, getReportPDF);


export default router;
