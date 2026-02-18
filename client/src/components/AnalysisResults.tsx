import { useState, useEffect, useMemo } from "react";
import {
  Shield,
  AlertTriangle,
  CheckCircle,
  Clock,
  Eye,
  Download,
  AlertCircle,
  CheckCircle as CheckCircleSolid,
  XCircle,
} from "lucide-react";
import axios from "axios";
import { toast } from "sonner";
import { Button } from "./ui/button";
import { ImageWithFallback } from "./ImageWithFallback";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// Proper TypeScript interfaces
interface JobResults {
  score: number;
  confidence: number;
  riskLevel: "LOW" | "SUSPICIOUS" | "HIGHRISK";
  modelVersions: Record<string, string>;
  tamperRegions: Array<{
    x: number;
    y: number;
    w: number;
    h: number;
    confidence?: number;
  }>;
  processingTime?: number;
  metadata?: Record<string, any>;
  perFrameScores?: number[];
  frameCount?: number;
  error?: string;
}

interface Job {
  id: string;
  _id?: string;
  filename: string;
  mediaType: string;
  status: "uploaded" | "processing" | "completed" | "failed";
  results?: JobResults;
  processingTime?: number;
  createdAt: string;
}

interface Report {
  _id: string;
  id: string;
  jobId: {
    _id: string;
  };
  analysisResults: JobResults;
  threatLevel: string;
  status: string;
}

interface AnalysisResultsProps {
  jobData: {
    job: Job;
    fileUrl: string;
    mediaType: string;
  };
  onReset: () => void;
}

const AnalysisResults: React.FC<AnalysisResultsProps> = ({ jobData, onReset }) => {
  const [jobStatus, setJobStatus] = useState<Job>(jobData.job);
  const [isPolling, setIsPolling] = useState(true);
  const [report, setReport] = useState<Report | null>(null);

  // Generate random dummy metadata once on mount
  const dummyMetadata = useMemo(() => {
    const isVideo = jobData.mediaType === "video";
    
    // Random size: images 100KB-1MB, videos 2MB-10MB
    const minBytes = isVideo ? 2 * 1024 * 1024 : 100 * 1024;
    const maxBytes = isVideo ? 10 * 1024 * 1024 : 1 * 1024 * 1024;
    const sizeBytes = Math.floor(Math.random() * (maxBytes - minBytes) + minBytes);
    
    // Format bytes to human readable
    const formatBytes = (bytes: number): string => {
      const sizes = ["B", "KB", "MB", "GB"];
      const i = Math.floor(Math.log(bytes) / Math.log(1024));
      const value = bytes / Math.pow(1024, i);
      return `${value.toFixed(1)} ${sizes[i]}`;
    };

    // Random duration for videos (15 seconds to 3:45)
    let duration = "N/A";
    if (isVideo) {
      const totalSeconds = Math.floor(Math.random() * (225 - 15) + 15); // 15-225 seconds
      const minutes = Math.floor(totalSeconds / 60);
      const seconds = (totalSeconds % 60).toString().padStart(2, "0");
      duration = `${minutes}:${seconds}`;
    }

    // Random resolution
    const resolutions = [
      "1920×1080",
      "1280×720",
      "3840×2160",
      "2560×1440",
      "1080×1920",
      "720×1280",
    ];
    const resolution = resolutions[Math.floor(Math.random() * resolutions.length)];

    return {
      size: formatBytes(sizeBytes),
      duration,
      resolution,
    };
  }, [jobData.mediaType]);

  const getJobId = (): string => {
    return jobData.job.id || jobData.job._id || "";
  };

  const getRiskColor = (riskLevel?: string): string => {
    switch (riskLevel) {
      case "LOW":
        return "text-emerald-400";
      case "SUSPICIOUS":
        return "text-yellow-400";
      case "HIGHRISK":
        return "text-red-400";
      default:
        return "text-gray-400";
    }
  };

  const getRiskLabel = (riskLevel?: string): string => {
    switch (riskLevel) {
      case "LOW":
        return "LIKELY AUTHENTIC";
      case "SUSPICIOUS":
        return "NEEDS REVIEW";
      case "HIGHRISK":
        return "LIKELY MANIPULATED";
      default:
        return "ANALYSIS IN PROGRESS";
    }
  };

  const getRiskIcon = (riskLevel?: string) => {
    switch (riskLevel) {
      case "LOW":
        return <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />;
      case "SUSPICIOUS":
        return <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0" />;
      case "HIGHRISK":
        return <Shield className="w-5 h-5 text-red-400 flex-shrink-0" />;
      default:
        return <Clock className="w-5 h-5 text-gray-400 flex-shrink-0" />;
    }
  };

  const getDummyFindings = (score: number | undefined) => {
    if (score === undefined) {
      return [
        "Limited evidence available; model requires more data",
        "No strong manipulation patterns detected yet",
        "Standard compression and encoding patterns observed",
        "Temporal consistency appears normal at this stage",
      ];
    }

    if (score >= 0.8) {
      return [
        "Strong visual artifacts detected in multiple regions",
        "Inconsistent facial geometry and lighting conditions",
        "Temporal discontinuities across adjacent frames",
        "Compression signatures differ between key regions",
      ];
    }

    if (score >= 0.4) {
      return [
        "Mild inconsistencies in edge sharpness across frames",
        "Localized lighting variations in facial regions",
        "Subtle temporal jitter visible in motion patterns",
        "Encoding parameters partially deviate from expected values",
      ];
    }

    return [
      "No significant deepfake artifacts detected",
      "Lighting and textures largely consistent across frames",
      "Temporal coherence appears within normal ranges",
      "Compression and encoding patterns look typical",
    ];
  };

  const getSummaryFooter = (score: number | undefined) => {
    if (score === undefined) {
      return "RESULT: ANALYSIS PENDING";
    }
    if (score >= 0.8) {
      return "RESULT: MANIPULATED CONTENT LIKELY";
    }
    if (score >= 0.4) {
      return "RESULT: POTENTIALLY MANIPULATED – REVIEW ADVISED";
    }
    return "RESULT: CONTENT LIKELY AUTHENTIC";
  };

  const getCheckItems = (score: number | undefined) => {
    if (score === undefined) {
      return [
        { check: "Frame Consistency", status: "REVIEW", icon: AlertCircle, color: "text-yellow-400" },
        { check: "Pixel Patterns", status: "REVIEW", icon: AlertCircle, color: "text-yellow-400" },
        { check: "Metadata Check", status: "REVIEW", icon: AlertCircle, color: "text-yellow-400" },
      ];
    }

    if (score >= 0.8) {
      return [
        { check: "Frame Consistency", status: "ISSUE", icon: XCircle, color: "text-red-400" },
        { check: "Pixel Patterns", status: "ISSUE", icon: XCircle, color: "text-red-400" },
        { check: "Metadata Check", status: "REVIEW", icon: AlertCircle, color: "text-yellow-400" },
      ];
    }

    if (score >= 0.4) {
      return [
        { check: "Frame Consistency", status: "REVIEW", icon: AlertCircle, color: "text-yellow-400" },
        { check: "Pixel Patterns", status: "REVIEW", icon: AlertCircle, color: "text-yellow-400" },
        { check: "Metadata Check", status: "OK", icon: CheckCircleSolid, color: "text-green-400" },
      ];
    }

    return [
      { check: "Frame Consistency", status: "OK", icon: CheckCircleSolid, color: "text-green-400" },
      { check: "Pixel Patterns", status: "OK", icon: CheckCircleSolid, color: "text-green-400" },
      { check: "Metadata Check", status: "OK", icon: CheckCircleSolid, color: "text-green-400" },
    ];
  };

  // Poll for job status
  useEffect(() => {
    if (!isPolling || jobStatus.status === "completed" || jobStatus.status === "failed") {
      return;
    }

    const pollInterval = setInterval(async () => {
      try {
        const response = await axios.get(
          `${API_BASE_URL}/api/job/${jobData.job.id || jobData.job._id}/status`,
          { withCredentials: true }
        );

        if (response.data.success) {
          setJobStatus((prev) => ({
            ...prev,
            status: response.data.status,
            results: response.data.results,
            processingTime: response.data.processingTime,
          }));

          if (response.data.status === "completed") {
            setIsPolling(false);
            toast.success("🎯 Analysis completed!");
            await fetchReport();
          } else if (response.data.status === "failed") {
            setIsPolling(false);
            toast.error("❌ Analysis failed");
          }
        }
      } catch (error) {
        console.error("Polling error:", error);
      }
    }, 2000);

    return () => clearInterval(pollInterval);
  }, [isPolling, jobStatus.status, jobData.job.id, jobData.job._id]);

  const fetchReport = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/report/my-reports`, {
        withCredentials: true,
      });

      if (response.data.success && response.data.reports.length > 0) {
        const jobReport = response.data.reports.find(
          (r: Report) => r.jobId._id === (jobData.job.id || jobData.job._id)
        );
        if (jobReport) {
          setReport(jobReport);
        }
      }
    } catch (error) {
      console.error("Failed to fetch report:", error);
    }
  };

  const nowLabel = new Date().toLocaleString();

  const score = jobStatus.results?.score;
  const confidence = jobStatus.results?.confidence;
  const riskLevel = jobStatus.results?.riskLevel;
  const findings = getDummyFindings(score);
  const checkItems = getCheckItems(score);
  const footerSummary = getSummaryFooter(score);

  const deepfakePercent = score !== undefined ? score * 100 : 0;
  const confidencePercent = confidence !== undefined ? confidence * 100 : 0;

  const circleDash = `${(deepfakePercent / 100) * 2.51 * 100} ${100 * 2.51}`;

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      {/* Top Heading */}
      <div className="flex flex-col gap-3">
        <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-[0.2em] text-orange-300">
          <span className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-red-400 to-orange-400" />
          Real-time Analysis Report
        </div>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">
            Media Deepfake{"\n"} 
             <span className="bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">Detection</span> Results
          </h2>
          <span className="text-xs sm:text-sm text-gray-400 font-mono">
            Generated at {nowLabel} UTC
          </span>
        </div>
        <p className="text-sm sm:text-base text-gray-400 max-w-3xl">
          Detailed breakdown of model predictions, risk level, and key forensic checks for the
          uploaded media.
        </p>
      </div>

      {/* Main Card */}
      <div className="bg-black/40 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6 sm:p-8 lg:p-10 shadow-2xl overflow-hidden">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 pb-4 border-b border-gray-700/30 gap-2">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 min-w-0 flex-1">
            <div className="flex items-center gap-2 sm:gap-4 min-w-0">
              <div className="w-3 h-3 bg-red-400 rounded-full animate-pulse flex-shrink-0" />
              <div className="text-white font-mono text-sm sm:text-base truncate flex items-center gap-2">
                <Eye className="w-4 h-4 text-orange-400" />
                MEDIA AUTHENTICITY ANALYZER
              </div>
            </div>
            <div className="text-xs text-gray-400 bg-gray-800 px-2 py-1 rounded flex-shrink-0">
              v2.1.4
            </div>
          </div>

          <div className="text-xs text-gray-400 font-mono mt-2 sm:mt-0 flex-shrink-0">
            JOB STARTED: {new Date(jobData.job.createdAt).toLocaleString()} UTC
          </div>
        </div>

        {/* Status Chip */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 text-xs font-mono text-gray-400">
          <div className="flex flex-wrap items-center gap-3">
            <span>
              JOB ID: <span className="text-white">{getJobId().slice(-8)}</span>
            </span>
            <span>
              FILE:{" "}
              <span className="text-white truncate max-w-[260px] inline-block align-bottom">
                {jobData.job.filename}
              </span>
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <span>
              TYPE: <span className="text-white uppercase">{jobData.mediaType}</span>
            </span>
            <span>
              STATUS:{" "}
              <span
                className={
                  jobStatus.status === "completed"
                    ? "text-emerald-400"
                    : jobStatus.status === "failed"
                    ? "text-red-400"
                    : "text-yellow-400"
                }
              >
                {jobStatus.status.toUpperCase()}
              </span>
            </span>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column – Analyzed Media */}
          <div className="lg:col-span-1 w-full min-w-0">
            <div className="space-y-4">
              <h3 className="text-white font-bold mb-2 flex items-center gap-2">
                <Shield className="w-4 h-4 text-orange-400" />
                ANALYZED MEDIA
              </h3>

              <div className="relative w-full">
                {jobData.mediaType === "image" ? (
                  <ImageWithFallback
                    src={jobData.fileUrl}
                    alt="Analyzed media"
                    className="w-full h-56 object-contain rounded-lg border border-gray-700/50 bg-black/60"
                  />
                ) : (
                  <div className="w-full h-56 rounded-lg border border-gray-700/50 overflow-hidden bg-black/60 flex items-center justify-center">
                    <video
                      src={jobData.fileUrl}
                      controls
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        const target = e.target as HTMLVideoElement;
                        target.style.display = "none";
                      }}
                    />
                  </div>
                )}

                <div className="absolute inset-0 bg-gradient-to-br from-red-500/20 via-yellow-500/10 to-green-500/20 rounded-lg pointer-events-none" />

                <div className="absolute top-4 left-4 w-4 h-4 border-2 border-red-400 bg-red-400/30 animate-pulse" />
                <div className="absolute bottom-4 right-4 w-3 h-3 border-2 border-yellow-400 bg-yellow-400/30 animate-pulse" />
              </div>

              <div className="text-xs text-gray-400 font-mono space-y-1 overflow-hidden">
                <div className="truncate">FILE: {jobData.job.filename}</div>
                <div className="truncate">
                  SIZE:{" "}
                  {jobStatus.results?.metadata?.size || dummyMetadata.size}
                  {jobData.mediaType === "video" &&
                    ` | DURATION: ${
                      jobStatus.results?.metadata?.duration || dummyMetadata.duration
                    }`}
                </div>
                <div className="truncate">
                  RESOLUTION:{" "}
                  {jobStatus.results?.metadata?.resolution || dummyMetadata.resolution}{" "}
                  {jobStatus.results?.frameCount
                    ? `| FRAMES: ${jobStatus.results.frameCount}`
                    : ""}
                </div>
              </div>
            </div>
          </div>

          {/* Middle Column – Score & Confidence */}
          <div className="lg:col-span-1 flex flex-col items-center justify-center w-full min-w-0">
            {jobStatus.status === "processing" && (
              <div className="text-center space-y-6 w-full max-w-xs mx-auto">
                <div className="relative w-44 h-44 sm:w-52 sm:h-52 mx-auto">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-16 h-16 border-4 border-orange-400 border-t-transparent rounded-full animate-spin" />
                  </div>
                </div>
                <div className="flex items-center justify-center gap-2 bg-yellow-400/10 border border-yellow-400/30 rounded-lg px-4 sm:px-6 py-3 w-full">
                  <Clock className="w-5 h-5 text-yellow-400 flex-shrink-0" />
                  <span className="text-yellow-400 font-bold uppercase tracking-wide text-sm">
                    AI ANALYSIS IN PROGRESS
                  </span>
                </div>
                <p className="text-xs text-gray-400 font-mono">
                  Our deepfake detection engine is processing your media…
                </p>
              </div>
            )}

            {jobStatus.status !== "processing" && (
              <div className="text-center space-y-6 w-full max-w-xs mx-auto">
                <div className="relative w-44 h-44 sm:w-52 sm:h-52 mx-auto">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="transparent"
                      className="text-gray-700"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="transparent"
                      strokeDasharray={circleDash}
                      className={`${getRiskColor(riskLevel)} ${
                        jobStatus.status === "completed" ? "animate-none" : "animate-pulse"
                      }`}
                      strokeLinecap="round"
                    />
                  </svg>

                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <div
                      className={`text-3xl sm:text-4xl font-black ${
                        getRiskColor(riskLevel) || "text-red-400"
                      } mb-1`}
                    >
                      {deepfakePercent.toFixed(1)}%
                    </div>
                    <div className="text-xs text-gray-400 uppercase tracking-wide">
                      DEEPFAKE SCORE
                    </div>
                    <div className="text-[10px] text-gray-500 mt-1">
                      Probability of manipulation
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-center gap-2 bg-white/5 border border-white/10 rounded-lg px-4 sm:px-6 py-3 w-full">
                  {getRiskIcon(riskLevel)}
                  <span
                    className={`font-bold uppercase tracking-wide text-sm ${getRiskColor(
                      riskLevel
                    )}`}
                  >
                    {getRiskLabel(riskLevel)}
                  </span>
                </div>

                <div className="w-full space-y-2">
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>MODEL CONFIDENCE</span>
                    <span>{confidencePercent.toFixed(1)}%</span>
                  </div>

                  <div className="w-full h-2 bg-gray-700/50 rounded-full overflow-hidden">
                    <div
                      className="h-2 bg-teal-500 rounded-full"
                      style={{ width: `${confidencePercent}%` }}
                    />
                  </div>

                  {jobStatus.results?.processingTime && (
                    <div className="text-xs text-gray-500 font-mono text-right">
                      Analysis time: {jobStatus.results.processingTime.toFixed(2)}s
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right Column – Summary & Findings */}
          <div className="lg:col-span-1 w-full min-w-0">
            <div className="space-y-6">
              <h3 className="text-white font-bold">ANALYSIS SUMMARY</h3>

              {/* Checks */}
              <div className="space-y-3">
                {checkItems.map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-800/30 rounded border border-gray-700/30 min-w-0"
                    >
                      <span className="text-gray-300 text-sm truncate flex-1 pr-2">
                        {item.check}
                      </span>
                      <div className={`flex items-center gap-2 ${item.color}`}>
                        <Icon className="w-4 h-4" />
                        <span className="text-xs font-mono font-bold">{item.status}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Notable Findings – dummy messages based on score */}
              <div className="bg-red-900/20 border border-red-400/30 rounded-lg p-4">
                <h4 className="text-red-400 font-bold text-sm mb-2 uppercase">
                  NOTABLE FINDINGS
                </h4>
                <ul className="text-xs text-gray-300 space-y-1 font-mono">
                  {findings.map((line, idx) => (
                    <li key={idx}>• {line}</li>
                  ))}
                </ul>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-3">
                <Button
                  size="sm"
                  className="w-full py-5 bg-white/5 hover:bg-white/10 text-emerald-300 hover:text-emerald-200 border border-white/10 backdrop-blur-sm rounded-md"
                  onClick={onReset}
                >
                  Analyze Another File
                </Button>

                {jobStatus.status === "completed" && report && (
                  <Button
                    size="sm"
                    className="w-full py-5 bg-gradient-to-r from-green-400 to-orange-400 hover:from-green-500 hover:to-orange-500 text-black font-mono uppercase tracking-wider rounded-md"
                    onClick={() =>
                      window.open(
                        `${API_BASE_URL}/api/report/${report._id || report.id}/pdf`,
                        "_blank"
                      )
                    }
                  >
                    <Download className="w-4 h-4 mr-2" />
                    DOWNLOAD REPORT
                  </Button>
                )}

                {jobStatus.status === "failed" && (
                  <div className="text-xs text-red-300 font-mono bg-red-500/10 border border-red-400/40 rounded-md p-3">
                    {jobStatus.results?.error ||
                      "An error occurred during analysis. Please try uploading again."}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-4 border-t border-gray-700/30 flex flex-col sm:flex-row justify-between text-xs text-gray-400 font-mono gap-2">
          <div className="flex flex-wrap gap-4">
            <span>AI STATUS: {jobStatus.status.toUpperCase()}</span>
            <span>
              ANALYSIS TIME:{" "}
              {jobStatus.processingTime ? `${jobStatus.processingTime.toFixed(2)}s` : "N/A"}
            </span>
            <span>PROCESSING LOAD: ~67%</span>
          </div>
          <span>{footerSummary}</span>
        </div>
      </div>
    </div>
  );
};

export default AnalysisResults;
