package utils

import (
	"encoding/json"
	"log"
	"net/http"
)

type Response struct {
	Status  int         `json:"status"`
	Message string      `json:"message"`
	Data    interface{} `json:"data,omitempty"`
}

func WriteJSON(w http.ResponseWriter, status int, message string, data interface{}) error {
	response := Response{
		Status:  status,
		Message: message,
		Data:    data,
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)

	jsonResponse, err := json.Marshal(response)
	if err != nil {
		log.Println("JSON marshal error:", err)
		return err
	}

	if _, err := w.Write(jsonResponse); err != nil {
		log.Println("Response write error:", err)
		return err
	}

	return nil
}

func SuccessResponse(w http.ResponseWriter, message string, data interface{}) error {
	return WriteJSON(w, http.StatusOK, message, data)
}

func ErrorResponse(w http.ResponseWriter, status int, message string) error {
	return WriteJSON(w, status, message, nil)
}