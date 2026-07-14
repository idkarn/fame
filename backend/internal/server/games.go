package server

import (
	"database/sql"
	"errors"
	"fame/internal/games"
	"net/http"

	"github.com/google/uuid"
	"github.com/labstack/echo/v5"
)

func newGame(c *echo.Context) error {
	type newGameDTO struct {
		ProjectName string `json:"projectName"`
	}

	var data newGameDTO
	if err := c.Bind(&data); err != nil {
		return c.String(http.StatusBadRequest, "wrong request format")
	}

	if data.ProjectName == "" {
		return c.String(http.StatusBadRequest, "projectName must be provided")
	}

	uid, err := uuid.Parse(c.Get("user_id").(string))
	if err != nil {
		return echo.ErrBadRequest.Wrap(err)
	}

	// key := auth.NewKeyFromID(gid)
	game, err := games.NewGame(c.Request().Context(), uid, data.ProjectName)
	if err != nil {
		return echo.ErrBadRequest.Wrap(err)
	}

	return c.JSON(http.StatusOK, game)
}

func listGames(c *echo.Context) error {
	uid, err := uuid.Parse(c.Get("user_id").(string))
	if err != nil {
		return echo.ErrBadRequest.Wrap(err)
	}

	games, err := games.GetAllGames(c.Request().Context(), uid)
	if err != nil {
		return echo.ErrBadRequest.Wrap(err)
	}

	if games == nil {
		return c.JSON(http.StatusOK, []any{})
	}
	return c.JSON(http.StatusOK, games)
}

func getGame(c *echo.Context) error {
	// todo: add flag for boards details

	id := c.Param("id")
	gid, err := uuid.Parse(id)
	if err != nil {
		return c.String(http.StatusBadRequest, "wrong game id format")
	}

	game, err := games.GetGame(c.Request().Context(), gid)
	if errors.Is(err, sql.ErrNoRows) {
		return c.String(http.StatusNotFound, "not found")
	} else if err != nil {
		return echo.ErrBadRequest.Wrap(err)
	}

	return c.JSON(http.StatusOK, game)
}

func deleteGame(c *echo.Context) error {
	id := c.Param("id")
	gid, err := uuid.Parse(id)
	if err != nil {
		return c.String(http.StatusBadRequest, "wrong game id format")
	}

	if err := games.DeleteGame(c.Request().Context(), gid); err != nil {
		return echo.ErrBadRequest.Wrap(err)
	}

	return c.String(http.StatusOK, http.StatusText(http.StatusOK))
}
