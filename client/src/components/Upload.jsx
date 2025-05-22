import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Upload as UploadIcon, X, Play, CheckCircle } from 'lucide-react';
import './Upload.css';

function Upload() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [video, setVideo] = useState(null);
  const [videoPreview, setVideoPreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const navigate = useNavigate();

  const handleVideoSelect = (file) => {
    if (file && file.type.startsWith('video/')) {
      setVideo(file);
      const previewUrl = URL.createObjectURL(file);
      setVideoPreview(previewUrl);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    handleVideoSelect(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    handleVideoSelect(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const removeVideo = () => {
    setVideo(null);
    setVideoPreview(null);
    setUploadProgress(0);
    setUploadSuccess(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !video) return;

    setIsUploading(true);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append('title', title.trim());
    formData.append('description', description.trim());
    formData.append('video', video);

    try {
      await axios.post('http://localhost:5000/api/videos/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadProgress(percentCompleted);
        }
      });
      
      setUploadSuccess(true);
      setTimeout(() => {
        navigate('/');
      }, 2000);
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const goBack = () => {
    navigate('/');
  };

  if (uploadSuccess) {
    return (
      <div className="upload-container">
        <div className="upload-success">
          <CheckCircle size={80} className="success-icon" />
          <h1>Upload Successful!</h1>
          <p>Your video has been uploaded successfully.</p>
          <p>Redirecting you to home page...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="upload-container">
      <div className="upload-header">
        <button onClick={goBack} className="back-btn">
          <X size={24} />
        </button>
        <h1 className="upload-title">Upload Video</h1>
      </div>

      <div className="upload-content">
        <form onSubmit={handleSubmit} className="upload-form">
          {/* Video Upload Section */}
          <div className="video-upload-section">
            {!video ? (
              <div
                className={`drop-zone ${dragOver ? 'drag-over' : ''}`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
              >
                <UploadIcon size={48} className="upload-icon" />
                <h3>Drop your video here</h3>
                <p>or click to browse</p>
                <input
                  type="file"
                  accept="video/*"
                  onChange={handleFileChange}
                  className="file-input"
                  id="video-input"
                />
                <label htmlFor="video-input" className="file-label">
                  Choose File
                </label>
                <p className="file-info">Supported formats: MP4, AVI, MOV, WMV</p>
              </div>
            ) : (
              <div className="video-preview-section">
                <div className="video-preview">
                  <video src={videoPreview} controls className="preview-video" />
                  <button
                    type="button"
                    onClick={removeVideo}
                    className="remove-video"
                  >
                    <X size={20} />
                  </button>
                </div>
                <div className="video-file-info">
                  <Play size={16} />
                  <span>{video.name}</span>
                  <span className="file-size">
                    ({(video.size / (1024 * 1024)).toFixed(2)} MB)
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Video Details Section */}
          <div className="video-details-section">
            <div className="input-group">
              <label htmlFor="title" className="input-label">
                Video Title *
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter an eye-catching title"
                className="form-input"
                required
                maxLength={100}
              />
              <span className="char-count">{title.length}/100</span>
            </div>

            <div className="input-group">
              <label htmlFor="description" className="input-label">
                Description
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Tell viewers about your video"
                className="form-textarea"
                rows={4}
                maxLength={500}
              />
              <span className="char-count">{description.length}/500</span>
            </div>
          </div>

          {/* Upload Progress */}
          {isUploading && (
            <div className="upload-progress-section">
              <div className="progress-info">
                <span>Uploading... {uploadProgress}%</span>
              </div>
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="form-actions">
            <button
              type="button"
              onClick={goBack}
              className="cancel-btn"
              disabled={isUploading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="upload-btn"
              disabled={!title.trim() || !video || isUploading}
            >
              {isUploading ? 'Uploading...' : 'Upload Video'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Upload;