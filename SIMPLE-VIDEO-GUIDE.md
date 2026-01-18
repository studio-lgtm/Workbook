# Simple Video Upload Guide

## Quick Setup (One-time)

1. Install Git LFS (if not already installed):
   ```bash
   # macOS
   brew install git-lfs

   # Windows (download from: https://git-lfs.github.com/)

   # Linux
   sudo apt-get install git-lfs
   ```

2. Enable Git LFS in your project:
   ```bash
   cd "/Users/nateminnick/Dropbox/Project Files/Nate J Minnick/Nate J Minnick Portfolio Test"
   git lfs install
   git lfs track "*.mp4"
   git add .gitattributes
   git commit -m "Add Git LFS support for videos"
   ```

## How to Add Videos to Your Portfolio

### Step 1: Add the Video File
```bash
# 1. Create videos folder if it doesn't exist
mkdir -p media/videos

# 2. Copy your video to the folder
cp ~/Downloads/my-video.mp4 media/videos/

# 3. Commit and push
git add media/videos/my-video.mp4
git commit -m "Add my-video"
git push
```

### Step 2: Add to CMS
1. Go to your CMS at `/admin`
2. Edit a project
3. Add new media item
4. Set **Type** to "video"
5. Leave **Image File** blank
6. In **Video Path**, enter: `/media/videos/my-video.mp4`
7. Upload a **Poster Image** (thumbnail)
8. Save

Done! Your video will now appear on the site.

## For Images
Just use the **Image File** uploader in the CMS - works normally.

## File Size Tips
- Keep videos under 20MB
- Use MP4 format (H.264 codec)
- Compress videos before uploading:
  ```bash
  # If you have ffmpeg installed
  ffmpeg -i input.mp4 -c:v libx264 -crf 23 -preset slow -c:a aac output.mp4
  ```
  Or use online tools like [HandBrake](https://handbrake.fr/)

## Alternative: External Hosting
If videos are too large, host on:
- **Vimeo** (clean, professional)
- **YouTube** (free but requires iframe)
- Then just paste the video URL in the **Video Path** field

## No External Services Needed!
This approach uses:
- ✅ Git LFS (free with GitHub/GitLab)
- ✅ Your existing CMS
- ❌ No Cloudinary
- ❌ No Uploadcare
- ❌ No extra costs
