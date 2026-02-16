package db

import (
	"context"
	"fmt"
	"log"
	"os"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

func ConnectToDb(collectionName string) *mongo.Collection {

	connectionString := os.Getenv("MONGODB_URI")
	dbName := os.Getenv("DB_NAME")

	if connectionString == "" || dbName == "" {
		log.Println("MONGODB_URI or DB_NAME not set")
		return nil
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	serverAPI := options.ServerAPI(options.ServerAPIVersion1)
	opts := options.Client().
		ApplyURI(connectionString).
		SetServerAPIOptions(serverAPI)

	client, err := mongo.Connect(ctx, opts)
	if err != nil {
		log.Println("Mongo connect error:", err)
		return nil
	}

	if err := client.Database(dbName).RunCommand(ctx, bson.D{{Key: "ping", Value: 1}}).Err(); err != nil {
		log.Println("Mongo ping error:", err)
		return nil
	}

	fmt.Println("MongoDB connected successfully")

	return client.Database(dbName).Collection(collectionName)
}