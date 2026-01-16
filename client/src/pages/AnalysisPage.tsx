import { useState } from "react";
import UploadSection from "../components/UploadSection";
import AnalysisResults from "../components/AnalysisResults";

const AnalysisPage = () => {
  const [currentJob, setCurrentJob] = useState(null);

  const handleUploadSuccess = (jobData: any) => {
    setCurrentJob(jobData);
  };

  const handleReset = () => {
    setCurrentJob(null);
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Background Pattern */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_25%,rgba(0,255,0,0.1),transparent_50%),radial-gradient(circle_at_75%_75%,rgba(255,165,0,0.1),transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:100px_100px]"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-12">
        {!currentJob ? (
          <UploadSection onUploadSuccess={handleUploadSuccess} />
        ) : (
          <AnalysisResults jobData={currentJob} onReset={handleReset} />
        )}
      </div>
    </div>
  );
};

export default AnalysisPage;
