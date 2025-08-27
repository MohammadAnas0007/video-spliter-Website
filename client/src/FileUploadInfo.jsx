import React, { useState, useEffect } from 'react';

export default function FileUploadInfo({ file }) {
  const [showDetails, setShowDetails] = useState(false);
  const [videoInfo, setVideoInfo] = useState(null);

  useEffect(() => {
    if (file && file.type.startsWith('video/')) {
      const video = document.createElement('video');
      video.preload = 'metadata';
      
      video.onloadedmetadata = function() {
        setVideoInfo({
          duration: Math.round(video.duration),
          width: video.videoWidth,
          height: video.videoHeight,
          aspectRatio: (video.videoWidth / video.videoHeight).toFixed(2)
        });
      };
      
      video.src = URL.createObjectURL(file);
      
      return () => {
        URL.revokeObjectURL(video.src);
      };
    }
  }, [file]);

  if (!file) return null;

  const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
  const fileSizeGB = (file.size / (1024 * 1024 * 1024)).toFixed(2);
  const estimatedUploadTime = calculateUploadTime(file.size);
  const estimatedProcessTime = calculateProcessTime(file.size);

  const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    }
    return `${minutes}m ${secs}s`;
  };

  const getQualityLabel = () => {
    if (!videoInfo) return '';
    const { width, height } = videoInfo;
    
    if (width >= 3840) return '4K UHD';
    if (width >= 1920) return 'Full HD';
    if (width >= 1280) return 'HD';
    if (width >= 854) return 'HD Ready';
    return 'SD';
  };

  return (
    <div style={{ 
      background: 'rgba(255, 255, 255, 0.1)', 
      border: '1px solid rgba(255, 255, 255, 0.2)',
      backdropFilter: 'blur(10px)',
      padding: '1rem', 
      borderRadius: '12px', 
      margin: '12px 0',
      fontSize: '14px',
      color: 'rgba(255, 255, 255, 0.9)'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <i className="fas fa-file-video" style={{ color: '#60a5fa' }}></i>
          <span style={{ fontWeight: '600' }}>{file.name}</span>
        </div>
        <button 
          type="button" 
          onClick={() => setShowDetails(!showDetails)}
          style={{ 
            background: 'rgba(255, 255, 255, 0.1)', 
            border: '1px solid rgba(255, 255, 255, 0.2)', 
            color: '#60a5fa', 
            cursor: 'pointer',
            padding: '0.25rem 0.5rem',
            borderRadius: '6px',
            fontSize: '12px',
            transition: 'all 0.3s ease'
          }}
        >
          {showDetails ? 'Hide' : 'Show'} details
        </button>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '0.5rem', fontSize: '12px' }}>
        <div>
          <i className="fas fa-hdd" style={{ marginRight: '0.25rem', color: '#fbbf24' }}></i>
          Size: {fileSizeGB > 1 ? `${fileSizeGB} GB` : `${fileSizeMB} MB`}
        </div>
        {videoInfo && (
          <>
            <div>
              <i className="fas fa-clock" style={{ marginRight: '0.25rem', color: '#34d399' }}></i>
              Duration: {formatDuration(videoInfo.duration)}
            </div>
            <div>
              <i className="fas fa-expand-arrows-alt" style={{ marginRight: '0.25rem', color: '#f472b6' }}></i>
              Resolution: {videoInfo.width}×{videoInfo.height}
            </div>
            <div>
              <i className="fas fa-gem" style={{ marginRight: '0.25rem', color: '#a78bfa' }}></i>
              Quality: {getQualityLabel()}
            </div>
          </>
        )}
      </div>
      
      {showDetails && (
        <div style={{ 
          marginTop: '1rem', 
          padding: '0.75rem',
          background: 'rgba(255, 255, 255, 0.05)',
          borderRadius: '8px',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <div style={{ marginBottom: '0.5rem', fontWeight: '600', color: 'rgba(255, 255, 255, 0.95)' }}>
            <i className="fas fa-chart-line" style={{ marginRight: '0.5rem', color: '#60a5fa' }}></i>
            Processing Estimates
          </div>
          <div style={{ display: 'grid', gap: '0.25rem', fontSize: '13px' }}>
            <div>
              <i className="fas fa-upload" style={{ marginRight: '0.5rem', color: '#34d399' }}></i>
              Upload time: <strong>{estimatedUploadTime}</strong>
            </div>
            <div>
              <i className="fas fa-cogs" style={{ marginRight: '0.5rem', color: '#f59e0b' }}></i>
              Processing time: <strong>{estimatedProcessTime}</strong>
            </div>
            {videoInfo && (
              <>
                <div>
                  <i className="fas fa-cut" style={{ marginRight: '0.5rem', color: '#ef4444' }}></i>
                  Estimated clips: <strong>~{Math.ceil(videoInfo.duration / 600)} parts</strong> (10min each)
                </div>
                <div>
                  <i className="fas fa-video" style={{ marginRight: '0.5rem', color: '#8b5cf6' }}></i>
                  Aspect ratio: <strong>{videoInfo.aspectRatio}:1</strong>
                </div>
              </>
            )}
          </div>
          <div style={{ fontSize: '11px', marginTop: '0.5rem', fontStyle: 'italic', opacity: 0.7 }}>
            <i className="fas fa-info-circle" style={{ marginRight: '0.25rem' }}></i>
            Times are estimates based on average connection and processing speeds
          </div>
        </div>
      )}
    </div>
  );
}

function calculateUploadTime(fileSize) {
  const fileSizeMB = fileSize / (1024 * 1024);
  
  // More realistic upload speed estimates (in Mbps)
  const avgSpeedMbps = 25; // Assume 25 Mbps average
  const timeInSeconds = (fileSizeMB * 8) / avgSpeedMbps;
  
  if (timeInSeconds < 60) return `${Math.round(timeInSeconds)}s`;
  if (timeInSeconds < 3600) return `${Math.round(timeInSeconds / 60)}m`;
  return `${Math.round(timeInSeconds / 3600)}h ${Math.round((timeInSeconds % 3600) / 60)}m`;
}

function calculateProcessTime(fileSize) {
  const fileSizeMB = fileSize / (1024 * 1024);
  
  // More realistic processing time for movies: ~3 minutes per GB
  const timePerGB = 3; // minutes
  const estimatedMinutes = (fileSizeMB / 1024) * timePerGB;
  
  if (estimatedMinutes < 1) return `${Math.round(estimatedMinutes * 60)}s`;
  if (estimatedMinutes < 60) return `${Math.round(estimatedMinutes)}m`;
  return `${Math.round(estimatedMinutes / 60)}h ${Math.round(estimatedMinutes % 60)}m`;
}
