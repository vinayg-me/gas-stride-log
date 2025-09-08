# Netlify Deployment Guide for Gas Stride Log

## 🚀 Quick Deployment Steps

### 1. Connect Your Repository
1. Go to [Netlify](https://netlify.com) and sign in
2. Click "Add new site" → "Import an existing project"
3. Connect your Git provider (GitHub, GitLab, or Bitbucket)
4. Select your `gas-stride-log` repository

### 2. Build Settings
Netlify should auto-detect these settings, but verify:

- **Build command**: `pnpm run build`
- **Publish directory**: `dist`
- **Node version**: 20.9.0
- **Package manager**: pnpm 9.0.0

### 3. Environment Variables
In Netlify dashboard, go to Site settings → Environment variables and add:

```
VITE_SUPABASE_PROJECT_ID=bkfzqrzshlmjxwgdnkak
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJrZnpxcnpzaGxtanh3Z2Rua2FrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcyMTE1NjUsImV4cCI6MjA3Mjc4NzU2NX0.m-KHeIgjU6CwEPcsqBNszJwpj-20yQeEHWI2GvO2pcs
VITE_SUPABASE_URL=https://bkfzqrzshlmjxwgdnkak.supabase.co
```

### 4. Deploy
Click "Deploy site" - Netlify will:
- Install dependencies using npm
- Run the build command
- Deploy to a unique URL

## 📁 Files Added for Netlify Compatibility

### `public/_redirects`
- Handles client-side routing for React Router
- Redirects all routes to `index.html` for SPA functionality

### `netlify.toml`
- Main configuration file
- Build settings, headers, and security configurations
- Performance optimizations with proper caching headers

## ⚡ Performance Optimizations Included

1. **Caching Strategy**:
   - Static assets cached for 1 year
   - HTML files not cached to ensure updates
   - JS/CSS files with immutable caching

2. **Security Headers**:
   - X-Frame-Options, X-XSS-Protection
   - Content Security Policy ready
   - Referrer Policy configured

3. **Build Optimizations**:
   - Node 18 for latest features
   - Production environment variables

## 🔧 Manual Deployment (Alternative)

If you prefer manual deployment:

1. Build the project locally:
   ```bash
   pnpm run build
   ```

2. Drag and drop the `dist` folder to Netlify dashboard

## 🌐 Custom Domain (Optional)

1. In Netlify dashboard: Site settings → Domain management
2. Add your custom domain
3. Netlify will provide SSL certificate automatically

## 🚨 Troubleshooting

### Common Issues:

1. **404 on page refresh**: Ensure `_redirects` file is in the `public` folder
2. **Build fails**: Check Node version in build settings (should be 18.x)
3. **Environment variables not working**: Ensure they start with `VITE_` prefix

### Build Logs
Check the build logs in Netlify dashboard for any errors during deployment.

## 📱 Features Working on Netlify

✅ Client-side routing (React Router)  
✅ Environment variables  
✅ Static asset optimization  
✅ PWA capabilities (if configured)  
✅ Supabase integration  
✅ TailwindCSS styling  
✅ Framer Motion animations  

Your app is now ready for production deployment on Netlify! 🎉
