package server

import (
	"net/http"

	"github.com/golang-jwt/jwt/v5"
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
	return c.String(http.StatusOK, gid)
}
