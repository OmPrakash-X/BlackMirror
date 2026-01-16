import { useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { Upload, AlertTriangle, Eye, Zap, ArrowRight, FileImage, FileVideo, Clock, BarChart3 } from "lucide-react";

const DashBoard = () => {
  const navigate = useNavigate();
  
  return (
    <section className="py-24 px-4 sm:px-6 relative overflow-hidden min-h-screen">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-gray-900/30 to-black/50"></div>

      <div className="container mx-auto relative z-10 max-w-7xl">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white mb-6 px-2">
            DEEPFAKE{" "}
            <span className="bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">
              DETECTION
            </span>{" "}
            CENTER
          </h1>
          <p className="text-xl sm:text-2xl text-gray-400 max-w-4xl mx-auto px-2 mb-8">
            Advanced AI-powered deepfake detection and analysis platform
          </p>
          <div className="text-sm text-gray-500 font-mono">
            {new Date().toLocaleString()} UTC | STATUS: OPERATIONAL
          </div>
        </div>
          
          {/* Analysis Process Preview */}
        <div className="bg-black/40 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6 sm:p-8 mb-12">
          <h3 className="text-2xl font-bold text-white mb-6 text-center">
            What Happens During Analysis
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              {
                step: "01",
                title: "Upload",
                description: "Drag & drop or select your media files",
                icon: Upload,
                color: "text-blue-400"
              },
              {
                step: "02", 
                title: "Process",
                description: "AI analyzes facial geometry & temporal consistency",
                icon: Zap,
                color: "text-yellow-400"
              },
              {
                step: "03",
                title: "Detect",
                description: "Identify manipulation artifacts & inconsistencies",
                icon: Eye,
                color: "text-red-400"
              },
              {
                step: "04",
                title: "Report",
                description: "Get detailed results with visual evidence",
                icon: BarChart3,
                color: "text-green-400"
              }
            ].map((process, index) => {
              const Icon = process.icon;
              return (
                <div key={index} className="text-center">
                  <div className={`w-16 h-16 mx-auto mb-4 bg-gradient-to-br ${process.color.replace('text-', 'from-')}/20 to-transparent rounded-full flex items-center justify-center border border-${process.color.replace('text-', '')}/30`}>
                    <Icon className={`w-8 h-8 ${process.color}`} />
                  </div>
                  <div className="text-xs text-gray-500 font-mono mb-2">STEP {process.step}</div>
                  <h4 className="text-lg font-bold text-white mb-2">{process.title}</h4>
                  <p className="text-sm text-gray-400">{process.description}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Main Action Card */}
        <div className="w-full max-w-4xl mx-auto mb-12">
          <div className="bg-black/40 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-8 sm:p-12 shadow-2xl text-center">
            {/* Upload Icon */}
            <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-red-400/20 to-orange-400/20 rounded-full flex items-center justify-center border border-red-400/30">
              <Upload className="w-10 h-10 text-red-400" />
            </div>

            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
              Upload & Analyze Media
            </h2>
            <p className="text-lg text-gray-400 mb-8 max-w-2xl mx-auto">
              Upload your images or videos to get instant deepfake detection results with detailed forensic analysis and threat assessment reports
            </p>


            {/* Supported File Types */}
            <div className="flex justify-center gap-6 mb-8">
              <div className="flex items-center gap-2 text-gray-300">
                <FileImage className="w-5 h-5 text-blue-400" />
                <span className="text-sm">Images</span>
              </div>
              <div className="flex items-center gap-2 text-gray-300">
                <FileVideo className="w-5 h-5 text-purple-400" />
                <span className="text-sm">Videos</span>
              </div>
            </div>

            {/* Main CTA Button */}
            <Button 
              onClick={() => navigate("/analyze")} 
              className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white font-bold py-4 px-8 rounded-lg text-lg shadow-lg hover:shadow-xl transition-all duration-200 group mb-6"
            >
              Start Analysis
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>

            {/* Supported formats */}
            <div className="text-sm text-gray-500 space-y-1">
              <div>Supported formats: JPG, PNG, MP4, MOV • Max file size: 50MB</div>
              <div>Drag & drop enabled • Multiple file upload • Instant results</div>
            </div>
          </div>
        </div>

      

        
     

        {/* System Status Bar */}
        <div className="mt-12 pt-6 border-t border-gray-700/30">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-gray-400 font-mono gap-2">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span>AI CORE: ACTIVE</span>
              </div>
              <div>GPU CLUSTER: OPERATIONAL</div>
              <div>MODEL VERSION: v2.1.4</div>
            </div>
            <div className="text-right">
              NEXT MAINTENANCE: 2025-09-25 02:00 UTC
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DashBoard;
