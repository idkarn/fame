package analytics

import (
	"context"
	"time"

	"github.com/google/uuid"
	"github.com/uptrace/bun/schema"
)

type DailyMetric struct {
	Date  time.Time `bun:"date" json:"date"`
	Total int64     `bun:"total" json:"total"`
}

func GetDailyPlayers(ctx context.Context, bid uuid.UUID, start, end time.Time) ([]DailyMetric, error) {
	var r []DailyMetric

	if err := ng.
		NewSelect().
		ModelTableExpr("sqlite_scan(?, ?) AS ?", "app.db", "records", "r").
		ColumnExpr("DATE_TRUNC('day', submitted_at) AS date").
		ColumnExpr("COUNT(DISTINCT player_id) AS total").
		Where("board_id = ?", bid).
		Where("submitted_at >= ?", start).
		Where("submitted_at <= ?", end).
		GroupExpr("date").
		OrderBy("date", schema.OrderAsc).
		Scan(ctx, &r); err != nil {
		return nil, err
	}

	return r, nil
}
