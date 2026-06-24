package server

import (
	"fame/internal/auth"

	echojwt "github.com/labstack/echo-jwt/v5"
	"github.com/labstack/echo/v5"
	"github.com/labstack/echo/v5/middleware"
)

var e *echo.Echo

func Setup() {
	e = echo.New()

	e.Use(middleware.RequestLogger())
	e.Use(middleware.Recover())

	e.Use(auth.SessionMiddleware)

	api := e.Group("/api")
	{
		authn := api.Group("/auth")
		{
			// todo: merge together
			authn.GET("/otp", GetOTP)
			authn.POST("/otp", PostOTP)

			// TODO: implement passkey auth
			// authn.GET("/passkey", putHandler)
			// authn.POST("/passkey", putHandler)
		}

		protected := api.Group("")
		protected.Use(auth.SessionAuthMiddleware)
		{
			protected.GET("/me", getHandler)
			protected.GET("/logout", Logout)

			games := protected.Group("/games")
			games.POST("/new", NewGame)
		}

		scores := api.Group("/scores")
		scores.Use(echojwt.WithConfig(echojwt.Config{
			KeyFunc: auth.GetKeyFromJWT,
		}))
		{
			scores.POST("/submit", Submit)
		}
	}
}

func Start() {
	if err := e.Start(":8080"); err != nil {
		e.Logger.Error("failed to start server", "error", err)
	}
}
