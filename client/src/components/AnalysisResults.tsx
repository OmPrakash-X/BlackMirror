import { useState, useEffect } from "react";
import { Shield, AlertTriangle, CheckCircle, Clock, TrendingUp, Eye } from "lucide-react";
import { Button } from "./ui/button";
import axios from "axios";
import { toast } from "sonner";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// Proper TypeScript interfaces
interface JobResults {
  score: number;
  confidence: number;
  riskLevel: 'LOW' | 'SUSPICIOUS' | 'HIGHRISK';
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
  status: 'uploaded' | 'processing' | 'completed' | 'failed';
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

  // Poll for job status
  useEffect(() => {
    if (!isPolling || jobStatus.status === 'completed' || jobStatus.status === 'failed') {
      return;
    }

    const pollInterval = setInterval(async () => {
      try {
        const response = await axios.get(
          `${API_BASE_URL}/api/job/${jobData.job.id || jobData.job._id}/status`,
          { withCredentials: true }
        );

        if (response.data.success) {
          setJobStatus(prev => ({
            ...prev,
            status: response.data.status,
            results: response.data.results,
            processingTime: response.data.processingTime
          }));

          if (response.data.status === 'completed') {
            setIsPolling(false);
            toast.success("🎯 Analysis completed!");
            
            // Fetch full report
            await fetchReport();
          } else if (response.data.status === 'failed') {
            setIsPolling(false);
            toast.error("❌ Analysis failed");
          }
        }
      } catch (error) {
        console.error('Polling error:', error);
      }
    }, 2000); // Poll every 2 seconds

    return () => clearInterval(pollInterval);
  }, [isPolling, jobStatus.status, jobData.job.id, jobData.job._id]);

  const fetchReport = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/report/my-reports`,
        { withCredentials: true }
      );

      if (response.data.success && response.data.reports.length > 0) {
        // Find the report for this job
        const jobReport = response.data.reports.find(
          (r: Report) => r.jobId._id === (jobData.job.id || jobData.job._id)
        );
        if (jobReport) {
          setReport(jobReport);
        }
      }
    } catch (error) {
      console.error('Failed to fetch report:', error);
    }
  };

  const getRiskColor = (riskLevel: string): string => {
    switch (riskLevel) {
      case 'LOW': return 'text-green-400';
      case 'SUSPICIOUS': return 'text-yellow-400';
      case 'HIGHRISK': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getRiskIcon = (riskLevel: string) => {
    switch (riskLevel) {
      case "LOW":
        return <CheckCircle className="w-6 h-6 text-green-400" />;
      case "SUSPICIOUS":
        return <AlertTriangle className="w-6 h-6 text-yellow-400" />;
      case "HIGHRISK":
        return <Shield className="w-6 h-6 text-red-400" />;
      default:
        return <Clock className="w-6 h-6 text-gray-400" />;
    }
  };

  const formatScore = (score: number): string => {
    return (score * 100).toFixed(1);
  };

  const getJobId = (): string => {
    return jobData.job.id || jobData.job._id || '';
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Shield className="w-6 h-6 text-orange-400" />
          <span className="text-orange-400 font-mono text-sm tracking-wider uppercase">
            Analysis Report
          </span>
        </div>
        <h2 className="text-3xl font-bold text-white mb-2">
          Detection Results
        </h2>
      </div>

      {/* Media Preview */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/20 rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Eye className="w-5 h-5" />
          Media Analysis
        </h3>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="bg-gray-900/50 rounded-lg p-4 aspect-video flex items-center justify-center">
              {jobData.mediaType === 'image' ? (
                <img 
                  src={jobData.fileUrl} 
                  alt="Analyzed media"
                  className="max-w-full max-h-full object-contain rounded"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
              ) : (
                <video 
                  src={jobData.fileUrl} 
                  controls 
                  className="max-w-full max-h-full rounded"
                  onError={(e) => {
                    const target = e.target as HTMLVideoElement;
                    target.style.display = 'none';
                  }}
                />
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-300">File:</span>
                <span className="text-white font-mono text-sm truncate max-w-48">
                  {jobData.job.filename}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Type:</span>
                <span className="text-white font-mono uppercase">{jobData.mediaType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Status:</span>
                <span className={`font-mono uppercase ${
                  jobStatus.status === 'completed' ? 'text-green-400' :
                  jobStatus.status === 'failed' ? 'text-red-400' :
                  'text-yellow-400'
                }`}>
                  {jobStatus.status}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Job ID:</span>
                <span className="text-white font-mono text-xs">
                  {getJobId().slice(-8)}
                </span>
              </div>
              {jobStatus.processingTime && (
                <div className="flex justify-between">
                  <span className="text-gray-300">Processing Time:</span>
                  <span className="text-white font-mono">{jobStatus.processingTime}s</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Results */}
      {jobStatus.status === 'processing' && (
        <div className="bg-white/5 backdrop-blur-xl border border-white/20 rounded-2xl p-8 text-center">
          <div className="space-y-4">
            <div className="flex justify-center">
              <div className="w-16 h-16 border-4 border-orange-400 border-t-transparent rounded-full animate-spin"></div>
            </div>
            <h3 className="text-xl font-semibold text-white">AI Analysis in Progress</h3>
            <p className="text-gray-300">
              Our advanced deepfake detection system is analyzing your media...
            </p>
            <div className="flex justify-center space-x-1 mt-4">
              <div className="w-2 h-2 bg-orange-400 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
          </div>
        </div>
      )}

      {jobStatus.status === 'completed' && jobStatus.results && (
        <>
          <div className="grid md:grid-cols-3 gap-6">
            {/* Risk Assessment */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/20 rounded-2xl p-6">
              <div className="text-center space-y-4">
                <div className="flex justify-center">
                  {getRiskIcon(jobStatus.results.riskLevel)}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-1">Threat Level</h3>
                  <p className={`text-2xl font-bold ${getRiskColor(jobStatus.results.riskLevel)}`}>
                    {jobStatus.results.riskLevel}
                  </p>
                </div>
              </div>
            </div>

            {/* Deepfake Score */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/20 rounded-2xl p-6">
              <div className="text-center space-y-4">
                <TrendingUp className="w-6 h-6 text-blue-400 mx-auto" />
                <div>
                  <h3 className="text-lg font-semibold text-white mb-1">Deepfake Score</h3>
                  <p className="text-2xl font-bold text-blue-400">
                    {formatScore(jobStatus.results.score)}%
                  </p>
                  <p className="text-sm text-gray-400 mt-1">
                    Probability of manipulation
                  </p>
                </div>
              </div>
            </div>

            {/* Confidence */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/20 rounded-2xl p-6">
              <div className="text-center space-y-4">
                <Shield className="w-6 h-6 text-purple-400 mx-auto" />
                <div>
                  <h3 className="text-lg font-semibold text-white mb-1">Confidence</h3>
                  <p className="text-2xl font-bold text-purple-400">
                    {formatScore(jobStatus.results.confidence)}%
                  </p>
                  <p className="text-sm text-gray-400 mt-1">
                    Model certainty
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Details */}
          {(jobStatus.results.frameCount && jobStatus.results.frameCount > 1) && (
            <div className="bg-white/5 backdrop-blur-xl border border-white/20 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Video Analysis Details</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <p className="text-gray-300">Frames Analyzed:</p>
                  <p className="text-white font-mono text-xl">{jobStatus.results.frameCount}</p>
                </div>
                {jobStatus.results.metadata && (
                  <div className="space-y-2">
                    <p className="text-gray-300">Model Used:</p>
                    <p className="text-white font-mono text-sm">
                      {Object.keys(jobStatus.results.modelVersions)[0] || 'SmallXception'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}

      {jobStatus.status === 'failed' && (
        <div className="bg-red-500/10 border border-red-400/50 rounded-2xl p-8 text-center">
          <div className="space-y-4">
            <AlertTriangle className="w-16 h-16 text-red-400 mx-auto" />
            <h3 className="text-xl font-semibold text-white">Analysis Failed</h3>
            <p className="text-gray-300">
              {jobStatus.results?.error || "An error occurred during analysis"}
            </p>
            <p className="text-sm text-gray-400">
              Please try uploading the file again or contact support if the issue persists.
            </p>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-center gap-4">
        <Button
          onClick={onReset}
          className="bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 
                     text-white font-mono uppercase tracking-wider px-8 py-3 rounded-lg shadow-lg 
                     hover:scale-105 transition-all duration-300"
        >
          Analyze Another File
        </Button>

        {jobStatus.status === 'completed' && report && (
          <Button
            onClick={() => window.open(`${API_BASE_URL}/api/report/${report._id || report.id}/pdf`, '_blank')}
            className="bg-gradient-to-r from-green-400 to-orange-400 hover:from-green-500 hover:to-orange-500 
                       text-black font-mono uppercase tracking-wider px-8 py-3 rounded-lg shadow-lg 
                       hover:scale-105 transition-all duration-300"
          >
            Download Full Report
          </Button>
        )}

        {/* {jobStatus.status === 'completed' && (
          <Button
            onClick={() => {
              const resultsData = {
                filename: jobData.job.filename,
                score: jobStatus.results?.score,
                riskLevel: jobStatus.results?.riskLevel,
                confidence: jobStatus.results?.confidence,
                processingTime: jobStatus.processingTime
              };
              
              const blob = new Blob([JSON.stringify(resultsData, null, 2)], {
                type: 'application/json'
              });
              
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `analysis-${getJobId().slice(-8)}.json`;
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
              URL.revokeObjectURL(url);
              
              toast.success("Results downloaded!");
            }}
            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 
                       text-white font-mono uppercase tracking-wider px-8 py-3 rounded-lg shadow-lg 
                       hover:scale-105 transition-all duration-300"
          >
            Download Results
          </Button>
        )} */}
      </div>
    </div>
  );
};

export default AnalysisResults;
