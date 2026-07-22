package db

import "github.com/uptrace/bun"

// todo: come up with proper approach than this
func NewSelect() *bun.SelectQuery {
	return db.NewSelect()
}
