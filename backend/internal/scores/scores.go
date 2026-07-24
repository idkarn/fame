package scores

import (
	"context"
	"fame/internal/db"

	"github.com/google/uuid"
)

func NewRecord(ctx context.Context, bid uuid.UUID, pid, playerName string, value int) (*db.Record, error) {
	r := &db.Record{
		BoardID:           &bid,
		PlayerID:          pid,
		PlayerDisplayName: playerName,
		Score:             int64(value),
	}

	if _, err := db.
		Insert(r).
		On("CONFLICT (board_id, player_id) DO UPDATE").
		Set("score = EXCLUDED.score").
		Set("submitted_at = datetime('now')").
		Where("records.score < EXCLUDED.score").
		Exec(ctx); err != nil {
		return nil, err
	}

	return r, nil
}

func GetRecord(ctx context.Context, bid uuid.UUID, pid string) (*db.Record, error) {
	r := &db.Record{
		BoardID:  &bid,
		PlayerID: pid,
	}

	ranq := db.
		Select((*db.Record)(nil)).
		Column("*").
		ColumnExpr("ROW_NUMBER() OVER (ORDER BY score DESC) AS rank")

	if err := db.
		NewSelect().
		TableExpr("(?) AS p", ranq).
		Where("p.board_id = ? AND p.player_id = ?", bid, pid).
		// WherePK().
		Scan(ctx, r); err != nil {
		return nil, err
	}

	return r, nil
}

func DeleteRecord(ctx context.Context, bid uuid.UUID, pid string) error {
	r := &db.Record{
		BoardID:  &bid,
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
