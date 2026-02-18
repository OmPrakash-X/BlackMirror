import { useState } from "react";
import { Button } from "./ui/button";
import {
  X,
  Eye,
  EyeOff,
  Mail,
  Lock,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setUserData } from "../../src/redux/slices/userSlice";
import axios from "axios";
import { toast } from "sonner";

/* ================= API ================= */
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

/* ================= TYPES ================= */
type LoginProps = {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToRegister: () => void;
};

const Login = ({ isOpen, onClose, onSwitchToRegister }: LoginProps) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  if (!isOpen) return null;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({});

  /* ================= VALIDATION ================= */
  const validate = () => {
    const newErrors: typeof errors = {};

    if (!email) newErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      newErrors.email = "Invalid email address";

    if (!password) newErrors.password = "Password is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /* ================= LOGIN ================= */
  const handleLogin = async () => {
    if (!validate()) return;

    try {
      setLoading(true);
      setErrors({});

      const res = await api.post("/api/user/login", {
        email,
        password,
      });

      if (!res.data?.success) {
        throw new Error(res.data?.message || "Login failed");
      }

      // ✅ Store user in Redux
      dispatch(setUserData(res.data.user));

      toast.success("Login successful");
      onClose();
      navigate("/dashboard");
    } catch (err: any) {
      setErrors({
        general:
          err.response?.data?.message ||
          "Unable to login. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  /* ================= UI ================= */
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md bg-white/5 backdrop-blur-xl border border-white/20 rounded-2xl p-8 shadow-2xl">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-white/70 hover:text-white"
          disabled={loading}
        >
          <X className="w-6 h-6" />
        </button>

        {/* Header (THEME FIXED) */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-white">Welcome Back</h2>
          <p className="text-gray-400 text-sm">
            Sign in to continue to your dashboard
          </p>
        </div>

        {/* General Error */}
        {errors.general && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-400/50 rounded-lg text-red-400 text-sm flex gap-2">
            <AlertCircle className="w-4 h-4" />
            {errors.general}
          </div>
        )}

        {/* Form */}
        <div className="space-y-4">
          {/* Email */}
          <div>
            <label className="text-sm text-gray-300">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full pl-10 pr-4 py-3 bg-white/10 border rounded-lg text-white focus:outline-none ${
                  errors.email
                    ? "border-red-400"
                    : email
                    ? "border-green-400"
                    : "border-white/20"
                }`}
                placeholder="you@example.com"
                disabled={loading}
              />
              {email && !errors.email && (
                <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 text-green-400 w-5 h-5" />
              )}
            </div>
            {errors.email && (
              <p className="text-red-400 text-sm mt-1">{errors.email}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="text-sm text-gray-300">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full pl-10 pr-12 py-3 bg-white/10 border rounded-lg text-white focus:outline-none ${
                  errors.password
                    ? "border-red-400"
                    : password
                    ? "border-green-400"
                    : "border-white/20"
                }`}
                placeholder="••••••••"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
              >
                {showPassword ? <EyeOff /> : <Eye />}
              </button>
            </div>
            {errors.password && (
              <p className="text-red-400 text-sm mt-1">{errors.password}</p>
            )}
          </div>

          {/* Submit */}
          <Button
            onClick={handleLogin}
            disabled={loading}
            className="w-full bg-gradient-to-r from-green-400 to-orange-400 text-black font-mono py-3 rounded-lg hover:scale-105 transition-all disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Login"}
          </Button>
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-gray-400 text-sm">
          Don’t have an account?{" "}
          <button
            onClick={onSwitchToRegister}
            className="text-orange-400 hover:text-orange-300"
            disabled={loading}
          >
            Register
          </button>
        </p>
      </div>
    </div>
  );
};

export default Login;
