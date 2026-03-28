package controllers

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"time"

	"github.com/gorilla/mux"

	"github.com/rnkp755/mockinterviewBackend/models"
	"github.com/rnkp755/mockinterviewBackend/utils"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)


func createNewSession(session models.Session) (primitive.ObjectID, error) {

	// ✅ SAFETY CHECK
	if SessionCollection == nil {
		return primitive.NilObjectID, fmt.Errorf("database not initialized")
	}

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
		utils.ErrorResponse(w, http.StatusInternalServerError, err.Error())
		return
	}

	utils.SuccessResponse(w, "Session created successfully", sessionId.Hex())
}

func GetSession(sessionId string) (*models.Session, error) {

	if SessionCollection == nil {
		return nil, fmt.Errorf("database not initialized")
	}

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

	if SessionCollection == nil {
		return nil, fmt.Errorf("database not initialized")
	}

	objectId, err := primitive.ObjectIDFromHex(sessionId)
	if err != nil {
		return nil, fmt.Errorf("invalid session ID: %v", err)
	}

	session, err := GetSession(sessionId)
	if err != nil {
		return nil, fmt.Errorf("session not found")
	}

	if session.InterviewStatus == models.Ended {
		return session, nil
	}

	updateFields["updatedAt"] = time.Now()

	update := bson.M{
		"$set": updateFields,
	}

	opts := options.FindOneAndUpdate().SetReturnDocument(options.After)

	var updatedSession models.Session
	err = SessionCollection.FindOneAndUpdate(
		context.TODO(),
		bson.M{"_id": objectId},
		update,
		opts,
	).Decode(&updatedSession)

	if err != nil {
		if err == mongo.ErrNoDocuments {
			return nil, fmt.Errorf("session not found")
		}
		return nil, fmt.Errorf("failed to update session: %v", err)
	}

	return &updatedSession, nil
}

func EndSession(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	vars := mux.Vars(r)
	sessionId := vars["sessionId"]

	updatedSession, err := UpdateSession(sessionId, bson.M{
		"interviewstatus": "ended",
	})
	if err != nil {
		utils.ErrorResponse(w, http.StatusInternalServerError, "Failed to end session")
		return
	}

	questions, err := GetQuestion(updatedSession.ID.Hex())
	if err != nil {
		utils.ErrorResponse(w, http.StatusInternalServerError, "Failed to generate report")
		return
	}

	response := map[string]interface{}{
		"session":   updatedSession,
		"questions": questions,
	}

	utils.SuccessResponse(w, "Session ended successfully", response)
}