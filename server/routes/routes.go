package routes

import (
	"github.com/gorilla/mux"
	"github.com/rnkp755/mockinterviewBackend/controllers"
)

func Router() *mux.Router {
	router := mux.NewRouter()

	router.HandleFunc("/api/v1/session", controllers.CreateSession).Methods("POST")
	router.HandleFunc("/api/v1/ask-to-gemini/{sessionId}", controllers.AskToGemini).Methods("POST")
	router.HandleFunc("/api/v1/end/{sessionId}", controllers.EndSession).Methods("POST")

	return router
}
