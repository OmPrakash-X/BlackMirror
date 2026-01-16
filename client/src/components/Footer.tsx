import { Shield, Github, Twitter, Linkedin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="py-12 sm:py-16 px-4 sm:px-6 border-t border-gray-800/50 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,0,0.02)_1px,transparent_1px)] bg-[size:50px_50px]"></div>

      <div className="container mx-auto relative z-10 max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6 lg:gap-8 items-start md:items-center">
          {/* Left - Branding */}
          <div className="space-y-4 text-center md:text-left">
            <div className="flex items-center gap-3 justify-center md:justify-start">
              <Shield className="w-8 h-8 text-green-400 flex-shrink-0" />
              <div className="min-w-0">
                <h3 className="text-xl sm:text-2xl font-black text-white">
                  BLACKMIRROR
                </h3>
                <p className="text-xs text-gray-400 font-mono uppercase tracking-wide">
                  AI Media Authenticity Analyzer
                </p>
              </div>
            </div>

            <div className="text-sm text-gray-500 space-y-1">
              <div>Built at HACK FOR TOMORROW 2.0</div>
              <div className="text-xs">
                AI-powered solution for detecting manipulated media
              </div>
              <div className="break-words text-xs mb-2">
                Artificial Intelligence • Media Analysis • Trust & Safety
              </div>
            </div>
          </div>

          {/* Center - Mission Statement */}
          <div className="order-3 md:order-2">
            <div className="bg-gradient-to-r from-green-400/10 to-orange-400/10 border border-green-400/20 rounded-lg p-4">
              <div className="text-green-400 font-mono text-xs uppercase tracking-wider mb-2 text-center">
                Mission Statement
              </div>
              <p className="text-sm text-gray-300 text-center leading-relaxed">
                Helping people verify the authenticity of digital media and
                promote trust in online content using accessible AI technology.
              </p>
            </div>
          </div>

          {/* Right - Social & Team */}
          <div className="space-y-4 order-2 md:order-3">
            {/* Social Links */}
            <div className="flex justify-center md:justify-end gap-4">
              <a
                href="#"
                className="w-10 h-10 bg-gray-800/50 border border-gray-700/50 rounded-lg flex items-center justify-center text-gray-400 hover:text-green-400 hover:border-green-400/50 transition-colors flex-shrink-0"
              >
                <Github className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 bg-gray-800/50 border border-gray-700/50 rounded-lg flex items-center justify-center text-gray-400 hover:text-blue-400 hover:border-blue-400/50 transition-colors flex-shrink-0"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 bg-gray-800/50 border border-gray-700/50 rounded-lg flex items-center justify-center text-gray-400 hover:text-blue-600 hover:border-blue-600/50 transition-colors flex-shrink-0"
              >
                <Linkedin className="w-5 h-5" />
              </a>
            </div>

            {/* Team Credits */}
            <div className="text-center md:text-right text-xs text-gray-500 font-mono space-y-2">
              <div className="text-gray-400 uppercase tracking-wider">
                Development Team
              </div>

              <div className="text-green-400 font-bold">Stack Pirates</div>
              <div className="space-y-1 leading-relaxed">
                 <div>Mir Afaque Alli</div>
                <div>Om Prakash Nayak</div>
                <div>Puspalata Panigrahi</div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 sm:mt-12 pt-4 sm:pt-6 border-t border-gray-800/30">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-500">
            <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-6 text-center sm:text-left">
              <div className="whitespace-nowrap">
                © 2025 BlackMirror. All rights reserved.
              </div>
              <div className="flex items-center gap-1 whitespace-nowrap">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse flex-shrink-0"></div>
                <span>System Status: Online</span>
              </div>
            </div>

            <div className="flex items-center gap-4 sm:gap-6 font-mono">
              <a href="#" className="hover:text-green-400 transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="hover:text-green-400 transition-colors">
                Terms of Service
              </a>
              <a href="#" className="hover:text-green-400 transition-colors">
                Data Protection
              </a>
            </div>
          </div>
        </div>

        {/* Security Notice */}
        <div className="mt-4 sm:mt-6 text-center">
          <div className="inline-flex items-center gap-2 bg-green-400/5 border border-green-400/20 rounded px-3 sm:px-4 py-2 text-xs text-green-400 font-mono max-w-full">
            <Shield className="w-3 h-3 flex-shrink-0" />
            <span className="break-all sm:break-normal">
              PRIVACY-FIRST • SECURE PROCESSING • NO PERMANENT STORAGE
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
