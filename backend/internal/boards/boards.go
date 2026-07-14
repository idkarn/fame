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

// todo: exclude GameID from response
func GetBoard(ctx context.Context, bid uuid.UUID) (*db.Board, error) {
	b := new(db.Board)
	if err := db.
		Select(b).
		Where("id = ?", bid).
		Scan(ctx); err != nil {
		return nil, err
	}
	return b, nil
}

func DeleteBoard(ctx context.Context, bid uuid.UUID) error {
	b := &db.Board{ID: bid}
	if _, err := db.
		Delete(b).
		WherePK().
		Exec(ctx); err != nil {
		return err
	}
	return nil
}
