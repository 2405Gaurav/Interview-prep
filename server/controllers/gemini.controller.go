package controllers

import (
	"context"
	"encoding/json"
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
	err := godotenv.Load()
	if err != nil {
		log.Fatal("Error loading .env file")
	}

	ctx := context.Background()
	apiKey := os.Getenv("GEMINI_API_KEY")
	if apiKey == "" {
		log.Fatal("GEMINI_API_KEY not set in .env file")
	}

	var errClient error
	client, errClient = genai.NewClient(ctx, option.WithAPIKey(apiKey))
	if errClient != nil {
		log.Fatal(errClient)
	}

	model = client.GenerativeModel("gemini-1.5-pro")
}

func parseGeminiResponse(responseJSON []byte) (*models.GeminniResponse, error) {
	var response models.GeminniResponse
	err := json.Unmarshal(responseJSON, &response)
	if err != nil {
		return nil, err
	}

	return &response, nil
}

// Rating , Feedback, Question
func extractPartsFromGeminiResponse(response string) (models.ExtractedResponse, error) {
    result := models.ExtractedResponse{}

    // Extract Rating
    ratingMatch := regexp.MustCompile(`<Rating>(.*?)</Rating>`)
    if matches := ratingMatch.FindStringSubmatch(response); len(matches) > 1 {
        result.Rating = matches[1]
    }

    // Extract Feedback
    feedbackMatch := regexp.MustCompile(`<Feedback>(.*?)</Feedback>`)
    if matches := feedbackMatch.FindStringSubmatch(response); len(matches) > 1 {
        result.Feedback = matches[1]
    }

    // Extract Question
    questionMatch := regexp.MustCompile(`<Question>(.*?)</Question>`)
    if matches := questionMatch.FindStringSubmatch(response); len(matches) > 1 {
        result.Question = matches[1]
    }

	return result, nil
}

func AskToGemini(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		utils.ErrorResponse(w, http.StatusMethodNotAllowed, "Invalid request method")
		return
	}

	// Extract interviewee answer from formValue (if any) or store it as empty string
	answer := r.FormValue("answer")

	// Extract sessionId from URL like /session/{sessionId}
	vars := mux.Vars(r)
	sessionId := vars["sessionId"]

	// Fetch session details from the database
	session, err := GetSession(sessionId)

	if err != nil {
		utils.ErrorResponse(w, http.StatusInternalServerError, "Failed to get session")
		return
	}

	if session.InterviewStatus == models.Ended {
		utils.ErrorResponse(w, http.StatusBadRequest, "Session has already ended")
		return
	}

	var questions *models.Question
	var prompt string
	if session.InterviewStatus != models.NotStarted {
		questions, err = GetQuestion(session.ID.Hex())
		if err != nil {
			utils.ErrorResponse(w, http.StatusInternalServerError, "Failed to get question")
			return
		}

		if strings.TrimSpace(answer) == "" {
			utils.ErrorResponse(w, http.StatusBadRequest, "Please provide an answer for Gemini")
			return
		}

		prompt = utils.PromptGenerator(session, questions, answer)
	} else {
		prompt = utils.PromptGenerator(session, nil, "")
	}

	if prompt == "" {
		utils.ErrorResponse(w, http.StatusBadRequest, "Please provide a prompt for Gemini")
		return
	}

	ctx := context.Background()

	/*
		f, err := os.Open("image.png")
		if err != nil {
			http.Error(w, fmt.Sprintf("Error opening file: %v", err), http.StatusInternalServerError)
			return
		}
		defer f.Close()

		file, err := client.UploadFile(ctx, "", f, nil)
		if err != nil {
			http.Error(w, fmt.Sprintf("Error uploading file: %v", err), http.StatusInternalServerError)
			return
		}

		resp, err := model.GenerateContent(ctx, genai.Text(prompt), genai.FileData{URI: file.URI})

	*/

	resp, err := model.GenerateContent(ctx, genai.Text(prompt))
	if err != nil {
		utils.ErrorResponse(w, http.StatusInternalServerError, fmt.Sprintf("Error generating content: %v", err))
		return
	}

	responseJSON, err := json.Marshal(resp)
	if err != nil {
		utils.ErrorResponse(w, http.StatusInternalServerError, fmt.Sprintf("Error marshalling response: %v", err))
		return
	}

	beutifulresponse, err := parseGeminiResponse([]byte(responseJSON))
	if err != nil {
		utils.ErrorResponse(w, http.StatusInternalServerError, fmt.Sprintf("Error parsing response: %v", err))
		return
	}
	extractedResponse := beutifulresponse.Candidates[0].Content.Parts[0]

	var extractedResponseInParts models.ExtractedResponse
	extractedResponseInParts, err = extractPartsFromGeminiResponse(extractedResponse)
	if err != nil {
		utils.ErrorResponse(w, http.StatusInternalServerError, fmt.Sprintf("Error parsing response: %v", err))
		return
	}

	// Update the session status
	if session.InterviewStatus == models.NotStarted {
		_, err = UpdateSession(sessionId, 
			bson.M{
				"interviewstatus": "waiting-for-answer",
			},
		)
		if err != nil {
			http.Error(w, "Failed to update session", http.StatusInternalServerError)
			return
		}
	}

	// Update the question status
	if session.InterviewStatus == models.NotStarted {
		question := models.Question{
			ID:        primitive.NewObjectID(),
			SessionId: session.ID,
			Question:  []string{extractedResponseInParts.Question},
			Rating:    []string{},
			Review:    []string{},
			CreatedAt: time.Now(),
			UpdatedAt: time.Now(),
		}
		_, err = AddQuestion(question)
		if err != nil {
			utils.ErrorResponse(w, http.StatusInternalServerError, "Failed to update question")
			return
		}
	} else {
		_, err = UpdateQuestion(extractedResponseInParts.Question, extractedResponseInParts.Rating, extractedResponseInParts.Feedback, sessionId) 
		if err != nil {
			utils.ErrorResponse(w, http.StatusInternalServerError, "Failed to update question")
			return
		}
	}

	w.Header().Set("Content-Type", "application/json")
	utils.SuccessResponse(w, "Gemini response retrieved successfully", extractedResponseInParts.Question)
}