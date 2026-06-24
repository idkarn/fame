package auth

import (
	"github.com/labstack/echo/v5"
)

func SessionAuthMiddleware(next echo.HandlerFunc) echo.HandlerFunc {
	return func(c *echo.Context) error {
		uid := sm.GetString(c.Request().Context(), "user_id")
		if uid == "" {
			return echo.ErrUnauthorized
		}

		c.Set("user_id", uid)

		return next(c)
	}
}

func AuthorizeUser(c *echo.Context, id string) error {
	sm.Put(c.Request().Context(), "user_id", id)
	return nil
}
