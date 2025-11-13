import React, { useRef, useState } from 'react';
import { Upload, X, File, Image as ImageIcon, Film, FileText, Loader2 } from 'lucide-react';

export interface FileUploadProps {
  value?: string; // Current file URL
  onChange: (url: string | null) => void;
  onUpload: (file: File, onProgress: (progress: number) => void) => Promise<{ success: boolean; url?: string; error?: string }>;
  onDelete?: (url: string) => Promise<void>;
  accept?: string;
  maxSize?: number; // in MB
  label?: string;
  placeholder?: string;
  type?: 'image' | 'video' | 'pdf' | 'file';
  disabled?: boolean;
  required?: boolean;
}

export default function FileUpload({
  value,
  onChange,
  onUpload,
  onDelete,
  accept = 'image/*',
  maxSize = 10,
  label,
  placeholder = 'Click to upload or drag and drop',
  type = 'image',
  disabled = false,
  required = false,
}: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getIcon = () => {
    switch (type) {
      case 'image':
        return <ImageIcon className="w-8 h-8" />;
      case 'video':
        return <Film className="w-8 h-8" />;
      case 'pdf':
        return <FileText className="w-8 h-8" />;
      default:
        return <File className="w-8 h-8" />;
    }
  };

  const getPreview = () => {
    if (!value) return null;

    if (type === 'image') {
      return (
        <img
          src={value}
          alt="Preview"
          className="w-full h-full object-cover rounded-lg"
        />
      );
    }

    if (type === 'video') {
      return (
        <video
          src={value}
          className="w-full h-full object-cover rounded-lg"
          controls
        />
      );
    }

    if (type === 'pdf') {
      return (
        <div className="flex flex-col items-center justify-center h-full">
          <FileText className="w-12 h-12 text-red-600 mb-2" />
          <span className="text-sm text-gray-600">PDF Uploaded</span>
          <a
            href={value}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-blue-600 hover:underline mt-1"
          >
            View PDF
          </a>
        </div>
      );
    }

    return (
      <div className="flex flex-col items-center justify-center h-full">
        <File className="w-12 h-12 text-gray-600 mb-2" />
        <span className="text-sm text-gray-600">File Uploaded</span>
      </div>
    );
  };

  const handleFile = async (file: File) => {
    // Validate file size
    if (file.size > maxSize * 1024 * 1024) {
      setError(`File size must be less than ${maxSize}MB`);
      return;
    }

    setError(null);
    setUploading(true);
    setProgress(0);

    try {
      const result = await onUpload(file, setProgress);

      if (result.success && result.url) {
        onChange(result.url);
      } else {
        setError(result.error || 'Upload failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleDelete = async () => {
    if (!value) return;

    if (onDelete) {
      try {
        await onDelete(value);
      } catch (err) {
        console.error('Delete error:', err);
      }
    }

    onChange(null);
  };

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <div className="relative">
        {value && !uploading ? (
          <div className="relative group">
            <div className={`${type === 'image' || type === 'video' ? 'aspect-video' : 'h-48'} w-full bg-gray-100 rounded-lg overflow-hidden border-2 border-gray-200`}>
              {getPreview()}
            </div>
            <button
              type="button"
              onClick={handleDelete}
              disabled={disabled}
              className="absolute top-2 right-2 bg-red-600 text-white p-2 rounded-full hover:bg-red-700 transition-colors shadow-lg opacity-0 group-hover:opacity-100"
              title="Delete file"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div
            className={`${type === 'image' || type === 'video' ? 'aspect-video' : 'h-48'} w-full border-2 border-dashed rounded-lg transition-colors ${
              dragActive
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-300 hover:border-gray-400'
            } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => !disabled && !uploading && fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept={accept}
              onChange={handleFileSelect}
              disabled={disabled || uploading}
              className="hidden"
            />

            <div className="h-full flex flex-col items-center justify-center p-4 text-center">
              {uploading ? (
                <>
                  <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-3" />
                  <p className="text-sm text-gray-600 mb-2">Uploading...</p>
                  <div className="w-full max-w-xs bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{progress}%</p>
                </>
              ) : (
                <>
                  <div className="text-gray-400 mb-3">{getIcon()}</div>
                  <p className="text-sm text-gray-600 mb-1">{placeholder}</p>
                  <p className="text-xs text-gray-500">
                    Max size: {maxSize}MB • {accept}
                  </p>
                  <button
                    type="button"
                    className="mt-3 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                    disabled={disabled}
                  >
                    <Upload className="w-4 h-4 inline mr-2" />
                    Choose File
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {error && (
          <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-600">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
