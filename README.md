# Nate J Minnick Portfolio

A clean, modern portfolio website built with HTML, CSS, and JavaScript. Easily deploy to Netlify and manage projects through Netlify CMS.

## Features

- **Static Site**: Pure HTML/CSS/JS - no build tools required
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Sticky Navigation**: Sidebar navigation that follows you as you scroll
- **Easy Content Management**: Edit projects through Netlify CMS web interface
- **Image & Video Support**: Display project images and videos in a beautiful grid layout

## Project Structure

```
/
├── index.html          # Homepage with project showcase
├── about.html          # About/Information page
├── projects.json       # Project data (managed by Netlify CMS)
├── css/
│   └── styles.css      # All styles
├── js/
│   └── app.js          # Portfolio functionality
├── images/             # Project images and videos
├── admin/              # Netlify CMS configuration
│   ├── index.html
│   └── config.yml
└── netlify.toml        # Netlify configuration
```

## Deploying to Netlify

### Option 1: Deploy via GitHub (Recommended)

1. Create a new repository on GitHub
2. Initialize git and push your code:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin YOUR_GITHUB_REPO_URL
   git push -u origin main
   ```
3. Go to [Netlify](https://netlify.com) and sign in
4. Click "Add new site" → "Import an existing project"
5. Connect to GitHub and select your repository
6. Deploy settings should be automatically detected
7. Click "Deploy site"

### Option 2: Deploy via Drag & Drop

1. Go to [Netlify](https://netlify.com) and sign in
2. Drag the entire project folder onto the Netlify dashboard
3. Your site will be deployed instantly

## Setting Up Netlify CMS

After deploying to Netlify:

1. In your Netlify site dashboard, go to "Site settings"
2. Navigate to "Identity" and click "Enable Identity"
3. Under "Registration preferences", select "Invite only"
4. Go to "Services" → "Git Gateway" and enable it
5. Invite yourself as a user: "Identity" tab → "Invite users"
6. Access your CMS at: `https://your-site-name.netlify.app/admin/`

## Managing Projects

### Via Netlify CMS (Web Interface)

1. Go to `https://your-site-name.netlify.app/admin/`
2. Log in with your invited user
3. Click on "Projects" to manage your portfolio
4. Add, edit, or remove projects
5. Upload images and videos
6. Publish changes

### Via projects.json (Manual Editing)

Edit the `projects.json` file directly. Each project has this structure:

```json
{
  "title": "Project Name",
  "description": "Project description text",
  "credits": "<p><strong>Role:</strong> Designer</p><p><strong>Year:</strong> 2024</p>",
  "link": "https://example.com",
  "media": [
    {
      "type": "image",
      "url": "images/project-image.jpg",
      "alt": "Image description"
    },
    {
      "type": "video",
      "url": "images/project-video.mp4",
      "alt": "Video description",
      "autoplay": false,
      "loop": false
    }
  ]
}
```

## Adding Images and Videos

1. Place your media files in the `images/` folder
2. Reference them in `projects.json` as `images/your-file.jpg`
3. Supported formats:
   - Images: JPG, PNG, GIF, WebP
   - Videos: MP4, WebM

## Customization

### Update Contact Email

Edit the email link in both `index.html` and `about.html`:
```html
<a href="mailto:your-email@example.com">Contact</a>
```

### Modify About Page

Edit the content in `about.html` to add your bio and information.

### Styling Changes

All styles are in `css/styles.css`. Key variables are at the top:
```css
:root {
    --primary-bg: #ffffff;
    --primary-text: #000000;
    --sidebar-width: 220px;
}
```

## Local Development

Simply open `index.html` in your browser to preview locally. For a better development experience with live reload, you can use any static file server:

```bash
# If you have Python installed
python -m http.server 8000

# Or use any other static server
# Then visit http://localhost:8000
```

## Support

For issues or questions about deployment, visit [Netlify's documentation](https://docs.netlify.com).
