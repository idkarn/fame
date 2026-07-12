package db

import (
	"database/sql"

	"github.com/google/uuid"
	"github.com/uptrace/bun"
)

// User model
type User struct {
	bun.BaseModel `bun:"table:users,alias:u"`

	ID     uuid.UUID `bun:",pk"`
	Email  string    `bun:",unique"`
	Secret string

	Games []*Game `bun:"rel:has-many,join:id=owner_id"`
}

// Game model
type Game struct {
	bun.BaseModel `bun:"table:games,alias:g"`

	ID          uuid.UUID      `bun:",pk,type:blob"`
	OwnerID     uuid.UUID      `bun:"owner_id,notnull,type:blob"`
	DisplayName string         `bun:"display_name,notnull"`
	GameURL     sql.NullString `bun:"game_url"`
	ProjectName string         `bun:"project_name,notnull"`

	Boards []*Board `bun:"rel:has-many,join:id=game_id"`
}

// Board model
type Board struct {
	bun.BaseModel `bun:"table:boards,alias:b"`

	ID     uuid.UUID `bun:",pk,type:blob"`
	GameID uuid.UUID `bun:"game_id,notnull,type:blob"`
	Name   string    `bun:",notnull"`
}

// Single score model
type Record struct {
	bun.BaseModel `bun:"table:records,alias:r"`

	ID      uuid.UUID `bun:",pk"`
	BoardID uuid.UUID `bun:"board_id,notnull"`
}
