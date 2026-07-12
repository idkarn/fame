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

func SetSettings(ctx context.Context, gid uuid.UUID, displayName, gameURL, projectName *string) error {
	q := db.Update((*db.Game)(nil))

	if displayName != nil {
		q.Set("display_name = ?", displayName)
	}
	if gameURL != nil {
		q.Set("game_url = ?", gameURL)
	}
	if projectName != nil {
		q.Set("project_name = ?", projectName)
	}

	if _, err := q.
		Where("id = ?", gid).
		Exec(ctx); err != nil {
		return err
	}

	return nil
}
