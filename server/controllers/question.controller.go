package controllers

import (
	"context"
	"fmt"
	"log"
	"os"
	"time"

	"github.com/joho/godotenv"
	"github.com/rnkp755/mockinterviewBackend/db"
	"github.com/rnkp755/mockinterviewBackend/models"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

var QuestionCollection *mongo.Collection

func init() {
	if os.Getenv("DB_NAME") != "production" {
		err := godotenv.Load()
		if err != nil {
			log.Fatal("Error loading .env file")
		}
	}

	colName := os.Getenv("QUESTION_COLLECTION_NAME")

	QuestionCollection = db.ConnectToDb(colName)
}

func AddQuestion(question models.Question) (*models.Question, error) {

	_, err := QuestionCollection.InsertOne(context.TODO(), question)
	if err != nil {
		return nil, fmt.Errorf("failed to create session: %v", err)
	}

	return &question, nil

}

func UpdateQuestion(question string, rating string, review string, sessionIdStr string) (*models.Question, error) {
	sessionId, err := primitive.ObjectIDFromHex(sessionIdStr)
	if err != nil {
		return nil, fmt.Errorf("invalid session ID: %v", err)
	}

	// Create the update document based on provided parameters
	updateFields := bson.M{
		"$set": bson.M{
			"updatedAt": time.Now(),
		},
	}

	// Conditionally add push operations
	if question != "" || rating != "" || review != "" {
		updateFields["$push"] = bson.M{}

		if question != "" {
			updateFields["$push"].(bson.M)["question"] = question
		}
		if rating != "" {
			updateFields["$push"].(bson.M)["rating"] = rating
		}
		if review != "" {
			updateFields["$push"].(bson.M)["review"] = review
		}
	}

	// Define the filter to find the document by sessionId
	filter := bson.M{"sessionid": sessionId}

	// Find and update the document
	opts := options.FindOneAndUpdate().SetReturnDocument(options.After)
	var updatedQuestion models.Question
	err = QuestionCollection.FindOneAndUpdate(context.TODO(), filter, updateFields, opts).Decode(&updatedQuestion)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return nil, fmt.Errorf("question not found")
		}
		return nil, fmt.Errorf("failed to update question: %v", err)
	}

	return &updatedQuestion, nil
}

func GetQuestion(sessionIdStr string) (*models.Question, error) {
	sessionId, err := primitive.ObjectIDFromHex(sessionIdStr)
	if err != nil {
		return nil, fmt.Errorf("invalid session ID: %v", err)
	}

	// Define the filter to find the document by sessionId
	filter := bson.M{"sessionid": sessionId}

	var question models.Question
	err = QuestionCollection.FindOne(context.TODO(), filter).Decode(&question)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return nil, fmt.Errorf("question not found")
		}
		return nil, fmt.Errorf("failed to fetch question: %v", err)
	}

	return &question, nil
}
