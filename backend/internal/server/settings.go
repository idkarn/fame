package server

import (
	"fame/internal/auth"
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

	key := auth.NewKeyFromID(id)

	return c.JSON(http.StatusOK, map[string]any{
		"displayName": g.DisplayName,
		"gameURL":     g.GameURL,
		"projectName": g.ProjectName,
		"token":       key,
	})
}

func updateSettings(c *echo.Context) error {
	type updateSettingsRequest struct {
		DisplayName *string `json:"displayName"`
		GameURL     *string `json:"gameURL"`
		ProjectName *string `json:"projectName"`
	}

	id := c.Param("id")
	gid, err := uuid.Parse(id)
	if err != nil {
		return c.String(http.StatusBadRequest, "wrong game id format")
	}

	var data updateSettingsRequest
	if err := c.Bind(&data); err != nil {
		return c.String(http.StatusBadRequest, "wrong body format")
	}

	if err := settings.SetSettings(c.Request().Context(), gid, data.DisplayName, data.GameURL, data.ProjectName); err != nil {
		return echo.ErrBadRequest.Wrap(err)
	}

	return c.String(http.StatusOK, http.StatusText(http.StatusOK))
}
