import { ImageWithFallback } from "./ImageWithFallback";
import { Download, AlertCircle, CheckCircle, XCircle } from "lucide-react";
import { Button } from "./ui/button";

const DashboardPreview = () => {
  return (
    <section className="py-24 px-4 sm:px-6 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-gray-900/30 to-black/50"></div>

      <div className="container mx-auto relative z-10 max-w-7xl">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white mb-4 px-2">
            MEDIA ANALYSIS{" "}
            <span className="bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">
              DASHBOARD
            </span>
          </h2>
          <p className="text-lg sm:text-xl text-gray-400 max-w-3xl mx-auto px-2">
            Visual overview of AI-based media authenticity analysis with clear,
            easy-to-understand results
          </p>
        </div>

        {/* Dashboard Mockup */}
        <div className="w-full max-w-6xl mx-auto">
          <div className="bg-black/40 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-4 sm:p-6 lg:p-8 shadow-2xl overflow-hidden">
            {/* Header Bar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 pb-4 border-b border-gray-700/30 gap-2">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 min-w-0 flex-1">
                <div className="flex items-center gap-2 sm:gap-4 min-w-0">
                  <div className="w-3 h-3 bg-red-400 rounded-full animate-pulse flex-shrink-0"></div>
                  <div className="text-white font-mono text-sm sm:text-base truncate">
                    MEDIA AUTHENTICITY ANALYZER
                  </div>
                </div>
                <div className="text-xs text-gray-400 bg-gray-800 px-2 py-1 rounded flex-shrink-0">
                  v2.1.4
                </div>
              </div>

              <div className="text-xs text-gray-400 font-mono mt-2 sm:mt-0 flex-shrink-0">
                {new Date().toLocaleString()} UTC
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
              {/* Left Column */}
              <div className="lg:col-span-1 w-full min-w-0">
                <div className="space-y-4">
                  <h3 className="text-white font-bold mb-4">
                    ANALYZED MEDIA
                  </h3>

                  <div className="relative w-full">
                    <ImageWithFallback
                      src="https://images.unsplash.com/photo-1655036387197-566206c80980?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjeWJlcnNlY3VyaXR5JTIwZGFzaGJvYXJkJTIwaW50ZXJmYWNlfGVufDF8fHx8MTc1Nzk5NTczMHww&ixlib=rb-4.1.0&q=80&w=1080"
                      alt="Sample Analysis"
                      className="w-full h-48 object-cover rounded-lg border border-gray-700/50"
                    />

                    <div className="absolute inset-0 bg-gradient-to-br from-red-500/30 via-yellow-500/20 to-green-500/30 rounded-lg opacity-60"></div>

                    <div className="absolute top-4 left-4 w-4 h-4 border-2 border-red-400 bg-red-400/30 animate-pulse"></div>
                    <div className="absolute bottom-4 right-4 w-3 h-3 border-2 border-yellow-400 bg-yellow-400/30 animate-pulse"></div>
                  </div>

                  <div className="text-xs text-gray-400 font-mono space-y-1 overflow-hidden">
                    <div className="truncate">FILE: uploaded_media.mp4</div>
                    <div className="truncate">SIZE: 15.2 MB | DURATION: 00:02:34</div>
                    <div className="truncate">RESOLUTION: 1920×1080 | FPS: 30</div>
                  </div>
                </div>
              </div>

              {/* Middle Column */}
              <div className="lg:col-span-1 flex flex-col items-center justify-center w-full min-w-0">
                <div className="text-center space-y-6 w-full max-w-xs mx-auto">
                  <div className="relative w-40 h-40 sm:w-48 sm:h-48 mx-auto">
                    <svg
                      className="w-full h-full transform -rotate-90"
                      viewBox="0 0 100 100"
                    >
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
                        strokeDasharray={`${28 * 2.51} ${100 * 2.51}`}
                        className="text-red-400 animate-pulse"
                        strokeLinecap="round"
                      />
                    </svg>

                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <div className="text-3xl sm:text-4xl font-black text-red-400 mb-1">
                        23%
                      </div>
                      <div className="text-xs text-gray-400 uppercase tracking-wide">
                        AUTHENTICITY SCORE
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-center gap-2 bg-red-400/10 border border-red-400/30 rounded-lg px-4 sm:px-6 py-3 w-full">
                    <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                    <span className="text-red-400 font-bold uppercase tracking-wide text-sm">
                      LIKELY MANIPULATED
                    </span>
                  </div>

                  <div className="w-full space-y-2">
                    <div className="flex justify-between text-xs text-gray-400">
                      <span>MODEL CONFIDENCE</span>
                      <span>94.7%</span>
                    </div>

                    <div className="w-full h-2 bg-gray-700/50 rounded-full overflow-hidden">
                      <div
                        className="h-2 bg-teal-500 rounded-full"
                        style={{ width: "94.7%" }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="lg:col-span-1 w-full min-w-0">
                <div className="space-y-6">
                  <h3 className="text-white font-bold">
                    ANALYSIS SUMMARY
                  </h3>

                  <div className="space-y-3">
                    {[
                      {
                        check: "Frame Consistency",
                        status: "ISSUE",
                        icon: XCircle,
                        color: "text-red-400",
                      },
                      {
                        check: "Pixel Patterns",
                        status: "REVIEW",
                        icon: AlertCircle,
                        color: "text-yellow-400",
                      },
                      {
                        check: "Metadata Check",
                        status: "OK",
                        icon: CheckCircle,
                        color: "text-green-400",
                      },
                    ].map((item, index) => {
                      const Icon = item.icon;
                      return (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 bg-gray-800/30 rounded border border-gray-700/30 min-w-0"
                        >
                          <span className="text-gray-300 text-sm truncate flex-1 pr-2">
                            {item.check}
                          </span>
                          <div
                            className={`flex items-center gap-2 ${item.color}`}
                          >
                            <Icon className="w-4 h-4" />
                            <span className="text-xs font-mono font-bold">
                              {item.status}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="bg-red-900/20 border border-red-400/30 rounded-lg p-4">
                    <h4 className="text-red-400 font-bold text-sm mb-2 uppercase">
                      NOTABLE FINDINGS
                    </h4>
                    <ul className="text-xs text-gray-300 space-y-1 font-mono">
                      <li>• Visual inconsistencies across multiple frames</li>
                      <li>• Unnatural lighting transitions</li>
                      <li>• Compression differences in key regions</li>
                      <li>• Timing irregularities detected</li>
                    </ul>
                  </div>

                  <Button
                    size="sm"
                    className="w-full py-5 bg-white/5 hover:bg-white/10 text-emerald-300 hover:text-emerald-200 border border-white/10 backdrop-blur-sm rounded-md"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    DOWNLOAD REPORT
                  </Button>
                </div>
              </div>
            </div>

            <div className="mt-6 sm:mt-8 pt-4 border-t border-gray-700/30 flex flex-col sm:flex-row justify-between text-xs text-gray-400 font-mono gap-2">
              <div className="flex gap-4">
                <span>AI STATUS: ACTIVE</span>
                <span>ANALYSIS TIME: 1.7s</span>
                <span>PROCESSING LOAD: 67%</span>
              </div>
              <span>RESULT: MANIPULATED CONTENT LIKELY</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DashboardPreview;
