package scores

import (
	"context"
	"fame/internal/db"

	"github.com/google/uuid"
)

func NewRecord(ctx context.Context, bid uuid.UUID, pid, playerName string, value int) (*db.Record, error) {
	r := &db.Record{
		BoardID:           bid,
		PlayerID:          pid,
		PlayerDisplayName: playerName,
		Score:             int64(value),
	}

	if _, err := db.
		Insert(r).
		Exec(ctx); err != nil {
		return nil, err
	}

	return r, nil
}
