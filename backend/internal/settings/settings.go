package settings

import (
	"context"
	"database/sql"
	"errors"
	"fame/internal/db"

	"github.com/google/uuid"
)

// Only DisplayName, GameURL, ProjectName are garanteed
func GetSettings(ctx context.Context, gid uuid.UUID) (*db.Game, error) {
	game := new(db.Game)
	if err := db.
		Select(game).
		Column("display_name", "game_url", "project_name").Where("id = ?", gid).
		Scan(ctx); errors.Is(err, sql.ErrNoRows) {
		return nil, errors.New("Not found")
	} else if err != nil {
		return nil, err
	}
	return game, nil
}

func SetSettings(ctx context.Context, gid uuid.UUID) error {
	return nil
}
