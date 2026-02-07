# Netlify Deployment

This directory contains the Netlify deployment configuration for Terminal Trainer Web.

## Overview

The Terminal Trainer web experience is deployed on Netlify using:
- **Static Files**: HTML, CSS, and JavaScript from `experience/web/`
- **Serverless Functions**: Node.js functions in `netlify/functions/` that serve the API endpoints

## Architecture

### Static Files
- `public/index.html` - Main web interface
- `public/static/` - CSS and JavaScript files

### Serverless Functions
- `netlify/functions/quiz.js` - Handles quiz generation (`POST /api/quiz`)
- `netlify/functions/cheat.js` - Serves cheat sheets (`GET /api/cheat`)
- `netlify/functions/validate.js` - Validates quiz answers (`POST /api/validate`)

All functions use the knowledge files from the `knowledge/` directory, which are copied to `netlify/functions/knowledge/` during build.

## Build Process

The build process is defined in `build-netlify.sh`:

1. Creates the `public/` directory
2. Copies HTML template to `public/index.html`
3. Copies static assets (CSS, JS) to `public/static/`
4. Copies knowledge JSON files to `netlify/functions/knowledge/`

## Netlify Configuration

The `netlify.toml` file configures:
- **Publish Directory**: `public/` - where static files are served from
- **Build Command**: `./build-netlify.sh` - script to prepare files
- **Functions Directory**: `netlify/functions/` - where serverless functions are located
- **Redirects**: 
  - `/api/*` → `/.netlify/functions/*` (API routes to functions)
  - `/*` → `/index.html` (SPA fallback)

## Local Development

To test locally with Netlify CLI:

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Run the build
./build-netlify.sh

# Start local dev server
netlify dev
```

## Deployment

### Automatic Deployment

Push to the main branch to trigger automatic deployment on Netlify.

### Manual Deployment

```bash
# Build first
./build-netlify.sh

# Deploy
netlify deploy --prod
```

## API Endpoints

When deployed, the following endpoints are available:

- `POST /api/quiz` - Get quiz questions
  - Body: `{"topic": "linux", "count": 10}`
  - Returns: List of quiz questions

- `GET /api/cheat?topic=git` - Get cheat sheet
  - Returns: List of commands for the topic

- `POST /api/validate` - Validate an answer
  - Body: `{"expectedAnswer": "ls", "userAnswer": "ls", "description": "..."}`
  - Returns: `{"correct": true, ...}`

## Available Topics

- `linux` - Basic Linux commands
- `git` - Git version control
- `vscode` - VS Code shortcuts

More topics can be added by creating JSON files in the `knowledge/` directory.

## Troubleshooting

### Functions not working
- Ensure knowledge files are copied to `netlify/functions/knowledge/`
- Check function logs in Netlify dashboard

### Build fails
- Verify `build-netlify.sh` has execute permissions: `chmod +x build-netlify.sh`
- Check that source files exist in `experience/web/`

### Static files not loading
- Verify paths in `index.html` start with `/static/`
- Check the `public/` directory structure after build
