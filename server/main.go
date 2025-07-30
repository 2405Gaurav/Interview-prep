package main

import (
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/joho/godotenv"
	"github.com/rnkp755/mockinterviewBackend/routes"
	"github.com/rs/cors"
)

func main() {
	fmt.Println("Starting the backend server for the mockinterview app...")

	// Load .env file if it exists (only for local dev)
	if _, err := os.Stat(".env"); err == nil {
		if err := godotenv.Load(); err != nil {
			log.Println("Warning: Could not load .env file (this is fine in production)")
		}
	}

	// Always get PORT from environment
	PORT := os.Getenv("PORT")
	if PORT == "" {
		PORT = "10000" // fallback for local development
	}

	// Debug: Print all relevant environment variables
	fmt.Printf("Environment PORT: %s\n", PORT)
	fmt.Printf("FRONTEND_URL_DEVELOPMENT: %s\n", os.Getenv("FRONTEND_URL_DEVELOPMENT"))
	fmt.Printf("FRONTEND_URL_PRODUCTION_ONE: %s\n", os.Getenv("FRONTEND_URL_PRODUCTION_ONE"))
	fmt.Printf("FRONTEND_URL_PRODUCTION_TWO: %s\n", os.Getenv("FRONTEND_URL_PRODUCTION_TWO"))

	// Setup CORS
	c := cors.New(cors.Options{
		AllowedOrigins:   []string{os.Getenv("FRONTEND_URL_DEVELOPMENT"), os.Getenv("FRONTEND_URL_PRODUCTION_ONE"), os.Getenv("FRONTEND_URL_PRODUCTION_TWO")},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE"},
		AllowedHeaders:   []string{"Content-Type", "Authorization"},
		AllowCredentials: true,
	})

	handler := c.Handler(routes.Router())

	fmt.Printf("Server is starting on port: %s\n", PORT)
	fmt.Printf("Binding to: 0.0.0.0:%s\n", PORT)

	// Start server with 0.0.0.0 binding (correct for Render)
	server := &http.Server{
		Addr:    "0.0.0.0:" + PORT,
		Handler: handler,
	}

	fmt.Println("Server successfully bound to port", PORT)
	if err := server.ListenAndServe(); err != nil {
		log.Fatal("Failed to start the server:", err)
	}
}
