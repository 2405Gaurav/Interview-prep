package controllers

import (
	"net/http"

	"github.com/rnkp755/mockinterviewBackend/utils"
)

func HealthCheck(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Allow-Control-Allow-Methods", "GET")

	response := map[string]interface{}{
		"status": "ok",
	}

	utils.SuccessResponse(w, "Server is healthy", response)
}
