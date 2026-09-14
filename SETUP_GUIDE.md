# PokePWA: Setup & GitHub Deployment Guide

## Local Development (VS Code)
1. **Clone the project** or download the ZIP.
2. **Install Node.js** (v18 or higher recommended).
3. **Open terminal** in the project root.
4. **Install dependencies**:
   ```bash
   npm install
   ```
5. **Run in development mode**:
   ```bash
   npm run dev
   ```
6. **Open in browser**: Access `http://localhost:3000`.

## Building for Production
To generate the static files for deployment:
```bash
npm run build
```
The output will be in the `/dist` folder.

## Deployment to GitHub Pages
1. **Create a repository** on GitHub.
2. **Push your code** to the repository.
3. **Configure Vite**: Ensure `base` in `vite.config.ts` is set to your repository name if not using a custom domain.
4. **Use GitHub Actions**: You can use the `peaceiris/actions-gh-pages` action to automate deployment.
   - Trigger on push to `main`.
   - Build using `npm run build`.
   - Deploy the `dist` folder to the `gh-pages` branch.
5. **PWA Note**: Ensure the `manifest.json` and service worker are correctly generated to allow installation.
