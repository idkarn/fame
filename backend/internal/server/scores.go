package server

import (
	"database/sql"
	"errors"
	"fame/internal/db"
	"fame/internal/scores"
	"net/http"
	"slices"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"github.com/labstack/echo/v5"
)

func submit(c *echo.Context) error {
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

func findRecord(c *echo.Context) error {
	id := c.Param("id")
	bid, err := uuid.Parse(id)
	if err != nil {
		return c.String(http.StatusBadRequest, "wrong board id format")
	}

	pid := c.Param("pid")

	r, err := scores.GetRecord(c.Request().Context(), bid, pid)
	if errors.Is(err, sql.ErrNoRows) {
		return c.String(http.StatusNotFound, "record not found")
	} else if err != nil {
		return echo.ErrBadRequest.Wrap(err)
	}

	return c.JSON(http.StatusOK, r)
}

func deleteRecord(c *echo.Context) error {
	id := c.Param("id")
	bid, err := uuid.Parse(id)
	if err != nil {
		return c.String(http.StatusBadRequest, "wrong board id format")
	}

	pid := c.Param("pid")

	if err = scores.DeleteRecord(c.Request().Context(), bid, pid); errors.Is(err, sql.ErrNoRows) {
		return c.String(http.StatusNotFound, "record not found")
	} else if err != nil {
		return echo.ErrBadRequest.Wrap(err)
	}

	return c.String(http.StatusOK, http.StatusText(http.StatusOK))
}
