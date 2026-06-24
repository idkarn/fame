package server

import (
	"fame/internal/auth"
	"net/http"

	"github.com/google/uuid"
	"github.com/labstack/echo/v5"
)

func NewGame(c *echo.Context) error {
	gid := uuid.NewString()
	key := auth.NewKeyFromID(gid)
	return c.JSON(http.StatusOK, map[string]any{
		"gid": gid,
		"key": key,
	})
}
