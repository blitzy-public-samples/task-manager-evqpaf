/**
 * File Upload Component
 * 
 * Requirements Addressed:
 * - File Upload Component (Technical Specification/3.1 User Interface Design/3.1.2 Interface Elements)
 *   Provides a user-friendly interface for uploading files with validation and storage capabilities.
 * 
 * Human Tasks:
 * - Verify file size limits match backend configuration
 * - Ensure file type restrictions align with security policies
 * - Configure appropriate CORS settings for file uploads
 */

// React v18.2.0
import { useState, useEffect, useCallback } from 'react';
import { setItem } from '../../../utils/storage.utils';
import { validateUrl } from '../../../utils/validation.utils';
import { BASE_API_URL } from '../../../constants/api.constants';
import useNotification from '../../../hooks/useNotification';

interface FileUploadProps {
  maxFileSize?: number; // Maximum file size in bytes
  allowedTypes?: string[]; // Array of allowed MIME types
  multiple?: boolean; // Allow multiple file selection
  onUploadComplete?: (files: File[]) => void; // Callback when upload completes
  onUploadError?: (error: string) => void; // Callback when upload fails
}

const FileUpload: React.FC<FileUploadProps> = ({
  maxFileSize = 5 * 1024 * 1024, // 5MB default
  allowedTypes = ['image/*', 'application/pdf'],
  multiple = false,
  onUploadComplete,
  onUploadError
}) => {
  // State management
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState(false);

  // Hooks
  const notification = useNotification();

  // File validation
  const validateFile = useCallback((file: File): boolean => {
    // Check file size
    if (file.size > maxFileSize) {
      notification.triggerNotification({
        message: `File ${file.name} exceeds maximum size of ${maxFileSize / 1024 / 1024}MB`,
        type: 'error',
        duration: 5000
      });
      return false;
    }

    // Check file type
    const isValidType = allowedTypes.some(type => {
      if (type.endsWith('/*')) {
        return file.type.startsWith(type.slice(0, -2));
      }
      return file.type === type;
    });

    if (!isValidType) {
      notification.triggerNotification({
        message: `File ${file.name} type not allowed`,
        type: 'error',
        duration: 5000
      });
      return false;
    }

    return true;
  }, [maxFileSize, allowedTypes, notification]);

  // Handle file selection
  const handleFileSelect = useCallback((files: FileList) => {
    const validFiles: File[] = [];

    Array.from(files).forEach(file => {
      if (validateFile(file)) {
        validFiles.push(file);
      }
    });

    if (validFiles.length > 0) {
      setSelectedFiles(prev => multiple ? [...prev, ...validFiles] : [validFiles[0]]);
    }
  }, [multiple, validateFile]);

  // Handle drag and drop events
  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const { files } = e.dataTransfer;
    if (files && files.length > 0) {
      handleFileSelect(files);
    }
  }, [handleFileSelect]);

  // Handle file upload
  const uploadFiles = useCallback(async () => {
    if (selectedFiles.length === 0) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      selectedFiles.forEach(file => formData.append('files', file));

      const response = await fetch(`${BASE_API_URL}/upload`, {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const result = await response.json();

      // Validate uploaded file URLs
      const validUrls = result.urls.filter((url: string) => validateUrl(url));

      // Store file metadata
      setItem('uploadedFiles', {
        urls: validUrls,
        timestamp: new Date().toISOString()
      });

      notification.triggerNotification({
        message: 'Files uploaded successfully',
        type: 'success',
        duration: 3000
      });

      onUploadComplete?.(selectedFiles);
      setSelectedFiles([]);
      setUploadProgress(100);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'File upload failed';
      notification.triggerNotification({
        message: errorMessage,
        type: 'error',
        duration: 5000
      });
      onUploadError?.(errorMessage);
    } finally {
      setIsUploading(false);
    }
  }, [selectedFiles, notification, onUploadComplete, onUploadError]);

  // Clean up selected files when component unmounts
  useEffect(() => {
    return () => {
      setSelectedFiles([]);
      setUploadProgress(0);
    };
  }, []);

  return (
    <div className="file-upload-container">
      {/* Drag and drop area */}
      <div
        className={`file-upload-dropzone ${isDragging ? 'dragging' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="file-upload-content">
          <p>Drag and drop files here or</p>
          <input
            type="file"
            id="fileInput"
            multiple={multiple}
            accept={allowedTypes.join(',')}
            onChange={(e) => e.target.files && handleFileSelect(e.target.files)}
            className="file-upload-input"
          />
          <label htmlFor="fileInput" className="file-upload-button">
            Browse Files
          </label>
        </div>
      </div>

      {/* Selected files list */}
      {selectedFiles.length > 0 && (
        <div className="selected-files">
          <h4>Selected Files:</h4>
          <ul>
            {selectedFiles.map((file, index) => (
              <li key={`${file.name}-${index}`}>
                {file.name} ({(file.size / 1024).toFixed(2)} KB)
                <button
                  onClick={() => setSelectedFiles(prev => prev.filter((_, i) => i !== index))}
                  className="remove-file-button"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
          <button
            onClick={uploadFiles}
            disabled={isUploading}
            className="upload-button"
          >
            {isUploading ? 'Uploading...' : 'Upload Files'}
          </button>
        </div>
      )}

      {/* Upload progress */}
      {isUploading && (
        <div className="upload-progress">
          <div
            className="progress-bar"
            style={{ width: `${uploadProgress}%` }}
          />
          <span>{uploadProgress}%</span>
        </div>
      )}
    </div>
  );
};

export default FileUpload;