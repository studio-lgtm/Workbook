# Video Upload Options - Choose One

Your videos are too large for direct Git commits (limit is ~10MB). Here are your options:

## Option 1: Uploadcare (Easiest - Recommended)

**Setup Time: 5 minutes**

1. Sign up at [uploadcare.com](https://uploadcare.com) (FREE tier available)
   - Free tier: 3GB storage, 3GB CDN traffic/month
   - Automatic image/video optimization
   - Fast CDN delivery

2. Get your Public Key from the dashboard

3. Update `admin/config.yml`:
   ```yaml
   media_library:
     name: uploadcare
     config:
       publicKey: YOUR_PUBLIC_KEY_HERE
       imagesOnly: false
   ```

4. Done! Upload videos of any size in the CMS

**Pros:**
- ✅ Dead simple setup
- ✅ Automatic optimization
- ✅ Fast CDN
- ✅ No file size limits
- ✅ Free tier is generous

**Cons:**
- ❌ Videos hosted on Uploadcare (not your repo)

---

## Option 2: Compress Your Videos First

**Setup Time: 0 minutes (just compress before uploading)**

Keep using the current setup, but compress videos to under 10MB:

### Online Compressors (no install needed):
- [Clideo Video Compressor](https://clideo.com/compress-video)
- [FreeConvert](https://www.freeconvert.com/video-compressor)

### Or use HandBrake (free desktop app):
1. Download [HandBrake](https://handbrake.fr/)
2. Settings:
   - Preset: "Web" → "Gmail Large 3 Minutes 720p30"
   - Or custom: H.264, RF 23-28, 720p or 1080p
3. Export

### Or use FFmpeg (command line):
```bash
brew install ffmpeg  # macOS

# Compress video
ffmpeg -i input.mp4 -c:v libx264 -crf 28 -preset slow -vf "scale=1280:-2" output.mp4
```

**Pros:**
- ✅ Free
- ✅ Videos in your repo
- ✅ No external dependencies

**Cons:**
- ❌ Manual compression step
- ❌ Quality trade-off
- ❌ Still limited to ~10MB

---

## Option 3: Netlify Large Media (If using Netlify)

**Setup Time: 10 minutes**

If you're hosting on Netlify:

```bash
# Install Netlify CLI if you haven't
npm install -g netlify-cli

# Login
netlify login

# Install Large Media plugin
netlify plugins:install netlify-lm-plugin
netlify lm:install
netlify lm:setup
```

Then update `admin/config.yml`:
```yaml
media_library:
  name: netlify-large-media
```

**Pros:**
- ✅ No file size limits
- ✅ Git LFS built-in
- ✅ Free with Netlify

**Cons:**
- ❌ Only works with Netlify hosting
- ❌ More complex setup

---

## Option 4: External Video Hosting

**Setup Time: 5 minutes per video**

Host videos elsewhere and paste URLs:

- **Vimeo** - Professional, clean player
- **YouTube** - Free but branded
- **Bunny CDN** - Cheap video hosting ($0.01/GB)

Just paste the video URL in the CMS instead of uploading.

**Pros:**
- ✅ Unlimited size
- ✅ Professional players
- ✅ Often free

**Cons:**
- ❌ Videos not in your repo
- ❌ Different workflow

---

## My Recommendation

**For a portfolio site: Use Uploadcare's free tier**

It's the perfect balance:
- Simple 5-minute setup
- Upload videos directly in CMS
- Automatic optimization
- Fast delivery
- Free tier is plenty for a portfolio

Just sign up, get your key, update the config, and you're done!
