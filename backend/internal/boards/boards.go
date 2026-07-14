package boards

import (
	"context"
	"fame/internal/db"

	"github.com/google/uuid"
)

func NewBoard(ctx context.Context, gid uuid.UUID, name string) (*db.Board, error) {
	b := &db.Board{
		ID:     uuid.Must(uuid.NewV7()),
		GameID: gid,
		Name:   name,
	}

	if _, err := db.
		Insert(b).
		Exec(ctx); err != nil {
		return nil, err
	}

	return b, nil
}
