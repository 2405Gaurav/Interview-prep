package main

import (
	"log"
	"net/http"
	"os"
	"time"

	"github.com/joho/godotenv"
	"github.com/rnkp755/mockinterviewBackend/controllers"
	"github.com/rnkp755/mockinterviewBackend/routes"
	"github.com/rs/cors"
)

func main() {

	// Load .env for local dev
	if os.Getenv("GO_ENV") != "production" {
		if err := godotenv.Load(); err != nil {
			log.Println("⚠️ No .env file found, using system env")
		}
	}

	// Init Gemini (IMPORTANT)
	controllers.InitGemini()
	log.Println("✅ Gemini initialized")
	controllers.InitSessionCollection()
	log.Println("session done")
	controllers.InitQuestionCollection()
	log.Println("question started asking")

	// Port
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	// Router
	router := routes.Router()

	// CORS origins
	origins := []string{
		"https://prepai.thegauravthakur.in",
		"http://localhost:5173",
	}

	if frontend := os.Getenv("FRONTEND_URL"); frontend != "" {
		origins = append(origins, frontend)
	}

	corsHandler := cors.New(cors.Options{
		AllowedOrigins: origins,
		AllowedMethods: []string{
			http.MethodGet,
			http.MethodPost,
			http.MethodPut,
			http.MethodDelete,
			http.MethodOptions,
		},
		AllowedHeaders:   []string{"Content-Type", "Authorization"},
		AllowCredentials: true,
	})

	handler := corsHandler.Handler(router)

	server := &http.Server{
		Addr:         ":" + port,
		Handler:      handler,
		ReadTimeout:  60 * time.Second,
		WriteTimeout: 60 * time.Second,
		IdleTimeout:  60 * time.Second,
	}

	log.Println("🚀 Server running on port:", port)

	log.Fatal(server.ListenAndServe())
}