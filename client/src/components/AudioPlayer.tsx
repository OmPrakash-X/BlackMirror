import React, { useState, useRef } from "react";
import { Play, Pause, Volume2, Music, VolumeX } from "lucide-react";

interface AudioPlayerProps {
    src: string;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ src }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [duration, setDuration] = useState(0);
    const [isMuted, setIsMuted] = useState(false);
    const audioRef = useRef<HTMLAudioElement>(null);

    const togglePlay = () => {
        if (audioRef.current) {
            if (isPlaying) {
                audioRef.current.pause();
            } else {
                audioRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    const handleTimeUpdate = () => {
        if (audioRef.current) {
            const current = audioRef.current.currentTime;
            const total = audioRef.current.duration;
            setProgress((current / total) * 100);
        }
    };

    const handleLoadedMetadata = () => {
        if (audioRef.current) {
            setDuration(audioRef.current.duration);
        }
    };

    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
        const seekTime = (Number(e.target.value) / 100) * duration;
        if (audioRef.current) {
            audioRef.current.currentTime = seekTime;
            setProgress(Number(e.target.value));
        }
    };

    const toggleMute = () => {
        if (audioRef.current) {
            audioRef.current.muted = !isMuted;
            setIsMuted(!isMuted);
        }
    };

    const formatTime = (time: number) => {
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds.toString().padStart(2, "0")}`;
    };

    return (
        <div className="w-full bg-black/40 backdrop-blur-md border border-gray-700/50 rounded-xl p-6 flex flex-col gap-4 relative overflow-hidden group">
            {/* Background Glow */}
            <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 to-red-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            <div className="flex items-center gap-4 relative z-10">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-400/20 to-red-400/20 border border-orange-400/30 flex items-center justify-center shadow-[0_0_15px_rgba(251,146,60,0.1)]">
                    <Music className="w-6 h-6 text-orange-400" />
                </div>
                <div className="flex-1 min-w-0">
                    <div className="text-sm font-mono text-gray-400 uppercase tracking-widest mb-1">Audio Signal</div>
                    <div className="text-white font-bold truncate">Waveform Analysis Module</div>
                </div>
            </div>

            {/* Premium Waveform Visualizer */}
            <div className="space-y-4 relative z-10 font-mono">
                <style>
                    {`
                        @keyframes oscillate {
                            0%, 100% { height: 15%; }
                            50% { height: var(--peak, 90%); }
                        }
                        .bar-animate {
                            animation: oscillate var(--duration, 0.8s) ease-in-out infinite;
                            animation-delay: var(--delay, 0s);
                        }
                        
                        /* Custom Slider Styling */
                        .custom-slider {
                            -webkit-appearance: none;
                            width: 100%;
                            height: 4px;
                            background: linear-gradient(to right, #ea580c 0%, #fb923c var(--progress, 0%), rgba(255, 255, 255, 0.1) var(--progress, 0%));
                            border-radius: 2px;
                            outline: none;
                            transition: all 0.2s ease;
                        }
                        .custom-slider::-webkit-slider-thumb {
                            -webkit-appearance: none;
                            appearance: none;
                            width: 12px;
                            height: 12px;
                            background: #fb923c;
                            border-radius: 50%;
                            cursor: pointer;
                            border: 2px solid #000;
                            box-shadow: 0 0 10px rgba(251, 146, 60, 0.5);
                            transition: all 0.2s ease;
                        }
                        .custom-slider::-webkit-slider-thumb:hover {
                            transform: scale(1.2);
                            background: #fff;
                        }
                        .custom-slider::-moz-range-thumb {
                            width: 12px;
                            height: 12px;
                            background: #fb923c;
                            border-radius: 50%;
                            cursor: pointer;
                            border: 2px solid #000;
                            box-shadow: 0 0 10px rgba(251, 146, 60, 0.5);
                        }
                    `}
                </style>
                <div className="h-16 flex items-end gap-1 px-1 overflow-hidden">
                    {[...Array(24)].map((_, i) => (
                        <div
                            key={i}
                            className={`flex-1 bg-gradient-to-t from-orange-500 via-red-400 to-red-500 rounded-t-sm transition-all duration-300 ${isPlaying ? "bar-animate" : "opacity-30"
                                }`}
                            style={{
                                height: "15%",
                                "--peak": `${40 + Math.random() * 60}%`,
                                "--duration": `${0.4 + Math.random() * 0.6}s`,
                                "--delay": `${i * 0.05}s`,
                            } as React.CSSProperties}
                        />
                    ))}
                </div>

                <div className="relative group/slider">
                    <input
                        type="range"
                        min="0"
                        max="100"
                        value={progress || 0}
                        onChange={handleSeek}
                        className="custom-slider relative z-20"
                        style={{ "--progress": `${progress}%` } as React.CSSProperties}
                    />
                </div>

                <div className="flex justify-between text-[10px] font-mono text-gray-500">
                    <span>{formatTime(audioRef.current?.currentTime || 0)}</span>
                    <span>{formatTime(duration)}</span>
                </div>
            </div>

            <div className="flex items-center justify-between relative z-10">
                <button
                    onClick={togglePlay}
                    className="w-10 h-10 rounded-full bg-orange-500 hover:bg-orange-400 text-black flex items-center justify-center transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(251,146,60,0.3)]"
                >
                    {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-1" />}
                </button>

                <div className="flex items-center gap-3 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full">
                    <button onClick={toggleMute} className="text-gray-400 hover:text-white transition-colors">
                        {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                    </button>
                    <div className="w-16 h-1 bg-gray-700 rounded-full overflow-hidden">
                        <div className="w-3/4 h-full bg-gray-400" />
                    </div>
                </div>
            </div>

            <audio
                ref={audioRef}
                src={src}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onEnded={() => setIsPlaying(false)}
                className="hidden"
            />
        </div>
    );
};

export default AudioPlayer;
