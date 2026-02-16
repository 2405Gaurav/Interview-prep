package controllers

import (
	"context"
	"fmt"
	"log"
	"os"
	"time"

	
	"github.com/rnkp755/mockinterviewBackend/db"
	"github.com/rnkp755/mockinterviewBackend/models"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

var QuestionCollection *mongo.Collection

func init() {
	colName := os.Getenv("QUESTION_COLLECTION_NAME")
	if colName == "" {
		log.Println("Warning: QUESTION_COLLECTION_NAME not set. Question features will not work.")
		return
	}

	QuestionCollection = db.ConnectToDb(colName)

	if QuestionCollection == nil {
		log.Println("Warning: Failed to initialize QuestionCollection")
	}
}

func AddQuestion(question models.Question) (*models.Question, error) {
	// Create a context with a 10-second timeout
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	_, err := QuestionCollection.InsertOne(ctx, question)
	if err != nil {
		return nil, fmt.Errorf("failed to insert question document: %v", err)
	}

	return &question, nil
}

func UpdateQuestion(questionText string, rating string, review string, sessionIdStr string) (*models.Question, error) {
	// 1. Validate Session ID
	sessionId, err := primitive.ObjectIDFromHex(sessionIdStr)
	if err != nil {
		return nil, fmt.Errorf("invalid session ID format: %v", err)
	}

	// 2. Prepare Context
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// 3. Construct Update Document
	// Always update the 'updatedAt' timestamp
	updateDoc := bson.M{
		"$set": bson.M{
			"updatedAt": time.Now(),
		},
	}

	// Construct the $push document dynamically based on inputs
	pushFields := bson.M{}
	if questionText != "" {
		pushFields["question"] = questionText
	}
	if rating != "" {
		pushFields["rating"] = rating
	}
	if review != "" {
		// Maps 'review' argument to 'review' field (used for Feedback)
		pushFields["review"] = review 
	}

	// Only add $push to the update if there are fields to push
	if len(pushFields) > 0 {
		updateDoc["$push"] = pushFields
	}

	// 4. Define Filter and Options
	filter := bson.M{"sessionid": sessionId}
	
	// Return the document *after* the update is applied
	opts := options.FindOneAndUpdate().SetReturnDocument(options.After)

	// 5. Execute Update
	var updatedQuestion models.Question
	err = QuestionCollection.FindOneAndUpdate(ctx, filter, updateDoc, opts).Decode(&updatedQuestion)
	
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return nil, fmt.Errorf("question document not found for session %s", sessionIdStr)
		}
		return nil, fmt.Errorf("database error during update: %v", err)
	}

	return &updatedQuestion, nil
}

func GetQuestion(sessionIdStr string) (*models.Question, error) {
	// 1. Validate Session ID
	sessionId, err := primitive.ObjectIDFromHex(sessionIdStr)
	if err != nil {
		return nil, fmt.Errorf("invalid session ID format: %v", err)
	}

	// 2. Prepare Context
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// 3. Find Document
	filter := bson.M{"sessionid": sessionId}
	var question models.Question
	
	err = QuestionCollection.FindOne(ctx, filter).Decode(&question)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return nil, fmt.Errorf("no question history found for session %s", sessionIdStr)
		}
		return nil, fmt.Errorf("failed to fetch question: %v", err)
	}

	return &question, nil
}