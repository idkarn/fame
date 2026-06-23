package auth

import (
	"fame/pkg/memcachestore"
	"net/http"
	"time"

	"github.com/alexedwards/scs/v2"
	"github.com/labstack/echo/v5"
)

var sm *scs.SessionManager

func Init(store *memcachestore.MemcachedStore) {
	sm = scs.New()
	// sessionManager.Store = memcachestore.NewMemcachedStore(storeClient)
	sm.Store = store
	sm.Lifetime = 24 * time.Hour
	sm.Cookie.HttpOnly = true
	sm.Cookie.Secure = true // Set to false in development if not using HTTPS
}

func SessionMiddleware(next echo.HandlerFunc) echo.HandlerFunc {
	return func(c *echo.Context) error {
		var err error

		sm.LoadAndSave(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			c.SetRequest(r)
			c.SetResponse(echo.NewResponse(w, nil))
			err = next(c)
		})).ServeHTTP(c.Response(), c.Request())

		return err
	}
}

func Logout(c *echo.Context) error {
	return sm.Destroy(c.Request().Context())
}
