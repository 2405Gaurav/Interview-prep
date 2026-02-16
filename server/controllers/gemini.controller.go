package controllers

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"
	"regexp"
	"strings"
	"time"

	"github.com/google/generative-ai-go/genai"
	"github.com/gorilla/mux"
	"github.com/joho/godotenv"
	"github.com/rnkp755/mockinterviewBackend/models"
	"github.com/rnkp755/mockinterviewBackend/utils"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"google.golang.org/api/option"
)

var model *genai.GenerativeModel
var client *genai.Client

func init() {
	// Only load .env if not in production
	if os.Getenv("DB_NAME") != "production" {
		if err := godotenv.Load(); err != nil {
			log.Println("Warning: Error loading .env file")
		}
	}

	apiKey := os.Getenv("GEMINI_API_KEY")
	if apiKey == "" {
		log.Fatal("GEMINI_API_KEY not set in environment variables")
	}

	ctx := context.Background()
	var err error
	client, err = genai.NewClient(ctx, option.WithAPIKey(apiKey))
	if err != nil {
		log.Fatalf("Failed to create Gemini client: %v", err)
	}

	model = client.GenerativeModel("gemini-2.5-flash")
	// Optional: Set temperature or other settings here
	// model.SetTemperature(0.7) 
}

// extractPartsFromGeminiResponse parses the text output using Regex
func extractPartsFromGeminiResponse(response string) models.ExtractedResponse {
	result := models.ExtractedResponse{}

	// Helper function to extract content based on tag
	extract := func(tag string) string {
		re := regexp.MustCompile(fmt.Sprintf(`<%s>(.*?)</%s>`, tag, tag))
		matches := re.FindStringSubmatch(response)
		if len(matches) > 1 {
			// Trim whitespace to ensure clean DB entries
			return strings.TrimSpace(matches[1])
		}
		return ""
	}

	result.Rating = extract("Rating")
	result.Feedback = extract("Feedback")
	result.Question = extract("Question")
	
	// Handle Code specifically (it might span multiple lines, dot matches newline)
	codeRe := regexp.MustCompile(`(?s)<Code>(.*?)</Code>`)
	codeMatches := codeRe.FindStringSubmatch(response)
	if len(codeMatches) > 1 {
		result.Code = strings.TrimSpace(codeMatches[1])
	}

	return result
}

func AskToGemini(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		utils.ErrorResponse(w, http.StatusMethodNotAllowed, "Invalid request method")
		return
	}

	// 1. Get Input Data
	vars := mux.Vars(r)
	sessionId := vars["sessionId"]
	answer := r.FormValue("answer")

	// 2. Validate Session
	session, err := GetSession(sessionId)
	if err != nil {
		utils.ErrorResponse(w, http.StatusInternalServerError, "Failed to get session")
		return
	}

	if session.InterviewStatus == models.Ended {
		utils.ErrorResponse(w, http.StatusBadRequest, "Session has already ended")
		return
	}

	// 3. Generate Prompt Logic
	var prompt string
	
	// If the interview has started, we need the previous questions and the user's answer
	if session.InterviewStatus != models.NotStarted {
		if strings.TrimSpace(answer) == "" {
			utils.ErrorResponse(w, http.StatusBadRequest, "Please provide an answer")
			return
		}

		questions, err := GetQuestion(session.ID.Hex())
		if err != nil {
			utils.ErrorResponse(w, http.StatusInternalServerError, "Failed to get question history")
			return
		}
		prompt = utils.PromptGenerator(session, questions, answer)
	} else {
		// First interaction
		prompt = utils.PromptGenerator(session, nil, "")
	}

	if prompt == "" {
		utils.ErrorResponse(w, http.StatusInternalServerError, "Failed to generate prompt")
		return
	}

	// 4. Call Gemini API
	// Use r.Context() so if user cancels request, we stop processing
	resp, err := model.GenerateContent(r.Context(), genai.Text(prompt))
	if err != nil {
		utils.ErrorResponse(w, http.StatusInternalServerError, fmt.Sprintf("Error generating AI content: %v", err))
		return
	}

	// 5. Extract Text from SDK Response directly (No JSON Marshal needed)
	if len(resp.Candidates) == 0 || len(resp.Candidates[0].Content.Parts) == 0 {
		utils.ErrorResponse(w, http.StatusInternalServerError, "Empty response from Gemini")
		return
	}

	// Assuming text response. Type assertion handles the interface{}.
	part := resp.Candidates[0].Content.Parts[0]
	textResp, ok := part.(genai.Text)
	if !ok {
		utils.ErrorResponse(w, http.StatusInternalServerError, "Unexpected response format from Gemini")
		return
	}
	
	extractedParts := extractPartsFromGeminiResponse(string(textResp))

	// Combine Question and Code for storage
	fullQuestionText := extractedParts.Question
	if extractedParts.Code != "" {
		fullQuestionText += "\n```\n" + extractedParts.Code + "\n```"
	}

	// 6. Database Operations
	if session.InterviewStatus == models.NotStarted {
		// Update Session Status
		_, err = UpdateSession(sessionId, bson.M{"interviewstatus": "waiting-for-answer"})
		if err != nil {
			utils.ErrorResponse(w, http.StatusInternalServerError, "Failed to update session status")
			return
		}

		// Create New Question Document
		question := models.Question{
			ID:        primitive.NewObjectID(),
			SessionId: session.ID,
			Question:  []string{fullQuestionText},
			Rating:    []string{},
			Review:    []string{},
			CreatedAt: time.Now(),
			UpdatedAt: time.Now(),
		}
		_, err = AddQuestion(question)
	} else {
		// Update Existing Question Document
		_, err = UpdateQuestion(fullQuestionText, extractedParts.Rating, extractedParts.Feedback, sessionId)
	}

	if err != nil {
		utils.ErrorResponse(w, http.StatusInternalServerError, "Failed to save question data")
		return
	}

	// 7. Send Response
	w.Header().Set("Content-Type", "application/json")
	utils.SuccessResponse(w, "Gemini response retrieved successfully", map[string]interface{}{
		"question": extractedParts.Question,
		"code":     extractedParts.Code,
		"rating":   extractedParts.Rating,   // Optional: send back rating/feedback if UI needs it
		"feedback": extractedParts.Feedback,
	})
}