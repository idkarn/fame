package db

import (
	"context"
	"database/sql"

	"github.com/uptrace/bun"
	"github.com/uptrace/bun/dialect/sqlitedialect"
	_ "turso.tech/database/tursogo"
)

var sqldb *sql.DB
var db *bun.DB

func Init() {
	sqldb, _ = sql.Open("turso", "app.db")
	db = bun.NewDB(sqldb, sqlitedialect.New())

	ctx := context.TODO()

	prepare(ctx)
}

func prepare(ctx context.Context) {
	_, err := db.NewCreateTable().Model((*User)(nil)).IfNotExists().Exec(ctx)
	if err != nil {
		panic(err)
	}
}

func Close() {
	sqldb.Close()
}
