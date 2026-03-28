package controllers

import (
	"log"
	"os"

	"github.com/rnkp755/mockinterviewBackend/db"
	"go.mongodb.org/mongo-driver/mongo"
)

var SessionCollection *mongo.Collection

func InitSessionCollection() {
	colName := os.Getenv("SESSION_COLLECTION_NAME")
	if colName == "" {
		log.Fatal("SESSION_COLLECTION_NAME not set")
	}

	SessionCollection = db.ConnectToDb(colName)

	if SessionCollection == nil {
		log.Fatal("Failed to initialize SessionCollection")
	}

	log.Println("✅ Mongo SessionCollection initialized")
}