package utils

import (
	"encoding/json"
	"net/http"
)

type Response struct {
	Status  int         `json:"status"`
	Message string      `json:"message"`
	Data    interface{} `json:"data,omitempty"`
}

// WriteJSON writes a Response as JSON to the http.ResponseWriter
func WriteJSON(w http.ResponseWriter, status int, message string, data interface{}) error {
	response := Response{
		Status:  status,
		Message: message,
		Data:    data,
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)

	// Use MarshalIndent for pretty-printing
	jsonResponse, err := json.MarshalIndent(response, "", "  ")
	if err != nil {
		return err
	}

	_, err = w.Write(jsonResponse)
	return err
}

// SuccessResponse creates a successful response
func SuccessResponse(w http.ResponseWriter, message string, data interface{}) error {
	return WriteJSON(w, http.StatusOK, message, data)
}

// ErrorResponse creates an error response
func ErrorResponse(w http.ResponseWriter, status int, message string) error {
	return WriteJSON(w, status, message, nil)
}