import { ImageWithFallback } from "./ImageWithFallback";
import { Brain, Zap, Database, Lock } from "lucide-react";

const TechSection = () => {
  return (
    <section className="py-24 px-6 relative">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,255,0,0.3),transparent_70%)]"></div>
        <ImageWithFallback
          src="https://images.unsplash.com/photo-1593358185687-129b6eedb3aa?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtaWxpdGFyeSUyMHRhY3RpY2FsJTIwZ3JpZCUyMGJhY2tncm91bmR8ZW58MXx8fHwxNzU3OTk1NzMwfDA&ixlib=rb-4.1.0&q=80&w=1080"
          alt="Background"
          className="w-full h-full object-cover"
        />
      </div>

      <div className="container mx-auto relative z-10 px-5 md:px-14">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Side - Content */}
          <div className="space-y-8">
            <div>
              <div className="flex items-center gap-2 text-orange-400 mb-4">
                <Lock className="w-5 h-5" />
                <span className="text-sm font-mono tracking-wider uppercase">
                  SECURE AI TECHNOLOGY
                </span>
              </div>

              <h2 className="text-4xl lg:text-5xl font-black text-white mb-6">
                BUILT FOR{" "}
                <span className="bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
                  DIGITAL TRUST
                </span>
                <br />
                & CONTENT AUTHENTICITY
              </h2>

              <p className="text-xl text-gray-300 leading-relaxed mb-8">
                A scalable AI architecture designed to verify digital media
                authenticity. Suitable for platforms, organizations, journalists,
                and everyday users to combat misinformation and manipulated
                content.
              </p>
            </div>

            {/* Tech Specs */}
            <div className="space-y-6">
              {[
                {
                  icon: Brain,
                  title: "Smart Analysis",
                  detail:
                    "AI models analyze images and videos to identify signs of manipulation",
                  color: "text-purple-400",
                },
                {
                  icon: Zap,
                  title: "Quick Results",
                  detail:
                    "Get detection results within seconds for uploaded media",
                  color: "text-yellow-400",
                },
                {
                  icon: Database,
                  title: "Trained on Real Examples",
                  detail:
                    "System learns from a wide range of real and edited media samples",
                  color: "text-cyan-400",
                },
                {
                  icon: Lock,
                  title: "Safe & Private",
                  detail:
                    "Your uploaded content is handled securely and not shared",
                  color: "text-green-400",
                },
              ].map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={index}
                      className="flex items-start gap-4 p-4 rounded-lg border border-gray-700/30 bg-black/20 backdrop-blur-sm"
                    >
                      <div
                        className={`p-2 rounded-lg border ${item.color} border-current bg-current/10`}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-white font-bold mb-1">
                          {item.title}
                        </h4>
                        <p className="text-gray-400 text-sm">{item.detail}</p>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

          {/* Right Side - AI Visualization */}
          <div className="relative">
            {/* Main Visualization */}
            <div className="relative">
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1735660244565-9574ca46c57d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxBSSUyMGhlYXRtYXAlMjBhbmFseXNpcyUyMHZpc3VhbGl6YXRpb258ZW58MXx8fHwxNzU3OTk1NzMwfDA&ixlib=rb-4.1.0&q=80&w=1080"
                alt="AI Analysis Visualization"
                className="w-full h-[500px] object-cover rounded-xl border border-gray-700/50"
              />

              {/* Holographic Overlay */}
              <div className="absolute inset-0 bg-gradient-to-tr from-green-400/20 via-transparent to-orange-400/20 rounded-xl"></div>

              {/* Data Stream Overlay */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="space-y-2 text-center">
                  {[
                    "ANALYZING VISUAL FEATURES...",
                    "CHECKING PIXEL CONSISTENCY...",
                    "EVALUATING TEMPORAL PATTERNS...",
                    "GENERATING AUTHENTICITY SCORE...",
                  ].map((text, index) => (
                    <div
                      key={index}
                      className="text-green-400 font-mono text-xs bg-black/70 px-4 py-2 rounded border border-green-400/30 animate-pulse"
                      style={{ animationDelay: `${index * 0.5}s` }}
                    >
                      {text}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Floating Status Panels */}
            <div className="absolute -top-8 -left-8 bg-black/80 backdrop-blur-sm border border-green-400/50 rounded-lg p-3">
              <div className="text-green-400 font-mono text-xs">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  AI ENGINE STATUS
                </div>
                <div className="text-white">PROCESSING</div>
              </div>
            </div>

            <div className="absolute -bottom-8 -right-8 bg-black/80 backdrop-blur-sm border border-orange-400/50 rounded-lg p-3">
              <div className="text-orange-400 font-mono text-xs">
                <div>CONTENT RISK</div>
                <div className="text-white text-lg">MODERATE</div>
                <div className="w-16 h-1 bg-orange-400/30 rounded-full mt-1">
                  <div className="w-1/2 h-full bg-orange-400 rounded-full animate-pulse"></div>
                </div>
              </div>
            </div>

            {/* Scanning Grid Effect */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="w-full h-full border-2 border-dashed border-green-400/30 rounded-xl animate-pulse"></div>
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-green-400 to-transparent animate-scan opacity-60"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TechSection;
