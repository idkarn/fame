package server

import (
	"database/sql"
	"errors"
	"fame/internal/analytics"
	"net/http"
	"time"

	"github.com/google/uuid"
	"github.com/labstack/echo/v5"
)

func getDailyPlayers(c *echo.Context) error {
	id := c.Param("id")
	bid, err := uuid.Parse(id)
	if err != nil {
		return c.String(http.StatusBadRequest, "wrong board id format")
	}

	start, end := time.Now().AddDate(0, -3, 0), time.Now()

	rows, err := analytics.GetDailyPlayers(c.Request().Context(), bid, start, end)
	if errors.Is(err, sql.ErrNoRows) {
		return c.JSON(http.StatusOK, []any{})
	} else if err != nil {
		return echo.ErrInternalServerError.Wrap(err)
	}

	return c.JSON(http.StatusOK, rows)
}
