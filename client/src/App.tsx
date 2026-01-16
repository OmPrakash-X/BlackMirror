import HeroSection from "./components/HeroSection";
import FeatureCards from "./components/FeatureCards";
import TechSection from "./components/TechSection";
import DashboardPreview from "./components/DashboardPreview";
import Footer from "./components/Footer";
import { Routes, Route } from "react-router-dom";
import Register from "./components/Register";
import { useState } from "react";
import Login from "./components/Login";
import useGetUser from "./hooks/useGetUser";
import AnalysisPage from "./pages/AnalysisPage";
import DashBoard from "./components/DashBoard";

type ModalType = "none" | "register" | "login";

export default function App() {
  const [activeModal, setActiveModal] = useState<ModalType>("none");

  const openRegister = () => setActiveModal("register");
  const openLogin = () => setActiveModal("login");
  const closeModal = () => setActiveModal("none");

  const switchToLogin = () => setActiveModal("login");
  const switchToRegister = () => setActiveModal("register");
  useGetUser();

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      {/* CSS Custom Animations */}
      <style>{`
        @keyframes scan {
          0% { transform: translateY(0); opacity: 0; }
          50% { opacity: 1; }
          100% { transform: translateY(100vh); opacity: 0; }
        }
        
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        .animate-scan {
          animation: scan 3s linear infinite;
        }
        
        .animate-spin-slow {
          animation: spin-slow 20s linear infinite;
        }
        
        .animation-delay-500 {
          animation-delay: 0.5s;
        }
        
        .animation-delay-1000 {
          animation-delay: 1s;
        }
        
        .animation-delay-2000 {
          animation-delay: 2s;
        }

        /* Glowing border effect for glassmorphism */
        .glow-border {
          position: relative;
          border: 1px solid rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
        }
        
        .glow-border::before {
          content: '';
          position: absolute;
          inset: -1px;
          padding: 1px;
          background: linear-gradient(45deg, transparent, rgba(0, 255, 0, 0.3), transparent, rgba(255, 165, 0, 0.3), transparent);
          border-radius: inherit;
          mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          mask-composite: exclude;
          animation: rotate 2s linear infinite;
        }
        
        @keyframes rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        /* Particle effect */
        .particles {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 1;
        }
        
        .particle {
          position: absolute;
          width: 2px;
          height: 2px;
          background: rgba(0, 255, 0, 0.5);
          border-radius: 50%;
          animation: float 10s linear infinite;
        }
        
        @keyframes float {
          0% { transform: translateY(100vh) translateX(0); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(-10vh) translateX(100px); opacity: 0; }
        }
      `}</style>

      {/* Floating Particles Background */}
      <div className="particles">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="particle"
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 10}s`,
              animationDuration: `${10 + Math.random() * 5}s`,
            }}
          />
        ))}
      </div>

      {/* Routes */}
      <Routes>
        <Route
          path="/"
          element={
            <>
              {/* Main Content */}
              <main className="relative z-10">
                <HeroSection onGetStarted={openRegister} onLogin={openLogin} />
                <FeatureCards />
                <TechSection />
                <DashboardPreview />
                <Footer />
              </main>
            </>
          }
        />
        <Route path="/dashboard" element={<DashBoard />} />
        <Route path="/analyze" element={<AnalysisPage />} />
      </Routes>

      {/* Modals */}
      {activeModal === "register" && (
        <Register
          isOpen={true}
          onClose={closeModal}
          onSwitchToLogin={switchToLogin}
        />
      )}

      {activeModal === "login" && (
        <Login
          isOpen={true}
          onClose={closeModal}
          onSwitchToRegister={switchToRegister}
        />
      )}

      {/* Global Background Pattern */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_25%,rgba(0,255,0,0.1),transparent_50%),radial-gradient(circle_at_75%_75%,rgba(255,165,0,0.1),transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:100px_100px]"></div>
      </div>
    </div>
  );
}
