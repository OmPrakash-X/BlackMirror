import express from "express";
import { upload } from "../middlewares/multer.js"; 
import {
  uploadAndCreateJob,
  updateJobResult,
  updateJobError,
  getJobById,
  getUserJobs,
  getJobStatus,
} from "../controllers/analysisJob.controller.js";
import { isAuth } from "../middlewares/isAuth.js";

const router = express.Router();

// ✅ Upload & create a new job
router.post("/upload", isAuth, upload.single("file"), uploadAndCreateJob);

// ✅ Update job results after AI processing (called by AI service)
router.patch("/:jobId/result", updateJobResult); // ✅ Changed to PATCH

// ✅ Handle AI service errors
router.patch("/:jobId/error", updateJobError);

// ✅ Get job status (for polling)
router.get("/:jobId/status", isAuth, getJobStatus);

// ✅ Get single job
router.get("/:jobId", isAuth, getJobById);

// ✅ Get all jobs for the logged-in user
router.get("/", isAuth, getUserJobs);

export default router;
