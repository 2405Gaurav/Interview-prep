package controllers

import (
	"context"
	"log"
	"os"

	"github.com/google/generative-ai-go/genai"
	"google.golang.org/api/option"
)

var GeminiClient *genai.Client
var GeminiModel *genai.GenerativeModel

func InitGemini() {
	apiKey := os.Getenv("GEMINI_API_KEY")
	if apiKey == "" {
		log.Fatal("GEMINI_API_KEY not set")
	}

	ctx := context.Background()

	client, err := genai.NewClient(ctx, option.WithAPIKey(apiKey))
	if err != nil {
		log.Fatal("Failed to init Gemini:", err)
	}

	GeminiClient = client
	GeminiModel = client.GenerativeModel("gemini-2.5-flash")

	log.Println("✅ Gemini initialized globally")
}