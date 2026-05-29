
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Upload, X, Image, Loader2, Sparkles } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

interface FileUploadProps {
  onFileUploaded: (url: string) => void;
  currentImageUrl?: string;
  accept?: string;
  maxSize?: number; // in MB
}

const FileUpload: React.FC<FileUploadProps> = ({
  onFileUploaded,
  currentImageUrl,
  accept = "image/*",
  maxSize = 10
}) => {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const { toast } = useToast();

  const uploadFile = async (file: File) => {
    if (file.size > maxSize * 1024 * 1024) {
      toast({
        title: "File too large",
        description: `File size must be less than ${maxSize}MB`,
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${API_URL}/api/upload`, {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Upload failed');
      }

      const fullUrl = `${API_URL}${result.data.url}`;
      onFileUploaded(fullUrl);

      toast({
        title: "Success",
        description: "Image uploaded successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload file",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      uploadFile(file);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragOver(false);

    const file = event.dataTransfer.files[0];
    if (file) {
      uploadFile(file);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const removeImage = () => {
    onFileUploaded('');
  };

  return (
    <div className="space-y-4">
      {currentImageUrl ? (
        <div className="relative group rounded-2xl overflow-hidden border border-white/10 aspect-video bg-[#0a0a0a]">
          <img
            src={currentImageUrl}
            alt="Preview"
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col items-center justify-center gap-3 backdrop-blur-[2px]">
            <Button
              variant="destructive"
              size="sm"
              onClick={removeImage}
              className="bg-red-500/20 hover:bg-red-500 text-red-400 hover:text-white border border-red-500/30 rounded-xl px-6"
            >
              <X className="h-4 w-4 mr-2" />
              Remove Image
            </Button>
          </div>
          <div className="absolute top-4 left-4">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 text-white text-[8px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.5)]" />
              Active Image
            </div>
          </div>
        </div>
      ) : (
        <div
          className={`relative border-2 border-dashed rounded-[28px] h-48 flex flex-col items-center justify-center cursor-pointer transition-all duration-500 group overflow-hidden ${dragOver
              ? 'border-white/40 bg-white/10'
              : 'border-white/5 hover:border-white/20 bg-white/[0.02] hover:bg-white/[0.05]'
            }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => document.getElementById('file-input')?.click()}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none" />
          
          <Input
            id="file-input"
            type="file"
            accept={accept}
            onChange={handleFileSelect}
            className="hidden"
            disabled={uploading}
          />

          <div className="relative z-10 flex flex-col items-center text-center px-6">
            {uploading ? (
              <>
                <div className="relative">
                  <div className="absolute inset-0 blur-xl bg-white/20 rounded-full animate-pulse" />
                  <Loader2 className="h-10 w-10 text-white animate-spin relative" />
                </div>
                <p className="text-white/70 font-bold uppercase tracking-[0.2em] text-[10px] mt-4">Uploading...</p>
              </>
            ) : (
              <>
                <div className="mb-4 p-4 rounded-2xl bg-white/5 border border-white/5 group-hover:scale-110 group-hover:bg-white/10 transition-all duration-500">
                  <Upload className="h-6 w-6 text-white/40 group-hover:text-white transition-colors" />
                </div>
                <div>
                  <p className="text-white/80 font-bold uppercase tracking-[0.1em] text-xs">
                    Drop your image here
                  </p>
                  <p className="text-[10px] font-medium text-white/20 mt-2 uppercase tracking-widest">
                    PNG, JPG, WebP up to {maxSize}MB
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
