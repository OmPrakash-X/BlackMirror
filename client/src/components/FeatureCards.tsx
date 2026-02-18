import { Video, Target, AlertTriangle } from "lucide-react";

const features = [
  {
    icon: Video,
    title: "Image & Video Detection",
    description: "Detect manipulated visuals instantly",
    detail:
      "Deep learning models analyze pixel-level inconsistencies, compression artifacts, and synthetic patterns to identify AI-generated or altered media.",
    color: "orange",
  },
  {
    icon: Target,
    title: "Authenticity Score",
    description: "Confidence score from 0–100%",
    detail:
      "Provides a clear probability score indicating how likely the content is real or manipulated, helping users make informed decisions.",
    color: "green",
  },
  {
    icon: AlertTriangle,
    title: "Risk Classification",
    description: "Low | Medium | High Risk",
    detail:
      "Automatically categorizes content based on manipulation severity and potential for misinformation or misuse.",
    color: "red",
  },
];

const getColorClasses = (color: string) => {
  const colors = {
    green:
      "border-green-400/30 bg-green-400/5 text-green-400 shadow-green-400/10",
    blue: "border-blue-400/30 bg-blue-400/5 text-blue-400 shadow-blue-400/10",
    orange:
      "border-orange-400/30 bg-orange-400/5 text-orange-400 shadow-orange-400/10",
    red: "border-red-400/30 bg-red-400/5 text-red-400 shadow-red-400/10",
  };
  return colors[color as keyof typeof colors];
};

const FeatureCards = () => {
  return (
    <section className="py-24 px-6 relative bg-black min-h-screen">
      {/* Background Grid Effect */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:100px_100px] opacity-30"></div>

      <div className="container mx-auto relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-black text-white mb-4">
            AI-POWERED{" "}
            <span className="bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
              DETECTION CAPABILITIES
            </span>
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            An intelligent deepfake detection platform designed to help
            individuals, organizations, and digital platforms verify the
            authenticity of visual media.
          </p>
        </div>

        {/* Feature Cards */}
        <div className="flex flex-wrap justify-center gap-6 cursor-pointer">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className={`group relative p-8 rounded-xl border backdrop-blur-md transition-all duration-500 hover:scale-105 hover:shadow-2xl w-80 ${getColorClasses(
                  feature.color
                )}`}
              >
                {/* Card Background Glow */}
                <div
                  className={`absolute inset-0 rounded-xl opacity-0 group-hover:opacity-20 transition-opacity duration-500 bg-gradient-to-br ${
                    feature.color === "green"
                      ? "from-green-400/20 to-emerald-600/20"
                      : feature.color === "blue"
                      ? "from-blue-400/20 to-cyan-600/20"
                      : feature.color === "orange"
                      ? "from-orange-400/20 to-red-500/20"
                      : "from-red-400/20 to-pink-600/20"
                  }`}
                ></div>

                {/* Icon */}
                <div
                  className={`w-16 h-16 rounded-lg border backdrop-blur-sm mb-6 flex items-center justify-center group-hover:animate-pulse ${getColorClasses(
                    feature.color
                  )}`}
                >
                  <Icon className="w-8 h-8" />
                </div>

                {/* Content */}
                <div className="relative z-10">
                  <h3 className="text-xl font-bold text-white mb-3">
                    {feature.title}
                  </h3>

                  <p className="text-gray-400 mb-4 font-mono text-sm uppercase tracking-wide">
                    {feature.description}
                  </p>

                  <p className="text-gray-500 text-sm leading-relaxed">
                    {feature.detail}
                  </p>
                </div>

                {/* Status Indicator */}
                <div className="absolute top-4 right-4">
                  <div
                    className={`w-2 h-2 rounded-full animate-pulse ${
                      feature.color === "green"
                        ? "bg-green-400"
                        : feature.color === "blue"
                        ? "bg-blue-400"
                        : feature.color === "orange"
                        ? "bg-orange-400"
                        : "bg-red-400"
                    }`}
                  ></div>
                </div>

                {/* Corner Brackets */}
                <div className="absolute top-2 left-2 w-4 h-4 border-l-2 border-t-2 border-gray-600/50"></div>
                <div className="absolute top-2 right-2 w-4 h-4 border-r-2 border-t-2 border-gray-600/50"></div>
                <div className="absolute bottom-2 left-2 w-4 h-4 border-l-2 border-b-2 border-gray-600/50"></div>
                <div className="absolute bottom-2 right-2 w-4 h-4 border-r-2 border-b-2 border-gray-600/50"></div>
              </div>
            );
          })}
        </div>

        {/* Bottom Stats */}
        <div className="mt-16 text-center">
          <div className="flex sm:flex-row items-center justify-center bg-black/30 backdrop-blur-md border border-gray-700/50 rounded-lg px-4 sm:px-8 py-4 gap-4 sm:gap-8 max-w-3xl mx-auto">
            <div className="text-center">
              <div className="text-2xl font-mono text-green-400">3+</div>
              <div className="text-xs text-gray-400 uppercase tracking-wider">
                Analysis Stages
              </div>
            </div>

            <div className="hidden sm:block w-px h-8 bg-gray-700/50"></div>

            <div className="text-center">
              <div className="text-2xl font-mono text-blue-400">24/7</div>
              <div className="text-xs text-gray-400 uppercase tracking-wider">
                Availability
              </div>
            </div>

            <div className="hidden sm:block w-px h-8 bg-gray-700/50"></div>

            <div className="text-center">
              <div className="text-2xl font-mono text-orange-400">∞</div>
              <div className="text-xs text-gray-400 uppercase tracking-wider">
                Use Cases
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeatureCards;
