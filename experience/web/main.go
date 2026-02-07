package main

import (
	"embed"
	"encoding/json"
	"fmt"
	"html/template"
	"io/fs"
	"log"
	"net/http"
	"os"
	"path/filepath"

	"terminal-trainer/behaviour/terminaltrainer"
)

//go:embed static templates
var embeddedFiles embed.FS

// QuizRequest represents the JSON request for starting a quiz
type QuizRequest struct {
	Topic string `json:"topic"`
	Count int    `json:"count"`
}

// QuizResponse represents the JSON response with questions
type QuizResponse struct {
	Questions []terminaltrainer.Question `json:"questions"`
	Topic     string                     `json:"topic"`
}

// AnswerRequest represents the JSON request for checking an answer
type AnswerRequest struct {
	Question string `json:"question"`
	Answer   string `json:"answer"`
}

// AnswerResponse represents the JSON response for answer validation
type AnswerResponse struct {
	Correct        bool   `json:"correct"`
	ExpectedAnswer string `json:"expectedAnswer"`
	Description    string `json:"description"`
}

// CheatResponse represents the JSON response for cheat sheet
type CheatResponse struct {
	Commands []CommandInfo `json:"commands"`
	Topic    string        `json:"topic"`
}

// CommandInfo represents a command for the cheat sheet
type CommandInfo struct {
	Command     string `json:"command"`
	Description string `json:"description"`
	Category    string `json:"category"`
}

func main() {
	// Create HTTP handlers
	http.HandleFunc("/", handleIndex)
	http.HandleFunc("/api/quiz", handleQuiz)
	http.HandleFunc("/api/cheat", handleCheat)
	http.HandleFunc("/api/validate", handleValidate)

	// Serve static files from embedded filesystem
	staticFS, err := fs.Sub(embeddedFiles, "static")
	if err != nil {
		log.Fatal(err)
	}
	http.Handle("/static/", http.StripPrefix("/static/", http.FileServer(http.FS(staticFS))))

	// Start server
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	fmt.Printf("🚀 Terminal Trainer Web Server starting on http://localhost:%s\n", port)
	log.Fatal(http.ListenAndServe(":"+port, nil))
}

func handleIndex(w http.ResponseWriter, r *http.Request) {
	tmpl, err := template.ParseFS(embeddedFiles, "templates/index.html")
	if err != nil {
		http.Error(w, "Error loading template", http.StatusInternalServerError)
		log.Printf("Template error: %v", err)
		return
	}

	err = tmpl.Execute(w, nil)
	if err != nil {
		http.Error(w, "Error rendering template", http.StatusInternalServerError)
		log.Printf("Template execution error: %v", err)
	}
}

func handleQuiz(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req QuizRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request", http.StatusBadRequest)
		return
	}

	// Default topic if not specified
	if req.Topic == "" {
		req.Topic = "linux"
	}

	// Load questions using behaviour package
	engine := terminaltrainer.NewQuestionEngine()
	knowledgeFile := filepath.Join("../../knowledge", req.Topic+".json")
	
	file, err := os.Open(knowledgeFile)
	if err != nil {
		http.Error(w, fmt.Sprintf("Topic not found: %s", req.Topic), http.StatusNotFound)
		log.Printf("Error opening knowledge file: %v", err)
		return
	}
	defer file.Close()

	if err := engine.LoadFromJSON(file); err != nil {
		http.Error(w, "Error loading questions", http.StatusInternalServerError)
		log.Printf("Error loading JSON: %v", err)
		return
	}

	questions := engine.GetAllQuestions()
	if req.Count > 0 && req.Count < len(questions) {
		questions = questions[:req.Count]
	}

	response := QuizResponse{
		Questions: questions,
		Topic:     req.Topic,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

func handleCheat(w http.ResponseWriter, r *http.Request) {
	topic := r.URL.Query().Get("topic")
	if topic == "" {
		topic = "linux"
	}

	// Load commands using behaviour package
	engine := terminaltrainer.NewQuestionEngine()
	knowledgeFile := filepath.Join("../../knowledge", topic+".json")
	
	file, err := os.Open(knowledgeFile)
	if err != nil {
		http.Error(w, fmt.Sprintf("Topic not found: %s", topic), http.StatusNotFound)
		return
	}
	defer file.Close()

	if err := engine.LoadFromJSON(file); err != nil {
		http.Error(w, "Error loading commands", http.StatusInternalServerError)
		return
	}

	questions := engine.GetAllQuestions()
	commands := make([]CommandInfo, len(questions))
	for i, q := range questions {
		commands[i] = CommandInfo{
			Command:     q.ExpectedAnswer,
			Description: q.Description,
			Category:    q.Category,
		}
	}

	response := CheatResponse{
		Commands: commands,
		Topic:    topic,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

func handleValidate(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req struct {
		ExpectedAnswer string `json:"expectedAnswer"`
		UserAnswer     string `json:"userAnswer"`
		Description    string `json:"description"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request", http.StatusBadRequest)
		return
	}

	// Create a question object for validation
	question := terminaltrainer.Question{
		ExpectedAnswer: req.ExpectedAnswer,
		Description:    req.Description,
	}

	// Use the behaviour package's validation logic
	correct := terminaltrainer.ValidateAnswer(question, req.UserAnswer)

	response := AnswerResponse{
		Correct:        correct,
		ExpectedAnswer: req.ExpectedAnswer,
		Description:    req.Description,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}
