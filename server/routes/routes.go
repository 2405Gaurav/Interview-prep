package routes

import (
	"github.com/gorilla/mux"
	"github.com/rnkp755/mockinterviewBackend/controllers"
)

func Router() *mux.Router {
	router := mux.NewRouter()

	// Root health check for Render
	router.HandleFunc("/", controllers.HealthCheck).Methods("GET")
	router.HandleFunc("/health", controllers.HealthCheck).Methods("GET")
	
	router.HandleFunc("/api/v1/session", controllers.CreateSession).Methods("POST")
	router.HandleFunc("/api/v1/ask-to-gemini/{sessionId}", controllers.AskToGemini).Methods("POST")
	router.HandleFunc("/api/v1/end/{sessionId}", controllers.EndSession).Methods("POST")
	router.HandleFunc("/api/v1/health", controllers.HealthCheck).Methods("GET")

	return router
}
