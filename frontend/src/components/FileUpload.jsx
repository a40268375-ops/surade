import React, { useRef, useState } from 'react';
import { Upload, X, Image as ImageIcon, File } from 'lucide-react';

const FileUpload = ({
  accept = "image/*",
  multiple = false,
  maxFiles = 5,
  onFilesChange,
  files = [],
  title = "Klik atau drag & drop file",
  subtitle = "Pilih file yang akan diupload",
  disabled = false,
  className = ''
}) => {
  const fileInputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFileSelect = (e) => {
    const selectedFiles = Array.from(e.target.files);
    handleFiles(selectedFiles);
  };

  const handleFiles = (newFiles) => {
    if (disabled) return;
    
    let filesToAdd = newFiles;
    
    if (!multiple && newFiles.length > 0) {
      filesToAdd = [newFiles[0]];
    } else if (multiple && maxFiles) {
      const remainingSlots = maxFiles - files.length;
      filesToAdd = newFiles.slice(0, remainingSlots);
    }
    
    const updatedFiles = multiple ? [...files, ...filesToAdd] : filesToAdd;
    onFilesChange?.(updatedFiles);
    
    // Clear input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    if (!disabled) setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    
    if (disabled) return;
    
    const droppedFiles = Array.from(e.dataTransfer.files);
    handleFiles(droppedFiles);
  };

  const removeFile = (index) => {
    const updatedFiles = files.filter((_, i) => i !== index);
    onFilesChange?.(updatedFiles);
  };

  const isImage = (file) => {
    return file.type?.startsWith('image/') || file.name?.match(/\.(jpg|jpeg|png|gif|webp)$/i);
  };

  const getFilePreview = (file) => {
    if (isImage(file)) {
      return URL.createObjectURL(file);
    }
    return null;
  };

  return (
    <div className={`db-form-field ${className}`}>
      <div
        className={`db-form-upload-area ${dragOver ? 'dragover' : ''} ${disabled ? 'disabled' : ''}`}
        onClick={() => !disabled && fileInputRef.current?.click()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="db-form-upload-icon">
          <Upload size={24} />
        </div>
        <div className="db-form-upload-title">{title}</div>
        <div className="db-form-upload-subtitle">
          {subtitle}
          {maxFiles && multiple && ` (Maks. ${maxFiles} file)`}
        </div>
        
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleFileSelect}
          disabled={disabled}
          style={{ display: 'none' }}
        />
      </div>

      {files.length > 0 && (
        <div className="db-form-file-grid">
          {files.map((file, index) => (
            <div key={index} className="db-form-file-item">
              <button
                type="button"
                className="db-form-file-remove"
                onClick={() => removeFile(index)}
                disabled={disabled}
              >
                <X size={12} />
              </button>
              
              {isImage(file) ? (
                <img
                  src={getFilePreview(file)}
                  alt={file.name}
                  className="db-form-file-preview"
                />
              ) : (
                <div className="db-form-file-preview" style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  background: '#f1f5f9'
                }}>
                  <File size={32} color="#64748b" />
                </div>
              )}
              
              <div className="db-form-file-name" title={file.name}>
                {file.name}
              </div>
            </div>
          ))}
        </div>
      )}

      {multiple && maxFiles && (
        <div className="db-form-help" style={{ marginTop: '8px' }}>
          {files.length} / {maxFiles} file dipilih
        </div>
      )}
    </div>
  );
};

export default FileUpload;