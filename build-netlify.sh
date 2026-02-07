#!/bin/bash
# Build script for Netlify deployment

set -e

echo "Building Terminal Trainer Web for Netlify..."

# Create public directory if it doesn't exist
mkdir -p public

# Copy static HTML
echo "Copying index.html..."
cp experience/web/templates/index.html public/index.html

# Copy static assets
echo "Copying static assets..."
cp -r experience/web/static public/

echo "Build complete! Files are in the public directory."
