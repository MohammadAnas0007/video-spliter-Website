# 🎬 VideoFlow - Smart Video Splitting Studio

Transform your long videos into perfectly sized clips with AI-powered precision and stunning glassmorphism design. Experience the future of video processing with intelligent splitting, real-time previews, and lightning-fast performance.

## ✨ Unique Features

- **🎨 Glassmorphism UI**: Beautiful modern interface with blur effects and animated gradients
- **🧠 Smart Previews**: Real-time video metadata extraction and preview
- **📊 Intelligent Analytics**: Advanced file analysis with quality detection and estimates
- **🎯 Drag & Drop Magic**: Intuitive file upload with visual feedback
- **⚡ Lightning Processing**: Optimized FFmpeg backend with progress tracking
- **📱 Responsive Design**: Perfect experience on all devices
- **🎭 Interactive Elements**: Floating animations and smooth transitions
- **💎 Quality Options**: Fast, balanced, or premium processing modes

## 🚀 Core Capabilities

- **Trim & Split**: Remove intro/outro, then split into equal parts
- **Large Files**: Handle up to 50GB video files with ease
- **Quality Control**: Fast, medium, or high quality processing
- **Auto Cleanup**: Intelligent file management
- **Web Interface**: No software installation needed
- **Batch Download**: Individual parts or complete ZIP file

## 🎯 Quick Start

```bash
# Install all dependencies
npm run install:all

# Start the VideoFlow studio
npm run dev
```

Open **http://localhost:5173** and experience the magic! ✨

## 📱 How to Use

1. **📤 Upload**: Drag & drop your video or click to browse
2. **✂️ Set intro time**: Remove unwanted beginning (e.g., `30` or `0:30`)
3. **🎬 Set outro time**: Remove unwanted ending (e.g., `60` or `1:00`)
4. **⏱️ Set clip duration**: Define part length (e.g., `600` or `10:00`)
5. **💎 Choose quality**: Select processing mode (fast/balanced/premium)
6. **🚀 Process**: Click split and watch the magic happen
7. **📥 Download**: Get individual parts or complete ZIP

## 🕐 Time Format Support

VideoFlow understands multiple time formats:
- **Seconds**: `30`, `600`, `1800`
- **MM:SS**: `2:30`, `10:00`, `30:00`
- **HH:MM:SS**: `0:02:30`, `0:10:00`, `0:30:00`

## 🔧 Technical Requirements

- **Node.js** 16+ (Latest LTS recommended)
- **FFmpeg** installed and accessible in PATH
- **Modern Browser** with ES6+ support

## 📜 Available Scripts

```bash
npm run dev          # Start development environment
npm run build        # Build for production
npm run start        # Quick development start
npm run clean        # Clean all build files
npm run install:all  # Install all dependencies
```
npm run build        # Build client for production
npm run clean        # Clean uploads and dependencies
```

## API Endpoints

- `POST /api/split` - Upload and process video
- `GET /api/progress/:jobId` - Check processing status
- `POST /api/cleanup` - Manual cleanup
