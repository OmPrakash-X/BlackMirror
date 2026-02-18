import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import AnalysisJob from "../models/analysisJob.model.js";
import uploadOnCloudinary from "../configs/cloudinary.js";
import ErrorHandler from "../middlewares/error.middleware.js";
import AnalysisReport from "../models/analysisReport.model.js";
import axios from "axios";
import fs from "fs";

// AI Service URL
const AI_SERVICE_URL = process.env.AI_SERVICE_URL || "http://localhost:8001";

export const uploadAndCreateJob = catchAsyncErrors(async (req, res, next) => {
  if (!req.file) return next(new ErrorHandler("No file uploaded", 400));
  console.log("📁 Uploaded file details:", {
  path: req.file.path,
  exists: fs.existsSync(req.file.path),
  size: req.file.size,
  mimetype: req.file.mimetype
});

  // Upload file using your helper
  const cloudinaryResult = await uploadOnCloudinary(req.file.path);
  console.log("Cloudinary upload result:", cloudinaryResult);

  // ✅ Check if upload failed
  if (!cloudinaryResult || !cloudinaryResult.secure_url) {
    return next(new ErrorHandler("Failed to upload file to Cloudinary", 500));
  }

  const fileUrl = cloudinaryResult.secure_url;

  // Create a new job
  const job = await AnalysisJob.create({
    userId: req.userId,
    filename: req.file.originalname,
    fileUrl: fileUrl,
    mediaType: req.body.mediaType || "image",
    status: "processing",
  });

  // Send to AI service for analysis
  try {
    console.log("🤖 Sending job to AI service...");

    const aiResponse = await axios.post(
      `${AI_SERVICE_URL}/api/analyze`,
      {
        jobId: job._id.toString(),
        fileUrl: fileUrl,
        fileType: req.body.mediaType || "image",
      },
      {
        timeout: 30000,
      }
    );

    console.log("✅ AI service accepted job:", aiResponse.data);
  } catch (error) {
    console.error("❌ Failed to send job to AI service:", error.message);

    // Update job status to failed
    job.status = "failed";
    job.results = {
      error: "Failed to initiate AI analysis",
      timestamp: new Date(),
    };
    await job.save();

    return next(new ErrorHandler("Failed to initiate AI analysis", 500));
  }

  res.status(201).json({
    success: true,
    message: "File uploaded & analysis started",
    job: {
      id: job._id,
      filename: job.filename,
      mediaType: job.mediaType,
      status: job.status,
      createdAt: job.createdAt,
    },
    fileUrl,
  });
});

// ✅ Update job result after AI processing (called by AI service)
export const updateJobResult = catchAsyncErrors(async (req, res, next) => {
  const { jobId } = req.params;
  const {
    score,
    confidence,
    riskLevel,
    modelVersions,
    tamperRegions,
    processingTime,
    metadata,
    perFrameScores,
    frameCount,
  } = req.body;

  console.log("📥 Received AI results for job:", jobId);
  console.log("🎯 Results:", { score, confidence, riskLevel });

  const job = await AnalysisJob.findById(jobId);
  if (!job) {
    return next(new ErrorHandler("Analysis job not found", 404));
  }

  // Update job with results
  job.results = {
    score,
    confidence,
    riskLevel,
    modelVersions,
    tamperRegions: tamperRegions || [],
    metadata,
    perFrameScores,
    frameCount,
  };
  job.status = "completed";
  job.processingTime = processingTime;

  await job.save();

  // Create linked AnalysisReport
  const report = await AnalysisReport.create({
    jobId: job._id,
    userId: job.userId,
    mediaType: job.mediaType,
    filename: job.filename,
    fileUrl: job.fileUrl, // ✅ Added fileUrl
    analysisResults: {
      score,
      confidence,
      riskLevel,
      tamperRegions: tamperRegions || [],
      modelVersions,
    },
    threatLevel: riskLevel || "LOW",
    status: "pending",
  });

  console.log("✅ Job completed and report created:", report._id);

  res.status(200).json({
    success: true,
    message: "Analysis completed successfully",
    job,
    report,
  });
});

// ✅ Handle AI service errors
export const updateJobError = catchAsyncErrors(async (req, res, next) => {
  const { jobId } = req.params;
  const { error } = req.body;

  console.log("❌ Received error for job:", jobId, "Error:", error);

  const job = await AnalysisJob.findById(jobId);
  if (!job) {
    return next(new ErrorHandler("Analysis job not found", 404));
  }

  job.status = "failed";
  job.results = {
    error: error || "Analysis failed",
    timestamp: new Date(),
  };

  await job.save();

  res.status(200).json({
    success: true,
    message: "Job error status updated",
    job,
  });
});

// ✅ Get job by ID
export const getJobById = catchAsyncErrors(async (req, res, next) => {
  const { jobId } = req.params;

  const job = await AnalysisJob.findById(jobId);
  if (!job) {
    return next(new ErrorHandler("Analysis job not found", 404));
  }

  res.status(200).json({
    success: true,
    job,
  });
});

// ✅ Get all jobs for a user
export const getUserJobs = catchAsyncErrors(async (req, res, next) => {
  const userId = req.user._id;

  const jobs = await AnalysisJob.find({ userId }).sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: jobs.length,
    jobs,
  });
});

// ✅ Get job status (for polling)
export const getJobStatus = catchAsyncErrors(async (req, res, next) => {
  const { jobId } = req.params;

  const job = await AnalysisJob.findById(jobId).select(
    "status results processingTime"
  );
  if (!job) {
    return next(new ErrorHandler("Job not found", 404));
  }

  res.status(200).json({
    success: true,
    status: job.status,
    results: job.results,
    processingTime: job.processingTime,
  });
});
