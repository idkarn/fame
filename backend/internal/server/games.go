package server

import (
	"fame/internal/auth"
	"net/http"

	"github.com/google/uuid"
	"github.com/labstack/echo/v5"
)

func newGame(c *echo.Context) error {
	gid := uuid.NewString()
	key := auth.NewKeyFromID(gid)
	return c.JSON(http.StatusOK, map[string]any{
		"gid": gid,
		"key": key,
	})
}

func listGames(c *echo.Context) error {
	return c.JSON(http.StatusOK, map[string]any{})
}

func getGame(c *echo.Context) error {
	return c.JSON(http.StatusOK, map[string]any{})
}

func updateGame(c *echo.Context) error {
	return c.JSON(http.StatusOK, map[string]any{})
}

func deleteGame(c *echo.Context) error {
	return c.JSON(http.StatusOK, map[string]any{})
}
