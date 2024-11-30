package main

import (
	"fmt"
	"net/http"
	"os"

	"github.com/rnkp755/mockinterviewBackend/routes"
	"github.com/rs/cors"
)

func main() {
	fmt.Println("It's the backend server of mockinterview app.")

	r := routes.Router()

	// Configure CORS options
	c := cors.New(cors.Options{
		AllowedOrigins:   []string{os.Getenv("FRONTEND_URL"), "http://another-domain.com"}, // Add your allowed origins here
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE"},                         // Add your allowed methods here
		AllowedHeaders:   []string{"Content-Type", "Authorization"},                        // Add your allowed headers here
		AllowCredentials: true,                                                             // Set to true if you need to send cookies
	})

	// Wrap your router with the CORS middleware
	handler := c.Handler(r)

	fmt.Println("Server is getting started ...")

	http.ListenAndServe(":8080", handler) // Use the handler with CORS applied
	fmt.Println("Server is running on port 8080 ...")
}
