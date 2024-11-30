package controllers

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/gorilla/mux"
	"github.com/joho/godotenv"
	"github.com/rnkp755/mockinterviewBackend/db"
	"github.com/rnkp755/mockinterviewBackend/models"
	"github.com/rnkp755/mockinterviewBackend/utils"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

var SessionCollection *mongo.Collection

func init() {

	if os.Getenv("DB_NAME") != "production" {
		err := godotenv.Load()
		if err != nil {
			log.Fatal("Error loading .env file")
		}
	}
	colName := os.Getenv("SESSION_COLLECTION_NAME")

	SessionCollection = db.ConnectToDb(colName)
}

func createNewSession(session models.Session) (primitive.ObjectID, error) {
	fmt.Println("Creating new session ...", SessionCollection)
	result, err := SessionCollection.InsertOne(context.TODO(), session)
	if err != nil {
		log.Println("Failed to insert session: ", err)
		return primitive.NilObjectID, err
	}

	sessionId := result.InsertedID.(primitive.ObjectID)

	return sessionId, nil
}

func CreateSession(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Allow-Control-Allow-Methods", "POST")

	var session models.Session

	if err := json.NewDecoder(r.Body).Decode(&session); err != nil {
		utils.ErrorResponse(w, http.StatusBadRequest, "Invalid request payload")
		return
	}

	if err := session.ValidateAndInitialize(); err != nil {
		utils.ErrorResponse(w, http.StatusBadRequest, "Invalid request payload")
		return
	}

	sessionId, err := createNewSession(session)

	if err != nil {
		utils.ErrorResponse(w, http.StatusInternalServerError, "Failed to create session")
		return
	}

	/*
		Set or update the "_id" cookie with the sessionId.Hex()
		cookie := &http.Cookie{
			Name:     "_id",
			Value:    sessionId.Hex(),
			Path:     "/",
			Domain:   "localhost:5173", // Include a leading dot to allow subdomains
			HttpOnly: true,
			Secure:   true,
			SameSite: http.SameSiteNoneMode, // Allows the cookie to be sent cross-site
			Expires:  time.Now().Add(7 * 24 * time.Hour),
		}

		http.SetCookie(w, cookie)
	*/

	utils.SuccessResponse(w, "Session created successfully", sessionId.Hex())
}

func GetSession(sessionId string) (*models.Session, error) {
	objectId, err := primitive.ObjectIDFromHex(sessionId)
	if err != nil {
		return nil, fmt.Errorf("invalid session ID: %v", err)
	}

	var session models.Session
	err = SessionCollection.FindOne(context.TODO(), bson.M{"_id": objectId}).Decode(&session)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return nil, fmt.Errorf("session not found")
		}
		return nil, fmt.Errorf("failed to fetch session: %v", err)
	}

	return &session, nil
}

func UpdateSession(sessionId string, updateFields bson.M) (*models.Session, error) {
	objectId, err := primitive.ObjectIDFromHex(sessionId)
	if err != nil {
		return nil, fmt.Errorf("invalid session ID: %v", err)
	}

	// Fetch session details from the database
	session, err := GetSession(sessionId)

	if err != nil {
		return nil, fmt.Errorf("session not found")
	}

	if session.InterviewStatus == models.Ended {
		return session, nil
	} else {

		// Add UpdatedAt field to the updateFields
		updateFields["updatedAt"] = time.Now()

		update := bson.M{
			"$set": updateFields,
		}

		// Perform the update
		opts := options.FindOneAndUpdate().SetReturnDocument(options.After)
		var updatedSession models.Session
		err = SessionCollection.FindOneAndUpdate(context.TODO(), bson.M{"_id": objectId}, update, opts).Decode(&updatedSession)
		if err != nil {
			if err == mongo.ErrNoDocuments {
				return nil, fmt.Errorf("session not found")
			}
			return nil, fmt.Errorf("failed to update session: %v", err)
		}

		return &updatedSession, nil
	}
}

func EndSession(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Allow-Control-Allow-Methods", "POST")

	// Extract sessionId from URL like /session/{sessionId}
	vars := mux.Vars(r)
	sessionId := vars["sessionId"]

	// Add logic for ending session
	updatedSession, err := UpdateSession(sessionId,
		bson.M{
			"interviewstatus": "ended",
		},
	)

	if err != nil {
		utils.ErrorResponse(w, http.StatusInternalServerError, "Failed to end session")
		return
	}

	var questions *models.Question
	questions, err = GetQuestion(updatedSession.ID.Hex())

	if err != nil {
		utils.ErrorResponse(w, http.StatusInternalServerError, "Failed to generate report")
		return
	}

	// Print the report
	fmt.Println(questions)

	response := map[string]interface{}{
		"session":   updatedSession,
		"questions": questions,
	}

	utils.SuccessResponse(w, "Session ended successfully", response)
}
