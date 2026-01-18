# How to Upload Videos to the CMS

Decap CMS (formerly Netlify CMS) has limited support for video uploads through the UI. Here are your options:

## Option 1: Manual Upload (Recommended for now)

1. **Upload video files manually** to your repository:
   - Place video files in the `media/videos/` folder
   - Commit and push to your repository

2. **In the CMS**:
   - Set Type to "video"
   - In the "Media URL" field, enter: `/media/videos/your-video-name.mp4`
   - Upload a poster image using the "Video Poster/Fallback Image" field
   - Set autoplay, loop, and muted options as needed

## Option 2: Use Cloudinary (Best for Video)

Cloudinary has excellent video support and automatic optimization:

1. **Sign up for Cloudinary** (free tier available):
   - Go to [cloudinary.com](https://cloudinary.com)
   - Get your cloud name and API key

2. **Update `admin/config.yml`**:
   ```yaml
   media_library:
     name: cloudinary
     config:
       cloud_name: YOUR_CLOUD_NAME
       api_key: YOUR_API_KEY
       multiple: false
   ```

3. **In the CMS**:
   - The media picker will now support video uploads
   - Videos are automatically optimized
   - Cloudinary provides CDN delivery

## Option 3: Use External Video Hosting

Host videos on services like:
- **Vimeo** - Professional video hosting
- **YouTube** - Free but requires iframe embed (different implementation)
- **Mux** - Developer-friendly video hosting
- **AWS S3 + CloudFront** - Full control

Then paste the video URL into the "Media URL" field.

## Option 4: Custom Upload Widget

We can add a custom file upload widget to the CMS. This requires:
1. Creating a custom React component
2. Registering it with Decap CMS
3. Handling file uploads to your storage

Let me know if you want to implement this option!

## Current Workaround

For now, the easiest approach:

1. Upload videos via Git:
   ```bash
   # In your project folder
   mkdir -p media/videos
   cp ~/path/to/your-video.mp4 media/videos/
   git add media/videos/your-video.mp4
   git commit -m "Add video"
   git push
   ```

2. In CMS, use the path: `/media/videos/your-video.mp4`

## File Size Recommendations

- **Videos**: Keep under 20MB for web delivery
- **Poster images**: Use WebP format, under 200KB
- Consider using the optimization script: `npm run optimize`
