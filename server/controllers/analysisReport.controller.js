
import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../middlewares/error.middleware.js";
import AnalysisJob from "../models/analysisJob.model.js";
import AnalysisReport from "../models/analysisReport.model.js";
import PDFDocument from 'pdfkit';
import fs from 'fs';


// Create report (called internally after job completes)

export const createReport = catchAsyncErrors(async (req, res, next) => {
  const { jobId, analysisResults, threatLevel, pdfReportUrl } = req.body;

  const job = await AnalysisJob.findById(jobId);
  if (!job) return next(new ErrorHandler("Job not found", 404));

  const report = await AnalysisReport.create({
    jobId,
    userId: job.userId,
    mediaType: job.mediaType,
    filename: job.filename,
    analysisResults,
    threatLevel,
    pdfReportUrl,
    status: "pending",
  });

  job.status = "completed";
  job.results = analysisResults;
  await job.save();

  res.status(201).json({
    success: true,
    message: "Report created successfully",
    report,
  });
});

//  Get all reports (admin/analyst)

export const getAllReports = catchAsyncErrors(async (req, res, next) => {
  const reports = await AnalysisReport.find()
    .populate("userId", "email role")
    .populate("jobId", "status");
  res.status(200).json({
    success: true,
    count: reports.length,
    reports,
  });
});

//  Get reports for a single user

export const getUserReports = catchAsyncErrors(async (req, res, next) => {
  const reports = await AnalysisReport.find({ userId: req.userId }).populate(
    "jobId",
    "status"
  );
  res.status(200).json({
    success: true,
    reports,
  });
});

// Get single report by ID

export const getReportById = catchAsyncErrors(async (req, res, next) => {
  const report = await AnalysisReport.findById(req.params.id)
    .populate("userId", "email role")
    .populate("jobId");

  if (!report) return next(new ErrorHandler("Report not found", 404));

  res.status(200).json({
    success: true,
    report,
  });
});

// Update report status (e.g., mark as verified by analyst)

export const verifyReport = catchAsyncErrors(async (req, res, next) => {
  const report = await AnalysisReport.findById(req.params.id);
  if (!report) return next(new ErrorHandler("Report not found", 404));

  report.status = "verified";
  await report.save();

  res.status(200).json({
    success: true,
    message: "Report verified successfully",
    report,
  });
});

// Delete report (optional, admin only)

export const deleteReport = catchAsyncErrors(async (req, res, next) => {
  const report = await AnalysisReport.findById(req.params.id);
  if (!report) return next(new ErrorHandler("Report not found", 404));

  await report.deleteOne();

  res.status(200).json({
    success: true,
    message: "Report deleted successfully",
  });
});




export const getReportPDF = catchAsyncErrors(async (req, res, next) => {
  try {
    const reportId = req.params.id;
    const report = await AnalysisReport.findById(reportId)
      .populate("jobId")
      .populate("userId", "email name");

    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Report not found",
      });
    }

    // Create PDF document with A4 size and optimized margins
    const doc = new PDFDocument({
      size: "A4",
      margin: 40,
      bufferPages: true,
      info: {
        Title: `Deepfake Analysis Report - ${report._id.toString().slice(-8)}`,
        Author: "Deepfake Detection System",
        Subject: "Media Analysis Report",
        Creator: "Team Stack Pirates",
      },
    });

    // Set response headers for PDF download
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="deepfake-analysis-report-${report._id
        .toString()
        .slice(-8)}.pdf"`
    );

    // Pipe PDF to response
    doc.pipe(res);

    // Professional color scheme
    const colors = {
      primary: "#2563eb",
      darkGray: "#1f2937",
      mediumGray: "#6b7280",
      lightGray: "#f3f4f6",
      border: "#e5e7eb",
      success: "#10b981",
      warning: "#f59e0b",
      danger: "#ef4444",
      white: "#ffffff",
    };

    // Page dimensions
    const pageWidth = doc.page.width;
    const pageHeight = doc.page.height;
    const margin = 40;
    const contentWidth = pageWidth - margin * 2;

    // Helper function to safely extract model info
    const getModelInfo = () => {
      try {
        const modelVersions = report.analysisResults.modelVersions;
        if (modelVersions && typeof modelVersions === "object") {
          if (modelVersions instanceof Map) {
            const entries = Array.from(modelVersions.entries());
            return entries.length > 0
              ? { name: entries[0][0], version: entries[0][1] }
              : { name: "EfficientNet-B0", version: "1.0" };
          } else {
            const keys = Object.keys(modelVersions);
            return keys.length > 0
              ? { name: keys[0], version: modelVersions[keys[0]] }
              : { name: "EfficientNet-B0", version: "1.0" };
          }
        }
        return { name: "EfficientNet-B0", version: "1.0" };
      } catch (error) {
        return { name: "EfficientNet-B0", version: "1.0" };
      }
    };

    const formatDate = (date) => {
      return new Date(date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    };

    let currentY = margin;

    // ============================================
    // HEADER SECTION
    // ============================================
    doc
      .fillColor(colors.primary)
      .fontSize(24)
      .font("Helvetica-Bold")
      .text("Deepfake Analysis Report", margin, currentY);

    currentY += 30;

    // Horizontal line
    doc
      .moveTo(margin, currentY)
      .lineTo(pageWidth - margin, currentY)
      .strokeColor(colors.primary)
      .lineWidth(2.5)
      .stroke();

    currentY += 12;

    // Report metadata
    doc
      .fillColor(colors.mediumGray)
      .fontSize(9)
      .font("Helvetica")
      .text(
        `Report ID: ${report._id
          .toString()
          .slice(-8)
          .toUpperCase()} | Generated: ${formatDate(new Date())}`,
        margin,
        currentY
      );

    currentY += 22;

    // Helper function for clean info rows
    const drawInfoRow = (label, value, y) => {
      doc
        .fillColor(colors.mediumGray)
        .fontSize(9)
        .font("Helvetica")
        .text(label + ":", margin, y, { width: 120, continued: false });

      doc
        .fillColor(colors.darkGray)
        .fontSize(9)
        .font("Helvetica-Bold")
        .text(value, margin + 125, y, { width: contentWidth - 125 });
    };

    // ============================================
    // THREAT ASSESSMENT BOX
    // ============================================
    doc
      .fillColor(colors.darkGray)
      .fontSize(14)
      .font("Helvetica-Bold")
      .text("Threat Assessment", margin, currentY);

    currentY += 20;

    // Threat level determination
    const threatLevel =
      report.threatLevel === "HIGHRISK"
        ? "HIGH RISK"
        : report.threatLevel === "SUSPICIOUS"
        ? "SUSPICIOUS"
        : "LOW RISK";

    const threatColor =
      report.threatLevel === "HIGHRISK"
        ? colors.danger
        : report.threatLevel === "SUSPICIOUS"
        ? colors.warning
        : colors.success;

    // Box container
    const boxHeight = 55;
    doc
      .rect(margin, currentY, contentWidth, boxHeight)
      .fillColor(colors.lightGray)
      .fill();

    // Left colored accent bar
    doc.rect(margin, currentY, 5, boxHeight).fillColor(threatColor).fill();

    // Classification label and value
    doc
      .fillColor(colors.mediumGray)
      .fontSize(8)
      .font("Helvetica")
      .text("CLASSIFICATION", margin + 18, currentY + 12);

    doc
      .fillColor(threatColor)
      .fontSize(20)
      .font("Helvetica-Bold")
      .text(threatLevel, margin + 18, currentY + 26);

    // Calculate scores
    const deepfakeScore = ((report.analysisResults?.score || 0) * 100).toFixed(1);
    const confidenceScore = ((report.analysisResults?.confidence || 0) * 100).toFixed(1);

    // Column layout
    const col1X = pageWidth - margin - 250;
    const col2X = pageWidth - margin - 115;
    const colWidth = 115;

    // DEEPFAKE PROBABILITY
    doc
      .fillColor(colors.mediumGray)
      .fontSize(7.5)
      .font("Helvetica")
      .text("DEEPFAKE", col1X, currentY + 12, {
        width: colWidth,
        align: "center",
      });

    doc
      .fillColor(colors.mediumGray)
      .fontSize(7.5)
      .font("Helvetica")
      .text("PROBABILITY", col1X, currentY + 21, {
        width: colWidth,
        align: "center",
      });

    doc
      .fillColor(colors.danger)
      .fontSize(20)
      .font("Helvetica-Bold")
      .text(`${deepfakeScore}%`, col1X, currentY + 31, {
        width: colWidth,
        align: "center",
      });

    // CONFIDENCE
    doc
      .fillColor(colors.mediumGray)
      .fontSize(7.5)
      .font("Helvetica")
      .text("CONFIDENCE", col2X, currentY + 16, {
        width: colWidth,
        align: "center",
      });

    doc
      .fillColor(colors.darkGray)
      .fontSize(20)
      .font("Helvetica-Bold")
      .text(`${confidenceScore}%`, col2X, currentY + 31, {
        width: colWidth,
        align: "center",
      });

    currentY += boxHeight + 18;

    // ============================================
    // MEDIA INFORMATION
    // ============================================
    doc
      .fillColor(colors.darkGray)
      .fontSize(14)
      .font("Helvetica-Bold")
      .text("Media Information", margin, currentY);

    currentY += 18;

    drawInfoRow("File Name", report.filename || "Unknown", currentY);
    currentY += 15;

    drawInfoRow(
      "Media Type",
      (report.mediaType || "unknown").toUpperCase(),
      currentY
    );
    currentY += 15;

    drawInfoRow("Analysis Date", formatDate(report.createdAt), currentY);
    currentY += 15;

    drawInfoRow(
      "Processing Time",
      `${report.jobId?.processingTime || "N/A"} seconds`,
      currentY
    );
    currentY += 15;

    drawInfoRow("User", report.userId?.email || "Unknown", currentY);
    currentY += 22;

    // ============================================
    // TECHNICAL DETAILS
    // ============================================
    doc
      .fillColor(colors.darkGray)
      .fontSize(14)
      .font("Helvetica-Bold")
      .text("Technical Details", margin, currentY);

    currentY += 18;

    const modelInfo = getModelInfo();

    drawInfoRow(
      "AI Model",
      `${modelInfo.name} v${modelInfo.version}`,
      currentY
    );
    currentY += 15;

    drawInfoRow(
      "Algorithm Type",
      "Convolutional Neural Network (CNN)",
      currentY
    );
    currentY += 15;

    drawInfoRow(
      "Detection Method",
      "Pattern Recognition & Artifact Analysis",
      currentY
    );
    currentY += 15;

    const tamperedRegions = report.analysisResults?.tamperRegions
      ? `${report.analysisResults.tamperRegions.length} region(s) detected`
      : "None detected";
    drawInfoRow("Tampered Regions", tamperedRegions, currentY);
    currentY += 22;

    // ============================================
    // ANALYSIS SUMMARY
    // ============================================
    doc
      .fillColor(colors.darkGray)
      .fontSize(14)
      .font("Helvetica-Bold")
      .text("Analysis Summary", margin, currentY);

    currentY += 16;

    doc
      .fillColor(colors.darkGray)
      .fontSize(8.5)
      .font("Helvetica")
      .text(
        "This analysis was performed using state-of-the-art AI algorithms designed to detect digital media manipulation, including deepfakes and face swaps. The system analyzes pixel-level inconsistencies, temporal artifacts, and neural patterns to determine the likelihood of manipulation.",
        margin,
        currentY,
        {
          width: contentWidth,
          align: "justify",
          lineGap: 1.3,
        }
      );

    currentY += 34;

    // Risk description
    const riskDescription =
      report.threatLevel === "HIGHRISK"
        ? "High probability of manipulation detected. The media exhibits significant anomalies consistent with deepfake technology. Immediate expert review and verification are strongly recommended."
        : report.threatLevel === "SUSPICIOUS"
        ? "Suspicious patterns detected in the media. While not definitively manipulated, the content shows characteristics that warrant further investigation. Manual expert review is recommended."
        : "Low risk of manipulation detected. The media appears to be authentic with no significant indicators of deepfake technology. Standard verification procedures still apply.";

    doc
      .fillColor(colors.darkGray)
      .fontSize(8.5)
      .font("Helvetica")
      .text(riskDescription, margin, currentY, {
        width: contentWidth,
        align: "justify",
        lineGap: 1.3,
      });

    // ============================================
    // FOOTER - FIXED AT BOTTOM
    // ============================================
    // ✅ Calculate fixed footer position from bottom of page
    const footerStartY = pageHeight - margin - 50; // 50px from bottom

    // Separator line
    doc
      .moveTo(margin, footerStartY)
      .lineTo(pageWidth - margin, footerStartY)
      .strokeColor(colors.border)
      .lineWidth(0.5)
      .stroke();

    // Disclaimer header
    doc
      .fillColor(colors.mediumGray)
      .fontSize(7)
      .font("Helvetica-Bold")
      .text("DISCLAIMER", margin, footerStartY + 8);

    // Disclaimer text
    doc
      .fillColor(colors.mediumGray)
      .fontSize(6.5)
      .font("Helvetica")
      .text(
        "This is an AI-generated report for informational purposes only. Results should be considered alongside human expert analysis. The detection system provides probabilistic assessments and may not identify all forms of media manipulation.",
        margin,
        footerStartY + 16,
        {
          width: contentWidth,
          align: "justify",
          lineGap: 1.0,
        }
      );

    // Page number - at very bottom
    doc
      .fontSize(6)
      .fillColor(colors.mediumGray)
      .text(`Page 1 of 1 | Confidential`, margin, footerStartY + 40, {
        width: contentWidth,
        align: "center",
      });

    // Finalize PDF
    doc.end();
  } catch (error) {
    console.error("PDF generation error:", error);
    return next(new ErrorHandler("Failed to generate PDF report", 500));
  }
});


