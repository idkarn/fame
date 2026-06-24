package auth

import (
	"errors"
	"fame/internal/cache"
	"fame/internal/db"

	"github.com/bradfitz/gomemcache/memcache"
	"github.com/google/uuid"
	"github.com/labstack/echo/v5"
	"github.com/pquerna/otp"
	"github.com/pquerna/otp/totp"
)

func CreateOTP(email string) *otp.Key {
	key, _ := totp.Generate(totp.GenerateOpts{
		Issuer:      "Fame",
		AccountName: email,
	})

	cache.Client.Set(&memcache.Item{
		Key:        email,
		Value:      []byte(key.Secret()),
		Expiration: 5 * 60, // 5 mins
	})

	return key
}

// todo: refactor
func VerifyOTP(c *echo.Context, email, code string) (bool, error) {
	secret, err := cache.Client.Get(email)
	if err != nil {
		if errors.Is(err, memcache.ErrCacheMiss) {
			return false, EmailNotFound
		}
		return false, err
	}

	if !totp.Validate(code, string(secret.Value)) {
		return false, nil
	}

	if err := AuthorizeUser(c, uuid.NewString()); errors.Is(err, AlreadyAuthorized) {
		return false, err
	}

	db.CreateUser(c.Request().Context(), email, string(secret.Value))

	return true, nil
}
