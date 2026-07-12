package auth

import (
	"database/sql"
	"errors"
	"fame/internal/cache"
	"fame/internal/users"

	"github.com/bradfitz/gomemcache/memcache"
	"github.com/google/uuid"
	"github.com/labstack/echo/v5"
	"github.com/pquerna/otp"
	"github.com/pquerna/otp/totp"
)

var EmailAlreadyExists = errors.New("this email already exists!")

// todo: refactor
func CreateOTP(c *echo.Context, email string) (*otp.Key, error) {
	if u, err := users.FindUser(c.Request().Context(), email); u != nil {
		return nil, EmailAlreadyExists
	} else if !errors.Is(err, sql.ErrNoRows) {
		return nil, err
	}

	key, _ := totp.Generate(totp.GenerateOpts{
		Issuer:      "Fame",
		AccountName: email,
	})

	cache.Client.Set(&memcache.Item{
		Key:        email,
		Value:      []byte(key.Secret()),
		Expiration: 5 * 60, // 5 mins
	})

	return key, nil
}

// todo: refactor
func VerifyOTP(c *echo.Context, email, code string) (bool, error) {
	var sec string

	secretItem, err := cache.Client.Get(email)
	if err != nil {
		if errors.Is(err, memcache.ErrCacheMiss) {
			u, err := users.FindUser(c.Request().Context(), email)
			if errors.Is(err, sql.ErrNoRows) {
				return false, EmailNotFound
			} else if err != nil {
				return false, err
			}
			sec = u.Secret
		} else {
			return false, err
		}
	} else {
		sec = string(secretItem.Value)
	}

	if !totp.Validate(code, sec) {
		return false, nil
	}

	if err := AuthorizeUser(c, uuid.NewString()); errors.Is(err, AlreadyAuthorized) {
		return false, err
	}

	users.CreateUser(c.Request().Context(), email, sec)

	return true, nil
}
