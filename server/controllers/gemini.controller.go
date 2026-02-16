package controllers

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"regexp"
	"strings"
	"time"
	"os"

	"github.com/joho/godotenv"
	"google.golang.org/api/option"

	"github.com/google/generative-ai-go/genai"
	"github.com/gorilla/mux"
	"github.com/rnkp755/mockinterviewBackend/models"
	"github.com/rnkp755/mockinterviewBackend/utils"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

var model *genai.GenerativeModel
var client *genai.Client

// GeminiRequest struct handles the incoming JSON body
type GeminiRequest struct {
	Answer string `json:"answer"`
}

func init() {
	ctx := context.Background()

	apiKey := os.Getenv("GEMINI_API_KEY")
	if apiKey == "" {
		log.Println("Warning: GEMINI_API_KEY not set. Gemini features will not work.")
		return
	}

	var err error
	client, err = genai.NewClient(ctx, option.WithAPIKey(apiKey))
	if err != nil {
		log.Println("Failed to create Gemini client:", err)
		return
	}

	model = client.GenerativeModel("gemini-2.5-flash")
}

// extractPartsFromGeminiResponse parses the text output using Regex
func extractPartsFromGeminiResponse(response string) models.ExtractedResponse {
	result := models.ExtractedResponse{}

	extract := func(tag string) string {
		re := regexp.MustCompile(fmt.Sprintf(`<%s>(.*?)</%s>`, tag, tag))
		matches := re.FindStringSubmatch(response)
		if len(matches) > 1 {
			return strings.TrimSpace(matches[1])
		}
		return ""
	}

	result.Rating = extract("Rating")
	result.Feedback = extract("Feedback")
	result.Question = extract("Question")

	codeRe := regexp.MustCompile(`(?s)<Code>(.*?)</Code>`)
	codeMatches := codeRe.FindStringSubmatch(response)
	if len(codeMatches) > 1 {
		result.Code = strings.TrimSpace(codeMatches[1])
	}

	return result
}

func AskToGemini(w http.ResponseWriter, r *http.Request) {
	log.Println("----- Received AskToGemini Request -----")

	if r.Method != http.MethodPost {
		utils.ErrorResponse(w, http.StatusMethodNotAllowed, "Invalid request method")
		return
	}

	var answer string
	contentType := r.Header.Get("Content-Type")
	log.Printf("Content-Type: %s", contentType)

	// --- 1. ROBUST INPUT PARSING ---
	if strings.Contains(contentType, "application/json") {
		var reqBody GeminiRequest
		if err := json.NewDecoder(r.Body).Decode(&reqBody); err != nil {
			utils.ErrorResponse(w, http.StatusBadRequest, "Invalid JSON body")
			return
		}
		answer = reqBody.Answer
	} else if strings.Contains(contentType, "multipart/form-data") {
		// Parse up to 10MB
		if err := r.ParseMultipartForm(10 << 20); err != nil {
			log.Printf("Error parsing multipart: %v", err)
			utils.ErrorResponse(w, http.StatusBadRequest, "Failed to parse form data")
			return
		}

		// DEBUG: Print ALL keys received to find the mismatch
		log.Println("--- Printing All Received Form Keys ---")
		if r.MultipartForm != nil && r.MultipartForm.Value != nil {
			for key, values := range r.MultipartForm.Value {
				log.Printf("Key: [%s] | Value Length: %d | First Value: %s", key, len(values[0]), values[0])
			}
		} else {
			log.Println("Warning: MultipartForm is empty!")
		}
		log.Println("---------------------------------------")

		// Try to find the answer using multiple common keys
		answer = r.FormValue("answer")
		if answer == "" {
			answer = r.FormValue("Answer") // Try Capitalized
		}
		if answer == "" {
			answer = r.FormValue("transcript") // Try 'transcript'
		}

	} else {
		// Fallback for standard form encoding
		r.ParseForm()
		answer = r.FormValue("answer")
	}

	// --- 2. VALIDATION ---
	// Extract Session ID
	vars := mux.Vars(r)
	sessionId := vars["sessionId"]

	// Get Session
	session, err := GetSession(sessionId)
	if err != nil {
		utils.ErrorResponse(w, http.StatusInternalServerError, "Failed to get session")
		return
	}

	if session.InterviewStatus == models.Ended {
		utils.ErrorResponse(w, http.StatusBadRequest, "Session has already ended")
		return
	}

	// Check if answer is required
	if session.InterviewStatus != models.NotStarted {
		if strings.TrimSpace(answer) == "" {
			log.Println("Error: Answer is empty but required for this stage.")
			utils.ErrorResponse(w, http.StatusBadRequest, "Please provide an answer (Received empty string)")
			return
		}
	}

	// ... (Rest of the logic: Questions, PromptGenerator, Gemini API call) ...
	// The rest of your code works fine once 'answer' is populated.
	
	// Copy-paste the rest of your logic here:
	var prompt string
	if session.InterviewStatus != models.NotStarted {
		questions, err := GetQuestion(session.ID.Hex())
		if err != nil {
			log.Printf("Error getting questions: %v", err)
		}
		prompt = utils.PromptGenerator(session, questions, answer)
	} else {
		prompt = utils.PromptGenerator(session, nil, "")
	}

	// Gemini Call
	log.Println("Sending prompt to Gemini...")
	resp, err := model.GenerateContent(r.Context(), genai.Text(prompt))
	if err != nil {
		log.Printf("Gemini Error: %v", err)
		utils.ErrorResponse(w, http.StatusInternalServerError, fmt.Sprintf("Error generating content: %v", err))
		return
	}

	// Response Parsing
	if len(resp.Candidates) == 0 || len(resp.Candidates[0].Content.Parts) == 0 {
		utils.ErrorResponse(w, http.StatusInternalServerError, "Empty response from Gemini")
		return
	}
	
	part := resp.Candidates[0].Content.Parts[0]
	textResp, ok := part.(genai.Text)
	if !ok {
		utils.ErrorResponse(w, http.StatusInternalServerError, "Unexpected response format")
		return
	}

	extractedParts := extractPartsFromGeminiResponse(string(textResp))
	
	// Save to DB
	fullQuestionText := extractedParts.Question
	if extractedParts.Code != "" {
		fullQuestionText += "\n```\n" + extractedParts.Code + "\n```"
	}

	if session.InterviewStatus == models.NotStarted {
		UpdateSession(sessionId, bson.M{"interviewstatus": "waiting-for-answer"})
		question := models.Question{
			ID:        primitive.NewObjectID(),
			SessionId: session.ID,
			Question:  []string{fullQuestionText},
			Rating:    []string{},
			Review:    []string{},
			CreatedAt: time.Now(),
			UpdatedAt: time.Now(),
		}
		AddQuestion(question)
	} else {
		UpdateQuestion(fullQuestionText, extractedParts.Rating, extractedParts.Feedback, sessionId)
	}

	w.Header().Set("Content-Type", "application/json")
	utils.SuccessResponse(w, "Gemini response retrieved successfully", map[string]interface{}{
		"question": extractedParts.Question,
		"code":     extractedParts.Code,
		"rating":   extractedParts.Rating,
		"feedback": extractedParts.Feedback,
	})
}