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

	// Initialize router
	r := routes.Router()

	// Load environment variables from the .env file
	// In a production environment (like Render), variables are set directly.
	// The .env file is only for local development.
	if os.Getenv("GO_ENV") != "production" {
		err := godotenv.Load()
		if err != nil {
			log.Println("Warning: Could not load .env file. Using environment variables from the system.")
		}
	}

	// Retrieve port from environment variables
	PORT := os.Getenv("PORT")
	if PORT == "" {
		log.Fatal("PORT environment variable is not set")
	}

	// // Configure CORS options
	// c := cors.New(cors.Options{
	// 	AllowedOrigins:   []string{os.Getenv("FRONTEND_URL_DEVELOPMENT"), os.Getenv("FRONTEND_URL_PRODUCTION_ONE"), os.Getenv("FRONTEND_URL_PRODUCTION_TWO")}, // Add your allowed origins here
	// 	AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE"},                                                                                            // Add your allowed methods here
	// 	AllowedHeaders:   []string{"Content-Type", "Authorization"},                                                                                           // Add your allowed headers here
	// 	AllowCredentials: true,                                                                                                                                // Set to true if you need to send cookies
	// })

c := cors.New(cors.Options{
    AllowedOrigins: []string{
        os.Getenv("FRONTEND_URL"),
        "http://localhost:5173",
    },
    AllowedMethods: []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
    AllowedHeaders: []string{"Content-Type", "Authorization"},
    AllowCredentials: true,
})

	// Wrap router with CORS middleware
	handler := c.Handler(r)

	fmt.Println("Server is starting on port:", PORT)

	// Start the server
	if err := http.ListenAndServe(":"+PORT, handler); err != nil {
		log.Fatal("Failed to start the server:", err)
	}
}