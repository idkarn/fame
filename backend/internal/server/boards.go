package server

import (
	"database/sql"
	"errors"
	"fame/internal/boards"
	"net/http"

	"github.com/google/uuid"
	"github.com/labstack/echo/v5"
)

func listBoards(c *echo.Context) error {
	return c.JSON(http.StatusOK, map[string]any{})
}

func getBoard(c *echo.Context) error {
	id := c.Param("id")
	bid, err := uuid.Parse(id)
	if err != nil {
		return c.String(http.StatusBadRequest, "wrong board id format")
	}

	b, err := boards.GetBoard(c.Request().Context(), bid)
	if errors.Is(err, sql.ErrNoRows) {
		return c.String(http.StatusNotFound, "not found")
	} else if err != nil {
		return echo.ErrBadRequest.Wrap(err)
	}

	return c.JSON(http.StatusOK, b)
}

func newBoard(c *echo.Context) error {
	type newBoardRequest struct {
		Name   string    `json:"name"`
		GameID uuid.UUID `json:"gameId"`
	}

	var data newBoardRequest
	if err := c.Bind(&data); err != nil {
		return c.String(http.StatusBadRequest, "wrong body format")
	}

	if data.GameID == uuid.Nil {
		return c.String(http.StatusBadRequest, "gameId must be provided")
	} else if data.Name == "" {
		return c.String(http.StatusBadRequest, "name must be provided")
	}

	b, err := boards.NewBoard(c.Request().Context(), data.GameID, data.Name)
	if err != nil {
		return echo.ErrBadRequest.Wrap(err)
	}

	return c.JSON(http.StatusCreated, b)
}

func updateBoard(c *echo.Context) error {
	type updateBoardRequest struct {
		Name *string `json:"name"`
	}

	id := c.Param("id")
	bid, err := uuid.Parse(id)
	if err != nil {
		return c.String(http.StatusBadRequest, "wrong board id format")
	}

	var data updateBoardRequest
	if err := c.Bind(&data); err != nil {
		return c.String(http.StatusBadRequest, "wrong body format")
	}

	if err := boards.UpdateBoard(c.Request().Context(), bid, data.Name); err != nil {
		return echo.ErrBadRequest.Wrap(err)
	}

	return c.String(http.StatusOK, http.StatusText(http.StatusOK))
}

func deleteBoard(c *echo.Context) error {
	id := c.Param("id")
	bid, err := uuid.Parse(id)
	if err != nil {
		return c.String(http.StatusBadRequest, "wrong board id format")
	}

	if err := boards.DeleteBoard(c.Request().Context(), bid); err != nil {
		return echo.ErrBadRequest.Wrap(err)
	}

	return c.String(http.StatusOK, http.StatusText(http.StatusOK))

}
