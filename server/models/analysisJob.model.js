import mongoose from "mongoose";

const analysisJobSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    filename: { type: String, required: true },
    fileUrl: { type: String, required: true }, // 🔥 Cloudinary link
    mediaType: { type: String, enum: ["video", "image", "audio"], required: true },

    status: {
      type: String,
      enum: ["uploaded", "processing", "completed", "failed"],
      default: "uploaded",
    },

    results: {
      score: Number,
      confidence: Number,
      riskLevel: { type: String, enum: ["LOW", "SUSPICIOUS", "HIGHRISK"] },
      modelVersions: { type: Map, of: String },
    },

    processingTime: Number,
  },
  { timestamps: true }
);

const AnalysisJob = mongoose.model("AnalysisJob", analysisJobSchema);
export default AnalysisJob;

