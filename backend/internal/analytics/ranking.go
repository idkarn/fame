package analytics

import (
	"context"
	"fame/internal/db"

	"github.com/google/uuid"
	"github.com/uptrace/bun"
)

func must(v any, e error) any {
	if e != nil {
		panic(e)
	}
	return v
}

func GetRanking(ctx context.Context, bid uuid.UUID, limit int) ([]*db.Record, error) {
	records := make([]*db.Record, 0, limit)

	if err := ng.
		NewSelect().
		Model(&records).
		Column("player_id", "player_name", "score", "submitted_at").
		Where("board_id = ?", bid).
		OrderBy("score", bun.OrderDesc).
		ModelTableExpr("? AS ?", bun.Ident("local.records"), bun.Ident("r")).
		Scan(ctx); err != nil {
		return records, err
	}

	return records, nil
}
