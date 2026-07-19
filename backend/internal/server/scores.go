package server

import (
	"fame/internal/db"
	"fame/internal/scores"
	"net/http"
	"slices"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"github.com/labstack/echo/v5"
)

func Submit(c *echo.Context) error {
	t, err := echo.ContextGet[*jwt.Token](c, "user")
	if err != nil {
		return echo.ErrUnauthorized.Wrap(err)
	}
	gid, err := t.Claims.GetSubject()
	if err != nil {
		return echo.ErrUnauthorized.Wrap(err)
	}

	type submitRequest struct {
		BoardID string `json:"boardId"`
		ID      string `json:"id"`
		Name    string `json:"name"`
		Score   int    `json:"score"`
	}

	var data submitRequest
	if err := c.Bind(&data); err != nil {
		return c.String(http.StatusBadRequest, "wrong body format")
	}

	bid, err := uuid.Parse(data.BoardID)
	if err != nil {
		return c.String(http.StatusBadRequest, "wrong game id format")
	}

	var boards []db.Board
	if err := db.Select(&boards).Where("game_id = ?", gid).Column("id").Scan(c.Request().Context()); err != nil {
		return echo.ErrInternalServerError.Wrap(err)
	}

	if !slices.ContainsFunc(boards, func(b db.Board) bool {
		return b.ID == bid
	}) {
		return c.String(http.StatusForbidden, "wrong board")
	}

	r, err := scores.NewRecord(c.Request().Context(), bid, data.ID, data.Name, data.Score)
	if err != nil {
		return echo.ErrInternalServerError.Wrap(err)
	}

	return c.JSON(http.StatusOK, map[string]any{
		"submittedAt": r.SubmittedAt,
	})
}
