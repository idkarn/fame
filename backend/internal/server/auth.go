package server

import (
	"errors"
	"fame/internal/auth"
	"net/http"

	"github.com/labstack/echo/v5"
)

func putHandler(c *echo.Context) error {
	return c.String(http.StatusOK, "put")
}

func getHandler(c *echo.Context) error {
	username := c.Get("user_id").(string)
	return c.String(http.StatusOK, "Hello, "+username)
}

func GetOTP(c *echo.Context) error {
	type Email struct {
		Email string `query:"email"`
	}

	var email Email
	if err := c.Bind(&email); err != nil {
		return c.String(http.StatusBadRequest, "wrong request format")
	}

	// todo: replace with validator
	if email.Email == "" {
		return c.String(http.StatusBadRequest, "email is not provided")
	}

	key, err := auth.CreateOTP(c, email.Email)
	if err != nil {
		return echo.ErrBadRequest.Wrap(err)
	}

	return c.String(http.StatusOK, key.URL())
}

func PostOTP(c *echo.Context) error {
	type OTP struct {
		Email string `json:"email"`
		Code  string `json:"code"`
	}

	var email OTP
	if err := c.Bind(&email); err != nil {
		return c.String(http.StatusBadRequest, "bad request")
	}

	if ok, err := auth.VerifyOTP(c, email.Email, email.Code); errors.Is(err, auth.AlreadyAuthorized) {
		return c.Redirect(http.StatusFound, "/api/me")
	} else if err != nil {
		return echo.ErrBadRequest.Wrap(err)
	} else if !ok {
		return c.String(http.StatusUnauthorized, "wrong code")
	}

	return c.String(http.StatusOK, "ok")
}

func Logout(c *echo.Context) error {
	err := auth.Logout(c)
	if err != nil {
		return echo.ErrInternalServerError.Wrap(err)
	}
	return c.String(http.StatusOK, "ok")
}
