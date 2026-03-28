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

// InitQuestionCollection is called from main() after env is loaded
func InitQuestionCollection() {
	colName := os.Getenv("QUESTION_COLLECTION_NAME")
	if colName == "" {
		log.Fatal("QUESTION_COLLECTION_NAME not set")
	}

	QuestionCollection = db.ConnectToDb(colName)

	if QuestionCollection == nil {
		log.Fatal("Failed to initialize QuestionCollection")
	}

	log.Println("✅ Mongo QuestionCollection initialized")
}

func AddQuestion(question models.Question) (*models.Question, error) {

	if QuestionCollection == nil {
		return nil, fmt.Errorf("question collection not initialized")
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	_, err := QuestionCollection.InsertOne(ctx, question)
	if err != nil {
		return nil, fmt.Errorf("failed to insert question document: %v", err)
	}

	log.Printf("Inserted first question for session: %s", question.SessionId.Hex())
	return &question, nil
}

// UpdateQuestion appends to the session's question document:
//   - userAnswer  → answers[]   (what the candidate said)
//   - rating      → rating[]    (AI's score for that answer)
//   - review      → review[]    (AI's feedback)
//   - nextQuestion → question[] (the next question to ask)
func UpdateQuestion(nextQuestion string, userAnswer string, rating string, review string, sessionIdStr string) (*models.Question, error) {

	if QuestionCollection == nil {
		return nil, fmt.Errorf("question collection not initialized")
	}

	sessionId, err := primitive.ObjectIDFromHex(sessionIdStr)
	if err != nil {
		return nil, fmt.Errorf("invalid session ID format: %v", err)
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	updateDoc := bson.M{
		"$set": bson.M{
			"updatedAt": time.Now(),
		},
	}

	// MongoDB $push appends one element at a time to the array field
	pushFields := bson.M{}
	if userAnswer != "" {
		pushFields["answers"] = userAnswer
	}
	if rating != "" {
		pushFields["rating"] = rating
	}
	if review != "" {
		pushFields["review"] = review
	}
	if nextQuestion != "" {
		pushFields["question"] = nextQuestion
	}

	if len(pushFields) > 0 {
		updateDoc["$push"] = pushFields
	}

	filter := bson.M{"sessionid": sessionId}
	opts := options.FindOneAndUpdate().SetReturnDocument(options.After)

	var updatedQuestion models.Question
	err = QuestionCollection.FindOneAndUpdate(ctx, filter, updateDoc, opts).Decode(&updatedQuestion)

	if err != nil {
		if err == mongo.ErrNoDocuments {
			return nil, fmt.Errorf("question document not found for session %s", sessionIdStr)
		}
		return nil, fmt.Errorf("database error during update: %v", err)
	}

	log.Printf("Updated session %s | questions: %d | answers: %d", sessionIdStr, len(updatedQuestion.Question), len(updatedQuestion.Answers))
	return &updatedQuestion, nil
}

func GetQuestion(sessionIdStr string) (*models.Question, error) {

	if QuestionCollection == nil {
		return nil, fmt.Errorf("question collection not initialized")
	}

	sessionId, err := primitive.ObjectIDFromHex(sessionIdStr)
	if err != nil {
		return nil, fmt.Errorf("invalid session ID format: %v", err)
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// Must match bson tag in models.Question: bson:"sessionid"
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