'use client';

import { useState, useRef } from 'react';

interface FileUploadProps {
  label: string;
  accept?: string;
  multiple?: boolean;
  fileType: 'image' | 'pdf';
  onFilesSelected: (files: string[]) => void;
  existingFiles?: string[];
  maxSizeMB?: number;
  showPreview?: boolean;
}

export default function FileUpload({
  label,
  accept = '*',
  multiple = false,
  fileType,
  onFilesSelected,
  existingFiles = [],
  maxSizeMB = 10,
  showPreview = true
}: FileUploadProps) {
  const [files, setFiles] = useState<{ name: string; size: number; data?: string }[]>([]);
  const [error, setError] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles || selectedFiles.length === 0) return;

    setError('');
    setUploading(true);
    const fileArray: { name: string; size: number; data?: string }[] = [];
    const fileDataArray: string[] = [];

    try {
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];

        // Check file size
        const fileSizeMB = file.size / (1024 * 1024);
        if (fileSizeMB > maxSizeMB) {
          setError(`File "${file.name}" exceeds ${maxSizeMB}MB limit`);
          continue;
        }

        if (fileType === 'image') {
          // For images, read as data URL for preview
          const reader = new FileReader();
          const fileData = await new Promise<string>((resolve, reject) => {
            reader.onload = (event) => {
              if (event.target?.result) {
                resolve(event.target.result as string);
              } else {
                reject('Failed to read file');
              }
            };
            reader.onerror = () => reject('Error reading file');
            reader.readAsDataURL(file);
          });

          fileArray.push({
            name: file.name,
            size: file.size,
            data: fileData
          });
          fileDataArray.push(fileData);
        } else {
          // For PDFs, upload to Vercel Blob
          const formData = new FormData();
          formData.append('file', file);

          const uploadResponse = await fetch('/api/upload', {
            method: 'POST',
            body: formData,
          });

          if (!uploadResponse.ok) {
            const errorData = await uploadResponse.json();
            throw new Error(errorData.error || 'Failed to upload file');
          }

          const uploadData = await uploadResponse.json();

          fileArray.push({
            name: file.name,
            size: file.size,
            data: uploadData.url
          });
          fileDataArray.push(uploadData.url);
        }
      }

      setFiles(multiple ? [...files, ...fileArray] : fileArray);
      onFilesSelected(multiple ? [...existingFiles, ...fileDataArray] : fileDataArray);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload files');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index);
    setFiles(newFiles);
    onFilesSelected(newFiles.map(f => f.data || f.name));
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">
        {label}
      </label>

      <div
        onClick={uploading ? undefined : handleClick}
        className={`border-2 border-dashed border-gray-300 rounded-lg p-6 text-center ${uploading ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:border-blue-500 hover:bg-blue-50'} transition-colors`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleFileChange}
          className="hidden"
          disabled={uploading}
        />

        {uploading ? (
          <div className="flex flex-col items-center">
            <svg className="animate-spin h-12 w-12 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="mt-2 text-sm text-gray-600 font-medium">Uploading...</p>
          </div>
        ) : (
          <>
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              stroke="currentColor"
              fill="none"
              viewBox="0 0 48 48"
            >
              <path
                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>

            <p className="mt-2 text-sm text-gray-600">
              <span className="font-medium text-blue-600">Click to upload</span> or drag and drop
            </p>
            <p className="mt-1 text-xs text-gray-500">
              {fileType === 'image' ? 'PNG, JPG, GIF up to' : 'PDF files up to'} {maxSizeMB}MB
            </p>
          </>
        )}
      </div>

      {error && (
        <div className="text-red-600 text-sm mt-2 p-2 bg-red-50 rounded">
          {error}
        </div>
      )}

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-2 mt-4">
          {files.map((file, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
            >
              <div className="flex items-center space-x-3 flex-1">
                {fileType === 'image' && showPreview && file.data && (
                  <img
                    src={file.data}
                    alt={file.name}
                    className="w-12 h-12 object-cover rounded"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {file.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatFileSize(file.size)}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleRemoveFile(index)}
                className="ml-4 text-red-600 hover:text-red-800"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
