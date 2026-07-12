package server

import (
	"fame/internal/settings"
	"net/http"

	"github.com/google/uuid"
	"github.com/labstack/echo/v5"
)

func getSettings(c *echo.Context) error {
	id := c.Param("id")
	gid, err := uuid.Parse(id)
	if err != nil {
		return c.String(http.StatusBadRequest, "wrong game id format")
	}

	g, err := settings.GetSettings(c.Request().Context(), gid)
	if err != nil {
		return echo.ErrBadRequest.Wrap(err)
	}

	return c.JSON(http.StatusOK, map[string]any{
		"displayName": g.DisplayName,
		"gameURL":     g.GameURL,
		"projectName": g.ProjectName,
	})
}

func updateSettings(c *echo.Context) error {
	id := c.Param("id")
	gid, err := uuid.Parse(id)
	if err != nil {
		return c.String(http.StatusBadRequest, "wrong game id format")
	}

	if err := settings.SetSettings(c.Request().Context(), gid); err != nil {
		return echo.ErrBadRequest.Wrap(err)
	}

	return c.String(http.StatusOK, http.StatusText(http.StatusOK))
}
