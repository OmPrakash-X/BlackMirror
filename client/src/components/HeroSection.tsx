import { Button } from "@/components/ui/button";
import { Upload, Shield, LogIn, LogOut } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import type { AxiosResponse } from "axios";
import { clearUserData } from "@/redux/slices/userSlice";
import { toast } from "sonner";

// Placeholder ImageWithFallback component
const ImageWithFallback = ({ src, alt, className }: any) => (
  <img src={src} alt={alt} className={className} />
);

type HeroSectionProps = {
  onGetStarted: () => void;
  onLogin: () => void;
};

interface LogoutResponse {
  success: boolean;
  message: string;
}

const HeroSection = ({ onGetStarted, onLogin }: HeroSectionProps) => {
  const { userData } = useSelector((state: any) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = async (): Promise<void> => {
    try {
      const res: AxiosResponse<LogoutResponse> = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/user/logout`,
        { withCredentials: true }
      );

      console.log("✅ Logout response:", res.data);

      if (res.data.success) {
        dispatch(clearUserData());
        navigate("/");
        toast.success("Logged out successfully");
      } else {
        console.error("❌ Logout failed:", res.data.message);
      }
    } catch (error) {
      console.error("❌ Logout error:", error);
    }
  };

  return (
    <section className="min-h-screen relative flex items-center justify-center px-4 sm:px-6 md:px-12 overflow-hidden">
      {/* Animated Background Grid */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,0,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,0,0.1)_1px,transparent_1px)] bg-[size:50px_50px] animate-pulse sm:bg-[size:25px_25px]"></div>
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full border border-green-400/30 animate-ping sm:w-48 sm:h-48"></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full border border-orange-400/30 animate-ping animation-delay-1000 sm:w-32 sm:h-32"></div>
      </div>

      {/* Radar Sweep Animation */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border border-green-400/20 rounded-full animate-spin-slow opacity-60 sm:w-[400px] sm:h-[400px]"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-green-400/30 rounded-full animate-spin-slow animation-delay-2000 opacity-40 sm:w-[300px] sm:h-[300px]"></div>
      </div>

      <div className="w-full max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center relative z-10 hero-padding">
        {/* Left Side - Hero Content */}
        <div className="space-y-8 sm:space-y-6">
          {/* Badge */}
          <div className="flex items-center gap-2 text-green-400 mt-12 mb-0">
            <Shield className="w-5 h-5" />
            <span className="text-sm font-mono tracking-wider uppercase">
              ADVANCED AI TECHNOLOGY
            </span>
          </div>

          {/* Main Headline */}
          <div className="space-y-4 sm:space-y-3">
            <h1 className="text-5xl lg:text-7xl font-black tracking-tight text-white leading-tight">
              VERIFY
              {" "}
              <span className="bg-gradient-to-r from-green-400 to-orange-400 bg-clip-text text-transparent">
                 TRUTH
              </span>
              <br />
              IN REAL{" "}
              <span className="text-red-400 animate-pulse">TIME</span>
            </h1>

            <p className="text-xl text-gray-300 max-w-lg leading-relaxed">
              AI-powered deepfake detection for everyone. Advanced analysis to identify and verify authentic media in seconds.
            </p>
          </div>

          {/* Stats */}
          <div className="flex gap-8 text-sm sm:gap-4">
            <div className="text-center">
              <div className="text-2xl font-mono text-orange-400">99.7%</div>
              <div className="text-gray-400 uppercase tracking-wide">
                Accuracy Rate
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-mono text-green-400">{"<2s"}</div>
              <div className="text-gray-400 uppercase tracking-wide">
                Analysis Time
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-mono text-red-400 ">INSTANT</div>
              <div className="text-gray-400 uppercase tracking-wide">
                RESULTS
              </div>
            </div>
          </div>
          {/* CTA Buttons */}
          {!userData ? (
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Get Started Button */}
              <Button
                size="lg"
                className="bg-gradient-to-r from-green-400 to-orange-400 hover:from-green-500 hover:to-orange-500 text-black font-mono uppercase tracking-wider px-10 py-4 text-base cursor-pointer rounded-lg shadow-2xl shadow-green-400/25 transition-all duration-300 hover:scale-105 inline-flex items-center gap-2"
                onClick={onGetStarted}
              >
                <Upload className="w-5 h-5" />
                GET STARTED
              </Button>

              {/* Login Button */}
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-orange-400 text-orange-400 hover:bg-orange-400 hover:text-black font-mono uppercase tracking-wider px-10 py-4 text-base cursor-pointer rounded-lg transition-all duration-300 hover:scale-105 inline-flex items-center gap-2 bg-transparent"
                onClick={onLogin}
              >
                <LogIn className="w-5 h-5" />
                LOGIN
              </Button>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                size="lg"
                variant="outline"
                className="bg-gradient-to-r from-green-400 to-orange-400 hover:from-green-500 hover:to-orange-500 text-black font-mono uppercase tracking-wider px-10 py-4 text-base cursor-pointer rounded-lg shadow-2xl shadow-green-400/25 transition-all duration-300 hover:scale-105 inline-flex items-center gap-2"
                onClick={() => navigate("/dashboard")}
              >
                <LogIn className="w-5 h-5" />
                DASHBOARD
              </Button>
              <button
                className=" hover:from-green-500 hover:to-orange-500 text-red-600   font-mono uppercase tracking-wider  text-base cursor-pointer rounded-lg shadow-2xl shadow-green-400/25 transition-all duration-300 hover:scale-105 inline-flex items-center gap-2"
                onClick={() => handleLogout()}
              >
                LOGOUT
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          )}

          {/* Security Notice */}
          <div className="inline-flex text-xs text-gray-500 font-mono bg-gray-900/50 px-8 py-3 rounded-md border border-gray-700/50">
            🔒 SECURE • ENCRYPTED • PRIVATE
          </div>
        </div>

        {/* Right Side - Futuristic Tech Visual */}
        <div className="relative">
          {/* Main Hero Image */}
          <div className="relative">
            <ImageWithFallback
              src="https://images.unsplash.com/photo-1609579857457-182bbcd11230?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmdXR1cmlzdGljJTIwc29sZGllciUyMGhvbG9ncmFtJTIwY3liZXJ8ZW58MXx8fHwxNzU3OTk1NzI5fDA&ixlib=rb-4.1.0&q=80&w=1080"
              alt="AI Technology"
              className="w-full h-[600px] object-cover rounded-lg opacity-80"
            />

            {/* Holographic Overlay Effects */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent rounded-lg"></div>

            {/* HUD Overlays */}
            <div className="absolute top-4 right-4 bg-black/70 backdrop-blur-sm border border-green-400/50 rounded p-3 sm:p-2">
              <div className="text-green-400 font-mono text-xs space-y-1 sm:space-y-0.5">
                <div>STATUS: ACTIVE</div>
                <div>
                  ANALYSIS:
                  <span className="text-orange-400 ml-2">PROCESSING</span>
                </div>
                <div>AI ENGINE: ONLINE</div>
              </div>
            </div>

            <div className="absolute bottom-4 left-4 bg-black/70 backdrop-blur-sm border border-blue-400/50 rounded p-3 sm:p-2">
              <div className="text-blue-400 font-mono text-xs space-y-1 sm:space-y-0.5">
                <div>SCAN PROGRESS: 100%</div>
                <div>AUTHENTICITY: VERIFIED</div>
                <div>CONFIDENCE: 99.7%</div>
              </div>
            </div>

            {/* Scanning Line Effect */}
            <div className="absolute inset-0 opacity-30">
              <div className="absolute w-full h-1 bg-gradient-to-r from-transparent via-green-400 to-transparent animate-scan sm:h-0.5"></div>
            </div>
          </div>

          {/* Floating Data Points (hide on phones to prevent side-scroll) */}
          <div className="absolute -top-8 -left-8 w-4 h-4 bg-green-400 rounded-full animate-pulse hidden sm:block"></div>
          <div className="absolute -bottom-8 -right-8 w-3 h-3 bg-orange-400 rounded-full animate-pulse animation-delay-500 hidden sm:block"></div>
          <div className="absolute top-1/2 -right-12 w-2 h-2 bg-blue-400 rounded-full animate-pulse animation-delay-1000 hidden sm:block"></div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;