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

func GetRecord(ctx context.Context, bid uuid.UUID, pid string) (*db.Record, error) {
	r := &db.Record{
		BoardID:  bid,
		PlayerID: pid,
	}

	if err := db.
		Select(r).
		WherePK().
		Scan(ctx); err != nil {
		return nil, err
	}

	return r, nil
}

func DeleteRecord(ctx context.Context, bid uuid.UUID, pid string) error {
	r := &db.Record{
		BoardID:  bid,
		PlayerID: pid,
	}

	if _, err := db.
		Delete(r).
		WherePK().
		Exec(ctx); err != nil {
		return err
	}

	return nil
}
