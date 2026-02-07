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

# Copy knowledge files to functions directory for bundling
echo "Copying knowledge files to functions directory..."
mkdir -p netlify/functions/knowledge

# Check if knowledge directory exists and has JSON files
if [ ! -d "knowledge" ]; then
  echo "Error: knowledge/ directory not found"
  exit 1
fi

if ! ls knowledge/*.json 1> /dev/null 2>&1; then
  echo "Error: No JSON files found in knowledge/ directory"
  exit 1
fi

cp knowledge/*.json netlify/functions/knowledge/

echo "Build complete! Files are in the public directory."
