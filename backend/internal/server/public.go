package server

import (
	"database/sql"
	"errors"
	"fame/internal/analytics"
	"fame/internal/games"
	"net/http"

	"github.com/google/uuid"
	"github.com/labstack/echo/v5"
)

// todo: rebuild this - i dont like this approach
func getPublicGame(c *echo.Context) error {
	id := c.Param("id")
	gid, err := uuid.Parse(id)
	if err != nil {
		return c.String(http.StatusBadRequest, "bad game id")
	}

	game, err := games.GetGame(c.Request().Context(), gid)
	if errors.Is(err, sql.ErrNoRows) {
		return c.String(http.StatusNotFound, "not found")
	} else if err != nil {
		return echo.ErrBadRequest.Wrap(err)
	}

	return c.JSON(http.StatusOK, map[string]any{
		"id":          game.ID,
		"displayName": game.DisplayName,
		"gameUrl":     game.GameURL,
		"boards":      game.Boards,
	})
}

func getPublicBoard(c *echo.Context) error {
	id := c.Param("id")
	bid, err := uuid.Parse(id)
	if err != nil {
		return c.String(http.StatusBadRequest, "bad board id")
	}

	rows, err := analytics.GetRanking(c.Request().Context(), bid, 20, false)
	if errors.Is(err, sql.ErrNoRows) {
		return c.String(http.StatusNotFound, "not found")
	} else if err != nil {
		return echo.ErrBadRequest.Wrap(err)
	}

	// build response with only public fields
	res := make([]map[string]any, len(rows))
	for i, row := range rows {
		res[i] = map[string]any{
			"playerName": row.PlayerDisplayName,
			"score":      row.Score,
		}
	}

	return c.JSON(http.StatusOK, res)
}
