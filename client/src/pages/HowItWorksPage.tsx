import { Suspense, useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { useNavigate } from "react-router-dom";
import { Shield, ChevronLeft, ChevronRight, Home } from "lucide-react";

import { useTypewriter } from "../hooks/useTypewriter";
import {
  UploadScene,
  PrepScene,
  NeuralScene,
  GaugeScene,
  VideoScene,
  RiskScene,
  VerdictScene,
  CameraController,
  SCENES,
} from "../components/how-it-works";

// ─────────────────────────────────────────────
// SCENE MAP
// ─────────────────────────────────────────────
const SCENE_COMPONENTS = [
  UploadScene,
  PrepScene,
  NeuralScene,
  GaugeScene,
  VideoScene,
  RiskScene,
  VerdictScene,
];

// ─────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────
export default function HowItWorksPage() {
  const [currentScene, setCurrentScene] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);
  const navigate = useNavigate();
  const scene = SCENES[currentScene];
  const displayedText = useTypewriter(scene.explainer);
  const SceneComponent = SCENE_COMPONENTS[currentScene];

  useEffect(() => {
    if (!isAutoPlay) return;
    const timer = setTimeout(() => {
      setCurrentScene((p) => (p + 1) % SCENES.length);
    }, 6500);
    return () => clearTimeout(timer);
  }, [currentScene, isAutoPlay]);

  const goNext = () => {
    setIsAutoPlay(false);
    setCurrentScene((p) => (p + 1) % SCENES.length);
  };
  const goPrev = () => {
    setIsAutoPlay(false);
    setCurrentScene((p) => (p - 1 + SCENES.length) % SCENES.length);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#050508",
        color: "#fff",
        fontFamily: "'Inter',sans-serif",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <link
        href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;900&display=swap"
        rel="stylesheet"
      />

      {/* Grid bg */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          backgroundImage:
            "linear-gradient(rgba(0,245,255,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(0,245,255,0.03) 1px,transparent 1px)",
          backgroundSize: "60px 60px",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      {/* Radial glow */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          background: `radial-gradient(ellipse at 50% 50%,${scene.color}18 0%,transparent 70%)`,
          pointerEvents: "none",
          zIndex: 0,
          transition: "background 1s ease",
        }}
      />

      {/* NAVBAR */}
      <nav
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "16px 32px",
          background: "rgba(255, 255, 255, 0.02)",
          backdropFilter: "blur(20px) saturate(200%)",
          WebkitBackdropFilter: "blur(20px) saturate(200%)",
          boxShadow: "0 8px 32px 0 rgba(0, 0, 0, 0.8)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Shield size={22} color="#00f5ff" />
          <span style={{ fontWeight: 900, fontSize: 18, letterSpacing: 2 }}>
            BLACKMIRROR
          </span>
          <span
            style={{
              fontSize: 11,
              fontFamily: "monospace",
              color: "#00f5ff",
              background: "rgba(0,245,255,0.1)",
              border: "1px solid rgba(0,245,255,0.3)",
              borderRadius: 4,
              padding: "2px 8px",
              marginLeft: 8,
            }}
          >
            HOW IT WORKS
          </span>
        </div>
        <button
          onClick={() => navigate("/")}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            background: "rgba(0,245,255,0.08)",
            border: "1px solid rgba(0,245,255,0.25)",
            borderRadius: 8,
            color: "#00f5ff",
            padding: "8px 16px",
            cursor: "pointer",
            fontSize: 13,
            fontFamily: "monospace",
            letterSpacing: 1,
          }}
        >
          <Home size={14} /> BACK TO HOME
        </button>
      </nav>

      {/* 3D CANVAS */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 1,
          clipPath: currentScene === 4 ? "inset(0 0 0 45%)" : "none",
          transition: "clip-path 0.5s ease",
        }}
      >
        <Canvas
          camera={{ position: [0, 0, 7], fov: 60 }}
          gl={{ antialias: true, alpha: true }}
          style={{ background: "transparent" }}
        >
          <Suspense fallback={null}>
            <CameraController />
            <group position={[2.8, 0, 0]} scale={0.78}>
              <SceneComponent />
            </group>
          </Suspense>
        </Canvas>
      </div>

      {/* TEXT CONTENT CONTAINER - LEFT SIDE */}
      <div
        style={{
          position: "fixed",
          top: "50%",
          left: "6%",
          transform: "translateY(-50%)",
          zIndex: 50,
          width: "40%",
          maxWidth: 600,
          display: "flex",
          flexDirection: "column",
          gap: 32,
          alignItems: "flex-start",
        }}
      >
        {/* STEP BADGE */}
        <span
          style={{
            fontFamily: "monospace",
            fontSize: 11,
            color: scene.color,
            background: `${scene.color}18`,
            border: `1px solid ${scene.color}50`,
            borderRadius: 20,
            padding: "6px 16px",
            letterSpacing: 2,
          }}
        >
          {scene.step}
        </span>

        {/* TITLE */}
        <h1
          key={currentScene}
          style={{
            fontSize: "clamp(32px,3.5vw,56px)",
            lineHeight: 1.1,
            fontWeight: 900,
            letterSpacing: -1,
            color: "#fff",
            margin: 0,
            textShadow: `0 0 50px ${scene.color}60`,
            animation: "fadeIn 0.6s ease",
          }}
        >
          {scene.title}
        </h1>

        {/* EXPLAINER */}
        <div
          style={{
            background: "rgba(5,5,8,0.6)",
            backdropFilter: "blur(12px)",
            borderLeft: `3px solid ${scene.color}`,
            padding: "4px 0 4px 24px",
            transition: "border-color 0.5s",
          }}
        >
          <p
            style={{
              fontSize: "clamp(15px,1.1vw,17px)",
              lineHeight: 1.7,
              color: "#d1d5db",
              margin: 0,
              maxWidth: 500,
            }}
          >
            {displayedText}
            <span
              style={{
                display: "inline-block",
                width: 2,
                height: "1em",
                background: scene.color,
                marginLeft: 4,
                verticalAlign: "text-bottom",
                animation: "blink 0.8s step-end infinite",
              }}
            />
          </p>
        </div>
      </div>

      {/* NAVIGATION */}
      <div
        style={{
          position: "fixed",
          bottom: 60,
          left: "6%",
          zIndex: 50,
          display: "flex",
          alignItems: "center",
          gap: 18,
        }}
      >
        <button
          onClick={goPrev}
          style={{
            width: 42,
            height: 42,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.15)",
            color: "#fff",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <ChevronLeft size={18} />
        </button>

        <div style={{ display: "flex", gap: 7, alignItems: "center" }}>
          {SCENES.map((_, i) => (
            <button
              key={i}
              onClick={() => {
                setIsAutoPlay(false);
                setCurrentScene(i);
              }}
              style={{
                width: i === currentScene ? 26 : 8,
                height: 8,
                borderRadius: 4,
                background: i === currentScene ? scene.color : "rgba(255,255,255,0.2)",
                border: "none",
                cursor: "pointer",
                transition: "all 0.3s ease",
                boxShadow: i === currentScene ? `0 0 10px ${scene.color}` : "none",
                padding: 0,
              }}
            />
          ))}
        </div>

        <button
          onClick={goNext}
          style={{
            width: 42,
            height: 42,
            borderRadius: "50%",
            background: `${scene.color}22`,
            border: `1px solid ${scene.color}50`,
            color: scene.color,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <ChevronRight size={18} />
        </button>
      </div>

      {/* AUTO TOGGLE */}
      <div style={{ position: "fixed", top: 88, right: 28, zIndex: 50 }}>
        <button
          onClick={() => setIsAutoPlay((p) => !p)}
          style={{
            fontFamily: "monospace",
            fontSize: 11,
            color: isAutoPlay ? "#10b981" : "#6b7280",
            background: isAutoPlay ? "rgba(16,185,129,0.1)" : "rgba(107,114,128,0.1)",
            border: `1px solid ${isAutoPlay ? "rgba(16,185,129,0.3)" : "rgba(107,114,128,0.3)"
              }`,
            borderRadius: 6,
            padding: "6px 12px",
            cursor: "pointer",
            letterSpacing: 1,
          }}
        >
          {isAutoPlay ? "⏸ AUTO" : "▶ AUTO"}
        </button>
      </div>

      {/* COUNTER */}
      <div
        style={{
          position: "fixed",
          top: 88,
          left: 28,
          zIndex: 50,
          fontFamily: "monospace",
          fontSize: 12,
          color: "rgba(255,255,255,0.3)",
          letterSpacing: 2,
        }}
      >
        {String(currentScene + 1).padStart(2, "0")} /{" "}
        {String(SCENES.length).padStart(2, "0")}
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity:0; transform:translateY(-10px); } to { opacity:1; transform:translateY(0); } }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
      `}</style>
    </div>
  );
}
