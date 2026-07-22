package analytics

import (
	"context"
	"database/sql"

	_ "github.com/duckdb/duckdb-go/v2"
	"github.com/uptrace/bun"
	"github.com/uptrace/bun/dialect/sqlitedialect"
	"github.com/uptrace/bun/extra/bundebug"
)

var ng *bun.DB

func Init() error {
	conn, err := sql.Open("duckdb", "")
	if err != nil {
		panic(err)
	}

	ng = bun.NewDB(conn, sqlitedialect.New())

	ng.AddQueryHook(bundebug.NewQueryHook(bundebug.WithVerbose(true)))

	setupQuery := `
		INSTALL sqlite;
		LOAD sqlite;
		ATTACH 'app.db' AS local (TYPE SQLITE);
	`
	if _, err = ng.NewRaw(setupQuery).Exec(context.TODO()); err != nil {
		panic(err)
	}

	return nil
}

func Close() error {
	return ng.Close()
}
