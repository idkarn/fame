package games

import (
	"context"
	"database/sql"
	"errors"
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

	if _, err := db.
		Insert(game).
		Exec(ctx); err != nil {
		return nil, err
	}

	return game, nil
}

func GetGame(ctx context.Context, gid uuid.UUID) (*db.Game, error) {
	game := new(db.Game)
	if err := db.
		Select(game).
		Where("id = ?", gid).
		Scan(ctx); errors.Is(err, sql.ErrNoRows) {
		return nil, errors.New("not found")
	} else if err != nil {
		return nil, err
	}
	return game, nil
}

func GetAllGames(ctx context.Context, oid uuid.UUID) (*[]db.Game, error) {
	var games []db.Game
	if err := db.
		Select(&games).
		Where("owner_id = ?", oid).
		Scan(ctx); errors.Is(err, sql.ErrNoRows) {
		return nil, errors.New("not found")
	} else if err != nil {
		return nil, err
	}
	return &games, nil
}

func DeleteGame(ctx context.Context, gid uuid.UUID) error {
	game := &db.Game{ID: gid}
	// todo: implement soft delete
	if _, err := db.Delete(game).WherePK().Exec(ctx); err != nil {
		return err
	}
	return nil
}
