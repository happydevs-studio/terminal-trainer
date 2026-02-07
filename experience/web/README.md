# Terminal Trainer Web

A web-based terminal interface for Terminal Trainer that provides the same functionality as the CLI tool in your browser.

## Features

- 🖥️ Terminal-like interface in the browser
- 🎯 Interactive quizzes for multiple topics (Linux, Git, Docker, kubectl, VSCode)
- 📚 Quick reference cheat sheets
- ✅ Real-time answer validation
- 🎨 Beautiful gradient UI with terminal aesthetics
- 📱 Responsive design for mobile and desktop

## Running the Server

### From Source

```bash
cd experience/web
go run main.go
```

The server will start on `http://localhost:8080` by default.

### Build and Run

```bash
cd experience/web
go build -o terminal-trainer-web main.go
./terminal-trainer-web
```

### Custom Port

Set the `PORT` environment variable:

```bash
PORT=3000 ./terminal-trainer-web
```

## Usage

Once the server is running, open your browser to `http://localhost:8080` and use these commands:

- `help` - Show available commands
- `quiz [topic]` - Start an interactive quiz
  - Example: `quiz linux`, `quiz git`
- `cheat [topic]` - Display a cheat sheet
  - Example: `cheat docker`, `cheat kubectl`
- `clear` - Clear the terminal
- `quit` - Exit current quiz

### Available Topics

- `linux` - Basic Linux commands
- `git` - Git version control
- `docker` - Docker containerization
- `kubectl` - Kubernetes management
- `vscode` - VS Code shortcuts

## Architecture

The web application uses:

- **Backend**: Go standard library (`net/http`, `html/template`)
- **Frontend**: Vanilla JavaScript, CSS3
- **Shared Logic**: Reuses the `terminal-trainer/behaviour` package for question engine and validation

This ensures that the web interface uses the exact same logic as the CLI tool, maintaining consistency across experiences.

## API Endpoints

- `GET /` - Main web interface
- `POST /api/quiz` - Start a quiz session
  - Request: `{"topic": "linux", "count": 0}`
  - Response: List of questions
- `GET /api/cheat?topic=git` - Get cheat sheet
- `POST /api/validate` - Validate an answer
  - Request: `{"expectedAnswer": "ls", "userAnswer": "ls", "description": "..."}`
  - Response: `{"correct": true, ...}`

## Development

The application uses Go's `embed` package to embed static files (HTML, CSS, JS) directly into the binary, making it a single self-contained executable.

To modify the frontend:
1. Edit files in `static/` or `templates/`
2. Rebuild the application
3. The changes will be embedded in the new binary

## Deployment

The web server can be deployed anywhere Go applications can run:

- Traditional VPS or dedicated servers
- Container platforms (Docker, Kubernetes)
- Cloud platforms (AWS, GCP, Azure)
- Platform-as-a-Service (Heroku, Railway, Render)

Example Dockerfile:

```dockerfile
FROM golang:1.24-alpine AS builder
WORKDIR /app
COPY . .
RUN cd experience/web && go build -o terminal-trainer-web main.go

FROM alpine:latest
WORKDIR /app
COPY --from=builder /app/experience/web/terminal-trainer-web .
COPY --from=builder /app/knowledge ./knowledge
EXPOSE 8080
CMD ["./terminal-trainer-web"]
```
