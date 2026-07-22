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

		dashboard := api.Group("", auth.SessionAuthMiddleware)
		{
			dashboard.GET("/me", getHandler)
			dashboard.GET("/logout", Logout)

			games := dashboard.Group("/games")
			{
				games.GET("/", listGames)
				games.GET("/:id", getGame)
				games.POST("/", newGame)
				games.DELETE("/:id", deleteGame)
			}

			boards := dashboard.Group("/boards")
			{
				boards.GET("/:id", getBoard)
				boards.POST("/", newBoard)
				boards.PATCH("/:id", updateBoard)
				boards.DELETE("/:id", deleteBoard)

				records := boards.Group("/:id/records")
				{
					records.GET("/:pid", findRecord)
					records.DELETE("/:pid", deleteRecord)
				}

				analytics := boards.Group("/:id/analytics")
				{
					analytics.GET("/top", getRanking)
				}
			}

			settings := dashboard.Group("/settings")
			{
				settings.GET("/:id", getSettings)
				settings.PATCH("/:id", updateSettings)
			}
		}

		scores := api.Group("/scores", echojwt.WithConfig(echojwt.Config{
			KeyFunc: auth.GetKeyFromJWT,
		}))
		{
			scores.POST("/", submit)
		}
	}
}

func Start() {
	if err := e.Start(":8080"); err != nil {
		e.Logger.Error("failed to start server", "error", err)
	}
}
