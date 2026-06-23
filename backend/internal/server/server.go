package server

import (
	"errors"
	"fame/internal/auth"
	"fame/internal/cache"
	"fame/internal/db"
	"log"
	"net/http"

	"github.com/bradfitz/gomemcache/memcache"
	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	echojwt "github.com/labstack/echo-jwt/v5"
	"github.com/labstack/echo/v5"
	"github.com/labstack/echo/v5/middleware"
	"github.com/pquerna/otp/totp"
)

var e *echo.Echo

type Email struct {
	Email string `query:"email"`
}

type OTP struct {
	Email string `json:"email"`
	Code  string `json:"code"`
}

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
			authn.GET("/otp", func(c *echo.Context) error {
				var email Email
				if err := c.Bind(&email); err != nil {
					return c.String(http.StatusBadRequest, "email is not provided")
				}

				key, _ := totp.Generate(totp.GenerateOpts{
					Issuer:      "Fame",
					AccountName: email.Email,
				})

				cache.Client.Set(&memcache.Item{
					Key:        email.Email,
					Value:      []byte(key.Secret()),
					Expiration: 5 * 60, // 5 mins
				})

				return c.String(http.StatusOK, key.URL())
			})

			authn.POST("/otp", func(c *echo.Context) error {
				var email OTP
				if err := c.Bind(&email); err != nil {
					return c.String(http.StatusBadRequest, "bad request")
				}

				secret, err := cache.Client.Get(email.Email)
				if err != nil {
					if errors.Is(err, memcache.ErrCacheMiss) {
						return c.String(http.StatusNotFound, "secret not found")
					}
					return c.String(http.StatusInternalServerError, err.Error())
				}

				if !totp.Validate(email.Code, string(secret.Value)) {
					return c.String(http.StatusOK, "wrong code")
				}

				db.CreateUser(c.Request().Context(), email.Email, string(secret.Value))

				err = auth.AuthorizeUser(c, uuid.NewString())
				if errors.Is(err, auth.AlreadyAuthorized) {
					return c.Redirect(http.StatusFound, "/api/get")
				}

				return c.String(http.StatusOK, "ok")
			})

			authn.GET("/passkey", putHandler)
			authn.POST("/passkey", putHandler)
		}

		protected := api.Group("")
		protected.Use(auth.SessionAuthMiddleware)
		{
			protected.GET("/me", getHandler)
			protected.GET("/logout", func(c *echo.Context) error {
				err := auth.Logout(c)
				if err != nil {
					return c.String(http.StatusInternalServerError, err.Error())
				}
				return c.String(http.StatusOK, "ok")
			})

			games := protected.Group("/games")
			games.POST("/new", func(c *echo.Context) error {
				gid, key := auth.Random()
				return c.JSON(http.StatusOK, map[string]any{
					"gid": gid,
					"key": key,
				})
			})
		}

		game := api.Group("/scores")
		game.Use(echojwt.WithConfig(echojwt.Config{
			KeyFunc: auth.GetKey,
		}))
		{
			game.GET("", func(c *echo.Context) error {
				log.Println("inside GET")
				t, err := echo.ContextGet[*jwt.Token](c, "user")
				if err != nil {
					return echo.ErrUnauthorized.Wrap(err)
				}
				sub, err := t.Claims.GetSubject()
				if err != nil {
					return echo.ErrUnauthorized.Wrap(err)
				}
				return c.String(http.StatusOK, sub)
			})
		}
	}
}

func Start() {
	if err := e.Start(":8080"); err != nil {
		e.Logger.Error("failed to start server", "error", err)
	}
}
