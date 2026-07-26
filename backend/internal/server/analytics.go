package server

import (
	"database/sql"
	"errors"
	"fame/internal/analytics"
	"log"
	"net/http"

	"github.com/google/uuid"
	"github.com/labstack/echo/v5"
)

func getRanking(c *echo.Context) error {
	id := c.Param("id")
	bid, err := uuid.Parse(id)
	if err != nil {
		return c.String(http.StatusBadRequest, "wrong board id format")
	}

	rows, err := analytics.GetRanking(c.Request().Context(), bid, 20, true)
	if errors.Is(err, sql.ErrNoRows) {
		log.Println(rows)
		return c.JSON(http.StatusOK, []any{})
	} else if err != nil {
		return echo.ErrInternalServerError.Wrap(err)
	}

	return c.JSON(http.StatusOK, rows)
}
