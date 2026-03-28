package controllers

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"regexp"
	"strings"
	"time"

	"github.com/google/generative-ai-go/genai"
	"github.com/gorilla/mux"
	"github.com/rnkp755/mockinterviewBackend/models"
	"github.com/rnkp755/mockinterviewBackend/utils"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type GeminiRequest struct {
	Answer string `json:"answer"`
}

// extractPartsFromGeminiResponse parses the text output using Regex.
// All tags use (?s) so they match across newlines.
// If <Question> is missing entirely, the full raw response is used as the question
// (Gemini sometimes ignores format instructions on the first call).
func extractPartsFromGeminiResponse(response string) models.ExtractedResponse {
	result := models.ExtractedResponse{}

	// (?s) makes . match newlines — critical for multi-line Gemini responses
	extract := func(tag string) string {
		re := regexp.MustCompile(fmt.Sprintf(`(?s)<%s>(.*?)</%s>`, tag, tag))
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

	// ✅ FALLBACK: if Gemini ignored the format and returned plain text,
	// use the entire response as the question rather than showing "No question received."
	if result.Question == "" && strings.TrimSpace(response) != "" {
		log.Println("⚠️  No <Question> tag found — using raw Gemini response as question")
		result.Question = strings.TrimSpace(response)
	}

	return result
}

// buildProjectSummary converts session projects into readable text for the prompt
func buildProjectSummary(projects []models.Project) string {
	if len(projects) == 0 {
		return "No projects provided."
	}
	var sb strings.Builder
	for i, p := range projects {
		sb.WriteString(fmt.Sprintf(
			"%d. %s\n   Tech: %s\n   Description: %s\n",
			i+1, p.Title, strings.Join(p.TechStacks, ", "), p.Description,
		))
	}
	return sb.String()
}

// buildConversationHistory interleaves questions and answers for the follow-up prompt
func buildConversationHistory(questions []string, answers []string) string {
	if len(questions) == 0 {
		return "None yet."
	}
	var sb strings.Builder
	for i, q := range questions {
		sb.WriteString(fmt.Sprintf("Q%d: %s\n", i+1, q))
		if i < len(answers) {
			sb.WriteString(fmt.Sprintf("A%d: %s\n", i+1, answers[i]))
		} else {
			sb.WriteString(fmt.Sprintf("A%d: (not answered yet)\n", i+1))
		}
		sb.WriteString("\n")
	}
	return sb.String()
}

func AskToGemini(w http.ResponseWriter, r *http.Request) {
	log.Println("----- Received AskToGemini Request -----")

	if r.Method != http.MethodPost {
		utils.ErrorResponse(w, http.StatusMethodNotAllowed, "Invalid request method")
		return
	}

	if GeminiModel == nil {
		utils.ErrorResponse(w, http.StatusInternalServerError, "Gemini not initialized")
		return
	}

	var answer string
	contentType := r.Header.Get("Content-Type")

	// --- INPUT PARSING ---
	if strings.Contains(contentType, "application/json") {
		var reqBody GeminiRequest
		if err := json.NewDecoder(r.Body).Decode(&reqBody); err != nil {
			utils.ErrorResponse(w, http.StatusBadRequest, "Invalid JSON body")
			return
		}
		answer = reqBody.Answer

	} else if strings.Contains(contentType, "multipart/form-data") {
		if err := r.ParseMultipartForm(10 << 20); err != nil {
			utils.ErrorResponse(w, http.StatusBadRequest, "Failed to parse form data")
			return
		}
		answer = r.FormValue("answer")
		if answer == "" {
			answer = r.FormValue("Answer")
		}
		if answer == "" {
			answer = r.FormValue("transcript")
		}

	} else {
		r.ParseForm()
		answer = r.FormValue("answer")
	}

	// --- VALIDATION ---
	vars := mux.Vars(r)
	sessionId := vars["sessionId"]

	session, err := GetSession(sessionId)
	if err != nil {
		utils.ErrorResponse(w, http.StatusInternalServerError, "Failed to get session")
		return
	}

	if session.InterviewStatus == models.Ended {
		utils.ErrorResponse(w, http.StatusBadRequest, "Session has already ended")
		return
	}

	if session.InterviewStatus != models.NotStarted && strings.TrimSpace(answer) == "" {
		utils.ErrorResponse(w, http.StatusBadRequest, "Please provide an answer")
		return
	}

	// --- PROMPT GENERATION ---
	var prompt string

	if session.InterviewStatus == models.NotStarted {
		// ─────────────────────────────────────────────────────────────────────
		// FIRST CALL — Welcome message + self-intro request
		// Keep the prompt simple and direct so Gemini follows the format.
		// ─────────────────────────────────────────────────────────────────────
		prompt = fmt.Sprintf(`You are a friendly AI technical interviewer at "Interview Prep AI".

Candidate info (from their resume):
- Name: %s
- Experience: %s
- Tech stacks: %s
- Projects: %s

Write a warm welcome message that:
1. Greets the candidate by name and welcomes them to Interview Prep AI.
2. Briefly introduces yourself as their AI interviewer.
3. Asks them to introduce themselves — their background, what they study or work on, and what they enjoy building.

Do NOT ask any technical question yet. Keep it warm and encouraging (3-4 sentences max).

You MUST respond using this exact format and nothing else:
<Question>your message here</Question>`,
			session.Name,
			session.Experience,
			strings.Join(session.TechStacks, ", "),
			buildProjectSummary(session.Projects),
		)

	} else {
		// ─────────────────────────────────────────────────────────────────────
		// FOLLOW-UP CALLS — Evaluate last answer + ask next question
		// ─────────────────────────────────────────────────────────────────────
		history, histErr := GetQuestion(session.ID.Hex())
		if histErr != nil {
			log.Printf("Could not load question history: %v", histErr)
		}

		conversationHistory := "None yet."
		questionCount := 0
		if history != nil {
			conversationHistory = buildConversationHistory(history.Question, history.Answers)
			questionCount = len(history.Question)
		}

		difficulty := "beginner to intermediate"
		if questionCount >= 3 && questionCount < 6 {
			difficulty = "intermediate"
		} else if questionCount >= 6 {
			difficulty = "intermediate to advanced"
		}

		prompt = fmt.Sprintf(`You are a professional AI technical interviewer at "Interview Prep AI".

CANDIDATE PROFILE:
- Name: %s
- Experience: %s
- Tech stacks: %s
- Projects from resume:
%s

INTERVIEW HISTORY (all questions asked and answers given so far):
%s

CANDIDATE'S LATEST ANSWER:
%s

YOUR TASKS:
1. Evaluate the latest answer honestly.
2. Rate it from 1 to 10.
3. Give concise feedback (2-3 sentences: what was good, what was missing).
4. Ask the NEXT question at difficulty level: %s. Base it on their resume and prior answers. Include a code snippet only if truly relevant.

You MUST respond using ONLY these exact tags and nothing else outside them:
<Rating>X/10</Rating>
<Feedback>your feedback here</Feedback>
<Question>your next question here</Question>
<Code>code snippet here — OMIT THIS TAG ENTIRELY if no code needed</Code>`,
			session.Name,
			session.Experience,
			strings.Join(session.TechStacks, ", "),
			buildProjectSummary(session.Projects),
			conversationHistory,
			answer,
			difficulty,
		)
	}

	// --- GEMINI CALL ---
	log.Println("Sending prompt to Gemini...")

	resp, err := GeminiModel.GenerateContent(r.Context(), genai.Text(prompt))
	if err != nil {
		utils.ErrorResponse(w, http.StatusInternalServerError, fmt.Sprintf("Gemini error: %v", err))
		return
	}

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

	rawResponse := string(textResp)
	log.Printf("Raw Gemini response:\n%s", rawResponse) // ✅ see exactly what Gemini returned

	extractedParts := extractPartsFromGeminiResponse(rawResponse)
	log.Printf("Extracted → Question: %q | Rating: %q | Feedback: %q",
		extractedParts.Question, extractedParts.Rating, extractedParts.Feedback)

	// --- BUILD FULL QUESTION TEXT (with optional code block) ---
	fullQuestionText := extractedParts.Question
	if extractedParts.Code != "" {
		fullQuestionText += "\n```\n" + extractedParts.Code + "\n```"
	}

	// --- SAVE TO DB ---
	if session.InterviewStatus == models.NotStarted {
		question := models.Question{
			ID:        primitive.NewObjectID(),
			SessionId: session.ID,
			Question:  []string{fullQuestionText},
			Answers:   []string{},
			Rating:    []string{},
			Review:    []string{},
			CreatedAt: time.Now(),
			UpdatedAt: time.Now(),
		}
		if _, dbErr := AddQuestion(question); dbErr != nil {
			log.Printf("Error saving first question: %v", dbErr)
		}
		if _, updateErr := UpdateSession(sessionId, bson.M{"interviewstatus": "waiting-for-answer"}); updateErr != nil {
			log.Printf("Error updating session status: %v", updateErr)
		}

	} else {
		if _, dbErr := UpdateQuestion(
			fullQuestionText,
			answer,
			extractedParts.Rating,
			extractedParts.Feedback,
			sessionId,
		); dbErr != nil {
			log.Printf("Error updating question doc: %v", dbErr)
		}
	}

	w.Header().Set("Content-Type", "application/json")
	utils.SuccessResponse(w, "Gemini response retrieved successfully", map[string]interface{}{
		"question": extractedParts.Question,
		"code":     extractedParts.Code,
		"rating":   extractedParts.Rating,
		"feedback": extractedParts.Feedback,
	})
}