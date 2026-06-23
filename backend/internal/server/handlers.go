package server

import (
	"net/http"

	"github.com/labstack/echo/v5"
)

func putHandler(c *echo.Context) error {
	c.Request().Header.Get("Authorization")
	return c.String(http.StatusOK, "put")
}

func getHandler(c *echo.Context) error {
	username := c.Get("user_id").(string)
	return c.String(http.StatusOK, "Hello, "+username)
}
