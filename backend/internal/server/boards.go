package server

import (
	"net/http"

	"github.com/labstack/echo/v5"
)

func listBoards(c *echo.Context) error {
	return c.JSON(http.StatusOK, map[string]any{})
}

func getBoard(c *echo.Context) error {
	return c.JSON(http.StatusOK, map[string]any{})
}

func newBoard(c *echo.Context) error {
	return c.JSON(http.StatusOK, map[string]any{})
}

func updateBoard(c *echo.Context) error {
	return c.JSON(http.StatusOK, map[string]any{})
}

func deleteBoard(c *echo.Context) error {
	return c.JSON(http.StatusOK, map[string]any{})
}
