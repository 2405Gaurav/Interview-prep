package controllers

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/google/generative-ai-go/genai"
	"github.com/rnkp755/mockinterviewBackend/utils"
	"google.golang.org/api/option"
)

var resumeClient *genai.Client
var resumeModel *genai.GenerativeModel

func init() {
	apiKey := os.Getenv("GEMINI_API_KEY")
	if apiKey == "" {
		return
	}

	ctx := context.Background()
	client, err := genai.NewClient(ctx, option.WithAPIKey(apiKey))
	if err != nil {
		return
	}

	resumeClient = client
	resumeModel = client.GenerativeModel("gemini-2.5-flash")
}

func UploadResume(w http.ResponseWriter, r *http.Request) {

	// Handle preflight
	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusOK)
		return
	}

	if r.Method != http.MethodPost {
		utils.ErrorResponse(w, http.StatusMethodNotAllowed, "Invalid request method")
		return
	}

	// Parse multipart form (max 10MB)
	if err := r.ParseMultipartForm(10 << 20); err != nil {
		utils.ErrorResponse(w, http.StatusBadRequest, "Failed to parse form")
		return
	}

	file, handler, err := r.FormFile("file")
	if err != nil {
		utils.ErrorResponse(w, http.StatusBadRequest, "Failed to get file")
		return
	}
	defer file.Close()

	// Validate file type by extension
	if !strings.HasSuffix(strings.ToLower(handler.Filename), ".pdf") {
		utils.ErrorResponse(w, http.StatusBadRequest, "Only PDF files are allowed")
		return
	}

	// Read file bytes
	fileBytes, err := io.ReadAll(file)
	if err != nil {
		utils.ErrorResponse(w, http.StatusInternalServerError, "Failed to read file")
		return
	}

	// Parse with Gemini
	resumeData, err := parseResumeWithGemini(fileBytes)
	if err != nil {
		utils.ErrorResponse(w, http.StatusInternalServerError, err.Error())
		return
	}

	utils.SuccessResponse(w, "Resume parsed successfully", resumeData)
}

func parseResumeWithGemini(fileBytes []byte) (map[string]interface{}, error) {

	if resumeModel == nil {
		return nil, fmt.Errorf("Gemini not initialized")
	}

	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

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

Return only the JSON. No markdown formatting.`

	resp, err := resumeModel.GenerateContent(
		ctx,
		genai.Text(prompt),
		genai.Blob{
			MIMEType: "application/pdf",
			Data:     fileBytes,
		},
	)
	if err != nil {
		return nil, fmt.Errorf("Gemini request failed: %v", err)
	}

	if len(resp.Candidates) == 0 ||
		len(resp.Candidates[0].Content.Parts) == 0 {
		return nil, fmt.Errorf("empty response from Gemini")
	}

	textPart, ok := resp.Candidates[0].Content.Parts[0].(genai.Text)
	if !ok {
		return nil, fmt.Errorf("unexpected Gemini response format")
	}

	responseText := string(textPart)

	// Clean markdown formatting if present
	responseText = strings.TrimPrefix(responseText, "```json")
	responseText = strings.TrimPrefix(responseText, "```")
	responseText = strings.TrimSuffix(responseText, "```")
	responseText = strings.TrimSpace(responseText)

	var result map[string]interface{}
	if err := json.Unmarshal([]byte(responseText), &result); err != nil {
		return nil, fmt.Errorf("invalid JSON from Gemini: %v", err)
	}

	return result, nil
}