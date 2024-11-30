package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Question struct {
	ID        primitive.ObjectID `json:"_id,omitempty" bson:"_id,omitempty"`
	SessionId primitive.ObjectID `json:"sessionid" bson:"sessionid"`
	Question  []string           `json:"question" bson:"question"`
	Rating    []string           `json:"rating" bson:"rating"`
	Review    []string           `json:"review" bson:"review"`
	CreatedAt time.Time          `json:"createdAt,omitempty" bson:"createdAt,omitempty"`
	UpdatedAt time.Time          `json:"updatedAt,omitempty" bson:"updatedAt,omitempty"`
}
