import mongoose from "mongoose";

const analysisReportSchema = new mongoose.Schema(
  {
    jobId: { type: mongoose.Schema.Types.ObjectId, ref: "AnalysisJob", required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    filename: { type: String, required: true },
    fileUrl: { type: String, required: true }, // 🔥 keep media reference
    mediaType: { type: String, enum: ["video", "image", "audio"], required: true },

    analysisResults: {
      score: Number,
      confidence: Number,
      riskLevel: { type: String, enum: ["LOW", "SUSPICIOUS", "HIGHRISK"] },
      tamperRegions: [{ x: Number, y: Number, w: Number, h: Number }],
      modelVersions: { type: Map, of: String },
    },

    threatLevel: {
      type: String,
      enum: ["LOW", "SUSPICIOUS", "HIGHRISK"],
      default: "LOW",
    },

    status: {
      type: String,
      enum: ["pending", "verified"],
      default: "pending",
    },

    pdfReportUrl: String,
  },
  { timestamps: true }
);

const AnalysisReport = mongoose.model("AnalysisReport", analysisReportSchema);
export default AnalysisReport;
