import React, { useState, useEffect } from 'react'
import FileUploadInfo from './FileUploadInfo.jsx'

const API = 'http://localhost:4000';

export default function App() {
  const [video, setVideo] = useState(null)
  const [intro, setIntro] = useState('0')
  const [outro, setOutro] = useState('0')
  const [part, setPart] = useState('600') // 10 minutes default for movies
  const [quality, setQuality] = useState('medium') // fast, medium, high
  const [jobId, setJobId] = useState(null)
  const [progress, setProgress] = useState(0)
  const [status, setStatus] = useState('idle')
  const [links, setLinks] = useState([])
  const [zip, setZip] = useState(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [dragActive, setDragActive] = useState(false)
  const [videoMetadata, setVideoMetadata] = useState(null)

  useEffect(() => {
    if (!jobId) return
    const t = setInterval(async () => {
      const res = await fetch(`${API}/api/progress/${jobId}`)
      const data = await res.json()
      setProgress(data.percent || 0)
      setStatus(data.status || 'idle')
      setLinks(data.parts?.map(p => p.url) || [])
      setZip(data.zipPath || null)
    }, 1000)
    return () => clearInterval(t)
  }, [jobId])

  // Extract video metadata when file is selected
  useEffect(() => {
    if (video) {
      const videoElement = document.createElement('video')
      videoElement.preload = 'metadata'
      
      videoElement.onloadedmetadata = function() {
        setVideoMetadata({
          duration: Math.round(videoElement.duration),
          width: videoElement.videoWidth,
          height: videoElement.videoHeight,
          size: (video.size / (1024 * 1024)).toFixed(2), // MB
          type: video.type
        })
      }
      
      videoElement.src = URL.createObjectURL(video)
    } else {
      setVideoMetadata(null)
    }
  }, [video])

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0]
      if (file.type.startsWith('video/')) {
        setVideo(file)
      } else {
        alert('Please drop a valid video file')
      }
    }
  }

  const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    if (!video) return alert('Please choose a video file')
    
    // Check file size (50GB limit for movies)
    const maxSize = 50 * 1024 * 1024 * 1024; // 50GB in bytes
    if (video.size > maxSize) {
      return alert('File too large! Maximum size is 50GB. Please choose a smaller file.')
    }
    
    // Warn for very large files (movies)
    if (video.size > 5 * 1024 * 1024 * 1024) { // 5GB
      const sizeGB = (video.size / (1024 * 1024 * 1024)).toFixed(1);
      const proceed = confirm(`This is a large movie file (${sizeGB}GB). Upload and processing may take several hours. Do you want to continue?`);
      if (!proceed) return;
    }
    
    setStatus('uploading')
    setUploadProgress(0)

    const fd = new FormData()
    fd.append('video', video)
    fd.append('intro', intro)
    fd.append('outro', outro)
    fd.append('part', part)
    fd.append('quality', quality)

    // Track upload progress
    const xhr = new XMLHttpRequest()
    
    // Set timeout for large files (2 hours for movies)
    xhr.timeout = 2 * 60 * 60 * 1000;
    
    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable) {
        const percentComplete = (e.loaded / e.total) * 100
        setUploadProgress(Math.round(percentComplete))
      }
    })

    xhr.addEventListener('load', () => {
      if (xhr.status === 200) {
        try {
          const data = JSON.parse(xhr.responseText)
          if (data.error) {
            alert(`Error: ${data.error}`)
            setStatus('idle')
            return
          }
          setJobId(data.jobId)
          setStatus('processing')
          setProgress(0)
          setLinks([])
          setZip(null)
        } catch (err) {
          console.error('Failed to parse response:', err)
          alert('Upload failed: Invalid response from server')
          setStatus('idle')
        }
      } else {
        console.error('Upload failed with status:', xhr.status, xhr.responseText)
        let errorMessage = `Upload failed: ${xhr.status} ${xhr.statusText}`;
        try {
          const errorData = JSON.parse(xhr.responseText);
          if (errorData.error) {
            errorMessage = `Upload failed: ${errorData.error}`;
          }
        } catch (e) {
          // Keep the original error message if parsing fails
        }
        alert(errorMessage)
        setStatus('idle')
      }
    })

    xhr.addEventListener('error', (e) => {
      console.error('Upload error:', e)
      alert('Upload failed: Network error')
      setStatus('idle')
    })

    xhr.addEventListener('timeout', () => {
      console.error('Upload timeout')
      alert('Upload failed: Request timeout')
      setStatus('idle')
    })

    xhr.open('POST', `${API}/api/split`)
    xhr.send(fd)
  }

  const disabled = status === 'uploading' || status === 'processing'

  return (
    <div className="wrap">
      <div className="card">
        <h1>
          <i className="fas fa-video" style={{marginRight: '0.5rem', fontSize: '0.8em'}}></i>
          Splittttter.Flow
        </h1>
        <p className="muted">
          <i className="fas fa-magic" style={{marginRight: '0.5rem'}}></i>
          Transform your long videos into perfectly sized clips with professional-grade precision. 
          Upload, split, and download with stunning quality and lightning speed.
        </p>

        <form onSubmit={onSubmit}>
          <div style={{margin:'18px 0'}}>
            <label>
              <i className="fas fa-cloud-upload-alt" style={{marginRight: '0.5rem'}}></i>
              Upload Video File
            </label>
            <div 
              className={`file-drop-zone ${dragActive ? 'drag-active' : ''}`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              style={{
                border: dragActive ? '2px dashed rgba(255, 255, 255, 0.6)' : '2px dashed rgba(255, 255, 255, 0.3)',
                borderRadius: '16px',
                padding: '2rem',
                textAlign: 'center',
                background: dragActive ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.05)',
                transition: 'all 0.3s ease',
                position: 'relative'
              }}
            >
              {video ? (
                <div style={{color: 'rgba(255, 255, 255, 0.9)'}}>
                  <i className="fas fa-check-circle" style={{fontSize: '2rem', color: '#4ade80', marginBottom: '1rem'}}></i>
                  <div style={{fontSize: '1.1rem', fontWeight: '600'}}>{video.name}</div>
                  {videoMetadata && (
                    <div style={{fontSize: '0.9rem', opacity: 0.8, marginTop: '0.5rem'}}>
                      {videoMetadata.width}×{videoMetadata.height} • {formatDuration(videoMetadata.duration)} • {videoMetadata.size}MB
                    </div>
                  )}
                </div>
              ) : (
                <div style={{color: 'rgba(255, 255, 255, 0.7)'}}>
                  <i className="fas fa-cloud-upload-alt" style={{fontSize: '3rem', marginBottom: '1rem', display: 'block'}}></i>
                  <div style={{fontSize: '1.1rem', marginBottom: '0.5rem'}}>
                    Drag & drop your video here or 
                    <span style={{color: '#60a5fa', cursor: 'pointer', textDecoration: 'underline', marginLeft: '0.25rem'}}>
                      browse files
                    </span>
                  </div>
                  <div style={{fontSize: '0.9rem', opacity: 0.6}}>
                    Supports MP4, AVI, MOV, WMV • Max 50GB
                  </div>
                </div>
              )}
              <input 
                type="file" 
                onChange={e=>setVideo(e.target.files[0])} 
                disabled={disabled}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  opacity: 0,
                  cursor: 'pointer'
                }}
                accept="video/*"
              />
            </div>
            <FileUploadInfo file={video} />
          </div>

          <div className="grid">
            <div>
              <label>
                <i className="fas fa-cut" style={{marginRight: '0.5rem'}}></i>
                Intro to remove
              </label>
              <input 
                type="text" 
                placeholder="e.g. 30 or 0:30 or 0:00:30" 
                value={intro} 
                onChange={e=>setIntro(e.target.value)} 
                disabled={disabled} 
              />
            </div>
            <div>
              <label>
                <i className="fas fa-scissors" style={{marginRight: '0.5rem'}}></i>
                Outro to remove
              </label>
              <input 
                type="text" 
                placeholder="e.g. 60 or 1:00 or 0:01:00" 
                value={outro} 
                onChange={e=>setOutro(e.target.value)} 
                disabled={disabled} 
              />
            </div>
          </div>

          <div style={{marginTop:16}}>
            <label>
              <i className="fas fa-clock" style={{marginRight: '0.5rem'}}></i>
              Clip duration
            </label>
            <input 
              type="text" 
              placeholder="e.g. 600 or 10:00 or 0:10:00" 
              value={part} 
              onChange={e=>setPart(e.target.value)} 
              disabled={disabled} 
            />
          </div>

          <div style={{marginTop:16}}>
            <label>
              <i className="fas fa-cog" style={{marginRight: '0.5rem'}}></i>
              Processing Quality
            </label>
            <select value={quality} onChange={e=>setQuality(e.target.value)} disabled={disabled}>
              <option value="fast">⚡ Fast (Lower Quality)</option>
              <option value="medium">⚖️ Medium (Balanced)</option>
              <option value="high">💎 High (Best Quality)</option>
            </select>
          </div>

          <div className="row" style={{marginTop:18}}>
            <button className="btn" disabled={disabled}>
              <i className="fas fa-magic" style={{marginRight: '0.5rem'}}></i>
              Split Video
            </button>
            {status !== 'idle' && (
              <div style={{minWidth:200}}>
                <div className="progress">
                  <div className="bar" style={{width: `${status === 'uploading' ? uploadProgress : progress}%`}} />
                </div>
                <small style={{color:'rgba(255, 255, 255, 0.8)'}}>
                  {status === 'uploading' ? (
                    <>
                      <i className="fas fa-upload" style={{marginRight: '0.5rem'}}></i>
                      Uploading {uploadProgress}%
                    </>
                  ) : (
                    <>
                      <i className="fas fa-cogs" style={{marginRight: '0.5rem'}}></i>
                      {status} • {progress}%
                    </>
                  )}
                </small>
              </div>
            )}
          </div>
        </form>

        {links.length > 0 && (
          <div className="downloads">
            <h3>
              <i className="fas fa-download" style={{marginRight: '0.5rem'}}></i>
              Downloads Ready
            </h3>
            {zip && (
              <a href={zip} target="_blank" style={{background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'}}>
                <i className="fas fa-file-archive" style={{marginRight: '0.5rem'}}></i>
                Download All (ZIP)
              </a>
            )}
            {links.map((url, i) => (
              <a key={i} href={url} target="_blank">
                <i className="fas fa-play" style={{marginRight: '0.5rem'}}></i>
                Part {i+1}
              </a>
            ))}
          </div>
        )}

        <footer>
          <i className="fas fa-lightbulb" style={{marginRight: '0.5rem', color: '#fbbf24'}}></i>
          <strong>Pro Tips:</strong> For 3-hour movies, use 10-15 minute parts (600-900s). 
          Supports formats like <strong>600</strong>, <strong>10:00</strong>, or <strong>0:10:00</strong>. 
          Maximum file size: 50GB for the ultimate experience.
        </footer>
      </div>
    </div>
  )
}
