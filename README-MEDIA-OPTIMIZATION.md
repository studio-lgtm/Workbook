# Media Optimization Guide

This portfolio includes tools for optimizing images and videos for faster web delivery.

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Install FFmpeg (for video optimization)

**macOS (using Homebrew):**
```bash
brew install ffmpeg
```

**Windows:**
Download from [ffmpeg.org](https://ffmpeg.org/download.html)

**Linux:**
```bash
sudo apt-get install ffmpeg
```

## Usage

### Optimize All Media

Place your images and videos in the `media/` folder, then run:

```bash
npm run optimize
```

This will:
- Convert images to WebP format (85% quality)
- Resize images to max 2400px width
- Compress videos using H.264 codec
- Scale videos to max 1920px width
- Save optimized files to `media/optimized/`

### CMS Video Upload

The CMS now supports:
- **Video uploads** using the "Video File" field (MP4, WebM, MOV)
- **Poster images** for video thumbnails/fallbacks
- **Separate image uploads** for regular images

#### How to Add a Video:

1. Select "video" as the Type
2. Upload your video file in "Video File" field
3. Upload a poster image in "Video Poster/Fallback Image" field (recommended)
4. Set autoplay, loop, and muted options as needed

**Note:** Autoplay only works when videos are muted.

## Media Library Options

The CMS is configured to use media optimization services. You have two options:

### Option 1: Uploadcare (Recommended)
Automatic image optimization and CDN delivery.

1. Sign up at [uploadcare.com](https://uploadcare.com)
2. Get your public key
3. Update `admin/config.yml`:
   ```yaml
   media_library:
     name: uploadcare
     config:
       publicKey: YOUR_UPLOADCARE_PUBLIC_KEY
   ```

### Option 2: Cloudinary
Alternative with video transcoding support.

1. Sign up at [cloudinary.com](https://cloudinary.com)
2. Get your cloud name and API key
3. Update `admin/config.yml`:
   ```yaml
   media_library:
     name: cloudinary
     config:
       cloud_name: YOUR_CLOUD_NAME
       api_key: YOUR_API_KEY
   ```

### Option 3: Local (Manual Optimization)
Use the optimization script above and commit optimized files to your repo.

## File Structure

```
media/
├── your-image.jpg          # Original uploads
├── your-video.mp4
└── optimized/
    ├── your-image.webp     # Optimized versions
    └── your-video-optimized.mp4
```

## Best Practices

1. **Images:**
   - Use WebP format for best compression
   - Keep images under 500KB
   - Use appropriate dimensions (max 2400px)

2. **Videos:**
   - Keep videos under 10MB when possible
   - Always provide a poster image
   - Use MP4 with H.264 codec for best compatibility
   - Enable muted if using autoplay

3. **Loading:**
   - Images use lazy loading by default
   - Videos use `preload="metadata"` to minimize bandwidth
