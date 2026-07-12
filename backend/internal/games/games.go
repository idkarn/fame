package games

import (
	"context"
	"fame/internal/db"

	"github.com/google/uuid"
)

func NewGame(ctx context.Context, oid uuid.UUID, projectName string) (*db.Game, error) {
	game := &db.Game{
		ID:          uuid.Must(uuid.NewV7()),
		OwnerID:     oid,
		DisplayName: projectName,
		ProjectName: projectName,
	}

	if _, err := db.Insert(game).Exec(ctx); err != nil {
		return nil, err
	}

	return game, nil
}
