package controllers

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"strings"

	"github.com/google/generative-ai-go/genai"
	"github.com/rnkp755/mockinterviewBackend/utils"
	"google.golang.org/api/option"
)

func UploadResume(w http.ResponseWriter, r *http.Request) {
	// Enable CORS
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")

	if r.Method == "OPTIONS" {
		w.WriteHeader(http.StatusOK)
		return
	}

	// Parse multipart form (max 10MB)
	err := r.ParseMultipartForm(10 << 20)
	if err != nil {
		utils.ErrorResponse(w, http.StatusBadRequest, "Failed to parse form")
		return
	}

	// Get the file from form
	file, handler, err := r.FormFile("file")
	if err != nil {
		utils.ErrorResponse(w, http.StatusBadRequest, "Failed to get file")
		return
	}
	defer file.Close()

	// Validate file type
	if !strings.HasSuffix(strings.ToLower(handler.Filename), ".pdf") {
		utils.ErrorResponse(w, http.StatusBadRequest, "Only PDF files are allowed")
		return
	}

	// Read file content
	fileBytes, err := io.ReadAll(file)
	if err != nil {
		utils.ErrorResponse(w, http.StatusInternalServerError, "Failed to read file")
		return
	}

	// Parse resume using Gemini
	resumeData, err := parseResumeWithGemini(fileBytes)
	if err != nil {
		utils.ErrorResponse(w, http.StatusInternalServerError, fmt.Sprintf("Failed to parse resume: %v", err))
		return
	}

	utils.SuccessResponse(w, "Resume parsed successfully", resumeData)
}

func parseResumeWithGemini(fileBytes []byte) (map[string]interface{}, error) {
	ctx := context.Background()

	// Get API key from environment
	apiKey := os.Getenv("GEMINI_API_KEY")
	if apiKey == "" {
		return nil, fmt.Errorf("GEMINI_API_KEY not set")
	}

	client, err := genai.NewClient(ctx, option.WithAPIKey(apiKey))
	if err != nil {
		return nil, err
	}
	defer client.Close()

	model := client.GenerativeModel("gemini-2.5-flash")

	prompt := `Extract information from this resume PDF and return ONLY a valid JSON object:
{
  "name": "Full Name",
  "techStacks": ["Tech1", "Tech2"],
  "experience": "Fresher" or "0-2 Years" or "2+ Years",
  "projects": [
    {
      "title": "Project Name",
      "techStacks": ["Tech1", "Tech2"],
      "description": "Brief description"
    }
  ]
}

Return only the JSON, no markdown formatting.`

	resp, err := model.GenerateContent(
		ctx,
		genai.Text(prompt),
		genai.Blob{
			MIMEType: "application/pdf",
			Data:     fileBytes,
		},
	)
	if err != nil {
		return nil, err
	}

	// Validate response
	if len(resp.Candidates) == 0 || len(resp.Candidates[0].Content.Parts) == 0 {
		return nil, fmt.Errorf("no response from Gemini")
	}

	responseText := fmt.Sprintf("%v", resp.Candidates[0].Content.Parts[0])

	// Clean markdown formatting if present
	responseText = strings.TrimPrefix(responseText, "```json")
	responseText = strings.TrimPrefix(responseText, "```")
	responseText = strings.TrimSuffix(responseText, "```")
	responseText = strings.TrimSpace(responseText)

	// Parse JSON
	var result map[string]interface{}
	err = json.Unmarshal([]byte(responseText), &result)
	if err != nil {
		return nil, fmt.Errorf("failed to parse AI response: %v", err)
	}

	return result, nil
}
