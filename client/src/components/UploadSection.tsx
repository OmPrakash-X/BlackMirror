import { useState, useCallback } from "react";
import { Upload, FileVideo, FileImage, Loader2, Shield, AlertTriangle } from "lucide-react";
import { useDropzone } from "react-dropzone";
import { Button } from "./ui/button";
import { useAppDispatch } from "../hooks/redux";
import { toast } from "sonner";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

interface UploadSectionProps {
  onUploadSuccess: (jobData: any) => void;
}

const UploadSection: React.FC<UploadSectionProps> = ({ onUploadSuccess }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const dispatch = useAppDispatch();

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    // Validate file type
    const isImage = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');
    
    if (!isImage && !isVideo) {
      toast.error("Invalid file type. Please upload an image or video.");
      return;
    }

    const mediaType = isImage ? 'image' : 'video';
    
    setIsUploading(true);
    setUploadProgress(10);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('mediaType', mediaType);

      const response = await axios.post(
        `${API_BASE_URL}/api/job/upload`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          withCredentials: true,
          onUploadProgress: (progressEvent) => {
            const progress = Math.round(
              (progressEvent.loaded * 100) / (progressEvent.total || 1)
            );
            setUploadProgress(progress);
          },
        }
      );

      if (response.data.success) {
        toast.success("🎯 File uploaded! AI analysis started...", {
          duration: 4000,
        });
        
        onUploadSuccess({
          job: response.data.job,
          fileUrl: response.data.fileUrl,
          mediaType
        });
      }

    } catch (error: any) {
      console.error('Upload failed:', error);
      
      const errorMessage = error.response?.data?.message || 'Upload failed';
      toast.error(`❌ Upload failed: ${errorMessage}`);
      
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  }, [onUploadSuccess]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpg', '.jpeg', '.png'],
      'video/*': ['.mp4', '.avi', '.mov', '.mkv', '.webm']
    },
    maxFiles: 1,
    maxSize: 50 * 1024 * 1024, // 50MB
    disabled: isUploading
  });

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Shield className="w-8 h-8 text-green-400" />
          <span className="text-green-400 font-mono text-lg tracking-wider uppercase">
            Threat Detection System
          </span>
        </div>
        <h1 className="text-4xl font-bold text-white mb-4">
          Deepfake Analysis Portal
        </h1>
        <p className="text-gray-300 text-lg max-w-2xl mx-auto">
          Upload suspicious media files for AI-powered deepfake detection and threat assessment
        </p>
      </div>

      {/* Upload Zone */}
      <div
        {...getRootProps()}
        className={`
          relative border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer
          transition-all duration-300 backdrop-blur-xl
          ${isDragActive 
            ? 'border-green-400 bg-green-400/10' 
            : 'border-gray-600 bg-white/5 hover:border-orange-400 hover:bg-orange-400/5'
          }
          ${isUploading ? 'pointer-events-none opacity-70' : ''}
        `}
      >
        <input {...getInputProps()} />
        
        {isUploading ? (
          <div className="space-y-4">
            <Loader2 className="w-16 h-16 mx-auto text-orange-400 animate-spin" />
            <div className="space-y-2">
              <p className="text-lg font-semibold text-white">
                Uploading & Starting Analysis...
              </p>
              <div className="w-full bg-gray-700 rounded-full h-2 max-w-md mx-auto">
                <div
                  className="bg-gradient-to-r from-green-400 to-orange-400 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p className="text-sm text-gray-400">{uploadProgress}% complete</p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex justify-center gap-4">
              <FileImage className="w-12 h-12 text-blue-400" />
              <Upload className="w-12 h-12 text-green-400" />
              <FileVideo className="w-12 h-12 text-purple-400" />
            </div>
            
            <div className="space-y-2">
              <p className="text-xl font-semibold text-white">
                {isDragActive ? "Drop files here" : "Drag & drop or click to select"}
              </p>
              <p className="text-gray-400">
                Supports images (JPG, PNG) and videos (MP4, MKV)
              </p>
              <p className="text-sm text-gray-500">Maximum file size: 50MB</p>
            </div>

            <Button
              className="bg-gradient-to-r from-green-400 to-orange-400 hover:from-green-500 hover:to-orange-500 
                         text-black font-mono uppercase tracking-wider px-8 py-3 rounded-lg shadow-lg 
                         hover:scale-105 transition-all duration-300"
            >
              <Upload className="w-5 h-5 mr-2" />
              Select Files
            </Button>
          </div>
        )}

        {/* Security Notice */}
        <div className="absolute bottom-4 left-4 right-4">
          <div className="flex items-center justify-center gap-2 text-xs text-gray-500 bg-gray-900/50 px-4 py-2 rounded-lg">
            <AlertTriangle className="w-4 h-4" />
            <span>All uploads are encrypted and processed securely</span>
          </div>
        </div>
      </div>

      {/* Supported Formats */}
      <div className="mt-8 grid grid-cols-2 gap-4 text-center">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4">
          <FileImage className="w-8 h-8 text-blue-400 mx-auto mb-2" />
          <h3 className="font-semibold text-white mb-1">Images</h3>
          <p className="text-sm text-gray-400">JPG, PNG</p>
        </div>
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4">
          <FileVideo className="w-8 h-8 text-purple-400 mx-auto mb-2" />
          <h3 className="font-semibold text-white mb-1">Videos</h3>
          <p className="text-sm text-gray-400">MP4, MKV</p>
        </div>
      </div>
    </div>
  );
};

export default UploadSection;
