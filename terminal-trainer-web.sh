#!/bin/bash

# Terminal Trainer Web Server Runner
# This script builds and runs the Terminal Trainer web interface

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
WEB_DIR="${SCRIPT_DIR}/experience/web"
BINARY_NAME="terminal-trainer-web"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Terminal Trainer Web Server${NC}"
echo ""

# Check if Go is installed
if ! command -v go &> /dev/null; then
    echo -e "${RED}❌ Go is not installed. Please install Go first.${NC}"
    exit 1
fi

# Navigate to web directory
cd "${WEB_DIR}"

# Check if binary exists, if not build it
if [ ! -f "${BINARY_NAME}" ]; then
    echo -e "${BLUE}📦 Building web server...${NC}"
    go build -o "${BINARY_NAME}" main.go
    echo -e "${GREEN}✅ Build complete${NC}"
    echo ""
fi

# Get port from environment or use default
PORT="${PORT:-8080}"

echo -e "${GREEN}🌐 Starting Terminal Trainer Web Server on http://localhost:${PORT}${NC}"
echo -e "${BLUE}💡 Press Ctrl+C to stop the server${NC}"
echo ""

# Run the server
./"${BINARY_NAME}"
