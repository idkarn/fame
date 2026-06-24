package db

import (
	"github.com/google/uuid"
	"github.com/uptrace/bun"
)

// User model
type User struct {
	bun.BaseModel `bun:"table:users,alias:u"`

	ID     uuid.UUID `bun:",pk"`
	Email  string    `bun:",unique"`
	Secret string
}
