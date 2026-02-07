# terminal-trainer

Tool to help people learn how to use the terminal for a range of tools

## Installation

### Quick Install Script

**Linux/macOS:**

```bash
curl -sSL https://raw.githubusercontent.com/hungovercoders/terminal-trainer/main/install-release.sh | bash
```

**Windows (PowerShell):**

```powershell
# PowerShell 5.1+ (Windows 10/11)
Invoke-RestMethod https://raw.githubusercontent.com/hungovercoders/terminal-trainer/main/install-windows.ps1 | Invoke-Expression

# PowerShell 7+ (alternative short form)
irm https://raw.githubusercontent.com/hungovercoders/terminal-trainer/main/install-windows.ps1 | iex
```

**Windows (Git Bash/WSL/MSYS2):**

```bash
curl -sSL https://raw.githubusercontent.com/hungovercoders/terminal-trainer/main/install-release.sh | bash
```

**Windows (CMD/Batch):**

```cmd
@REM Download and run batch installer
curl -o install.bat https://raw.githubusercontent.com/hungovercoders/terminal-trainer/main/install-windows.bat && install.bat
```

### Download Binary (Manual)

1. Go to [Releases](https://github.com/hungovercoders/terminal-trainer/releases)
2. Download the binary for your OS/architecture:
   - `terminal-trainer_Linux_x86_64.tar.gz` (Linux)
   - `terminal-trainer_Darwin_x86_64.tar.gz` (macOS Intel)
   - `terminal-trainer_Darwin_arm64.tar.gz` (macOS Apple Silicon)
   - `terminal-trainer_Windows_x86_64.zip` (Windows)
3. Extract and add to your PATH:

```bash
# Linux/macOS
tar -xzf terminal-trainer_*.tar.gz
sudo mv terminal-trainer /usr/local/bin/

# Windows (PowerShell)
Expand-Archive terminal-trainer_Windows_x86_64.zip -DestinationPath C:\tools\
# Add C:\tools\ to your PATH environment variable
```

### Go Install (For Go Users)

```bash
go install github.com/hungovercoders/terminal-trainer/experience/cli@latest
```

### Build from Source

```bash
git clone https://github.com/hungovercoders/terminal-trainer
cd terminal-trainer/experience/cli
go build -o terminal-trainer main.go
sudo mv terminal-trainer /usr/local/bin/
```

### Uninstall

```bash
./uninstall.sh
```

## Build

```bash
# Build the CLI
cd experience/cli
go build -o terminal-trainer main.go

# Build the Web Server
cd experience/web
go build -o terminal-trainer-web main.go

# Or use the convenience script from project root (auto-builds if needed)
./terminal-trainer.sh --help
```

## Web Interface

Terminal Trainer now has a web-based interface! 

### Try it Online

Visit the live demo at: [Deployed on Netlify]

### Run Locally

Run the web server to use Terminal Trainer in your browser:

```bash
# Quick start with convenience script
./terminal-trainer-web.sh

# Or run from source
cd experience/web
go run main.go

# Or build and run
go build -o terminal-trainer-web main.go
./terminal-trainer-web

# Or use Docker
docker-compose up
```

Then open your browser to `http://localhost:8080` and enjoy the terminal-like interface with:

- 🎯 Interactive quizzes
- 📚 Cheat sheets  
- ✅ Real-time answer validation
- 🎨 Beautiful terminal aesthetics

See [experience/web/README.md](experience/web/README.md) for more details.

### Netlify Deployment

The web interface can be deployed to Netlify. See [netlify/README.md](netlify/README.md) for deployment instructions.

## Usage Examples

After installation, use any of these commands:

```bash
# Short and sweet! 
tt --help
tt quiz --topic linux --count 5
tt cheat --topic git

# Full alias
terminaltrainer --help
terminaltrainer quiz --topic docker

# Full binary name  
terminal-trainer-cli --help
```

## Development Usage

If you're working on the code locally:

```bash
# Using convenience script
./terminal-trainer.sh --help

# Or from CLI directory
cd experience/cli && ./terminal-trainer --help

# Or run directly without building  
cd experience/cli && go run . --help
```

## Available Topics

- `linux` - Basic Linux commands (ls, cd, mkdir, etc.)
- `git` - Git version control commands  
- `docker` - Docker containerization commands
- `kubectl` - Kubernetes management commands
- `vscode` - VS Code shortcuts and commands

## Available Commands

- `quiz` - Interactive learning with questions
- `cheat` - Quick reference guide
- `help` - Show help information
