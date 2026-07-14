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

	Games []*Game `bun:"rel:has-many,join:id=owner_id"`
}

// Game model
type Game struct {
	bun.BaseModel `bun:"table:games,alias:g"`

	ID          uuid.UUID `bun:",pk,type:blob" json:"id"`
	OwnerID     uuid.UUID `bun:"owner_id,notnull,type:blob" json:"ownerId"`
	DisplayName string    `bun:"display_name,notnull" json:"displayName"`
	GameURL     *string   `bun:"game_url" json:"gameUrl"`
	ProjectName string    `bun:"project_name,notnull" json:"projectName"`

	Boards []*Board `bun:"rel:has-many,join:id=game_id" json:"-"`
}

// Board model
type Board struct {
	bun.BaseModel `bun:"table:boards,alias:b"`

	ID     uuid.UUID `bun:",pk,type:blob" json:"id"`
	GameID uuid.UUID `bun:"game_id,notnull,type:blob" json:"gameId"`
	Name   string    `bun:",notnull" json:"name"`
}

// Single score model
type Record struct {
	bun.BaseModel `bun:"table:records,alias:r"`

	ID      uuid.UUID `bun:",pk"`
	BoardID uuid.UUID `bun:"board_id,notnull"`
}
