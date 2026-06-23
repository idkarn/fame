package memcachestore

import (
	"time"

	"github.com/bradfitz/gomemcache/memcache"
)

// MemcachedStore implements the scs.Store interface for Memcached
type MemcachedStore struct {
	client *memcache.Client
}

func NewMemcachedStore(client *memcache.Client) *MemcachedStore {
	return &MemcachedStore{client: client}
}

// Find retrieves the session data from Memcached
func (m *MemcachedStore) Find(token string) ([]byte, bool, error) {
	item, err := m.client.Get(token)
	if err == memcache.ErrCacheMiss {
		return nil, false, nil
	} else if err != nil {
		return nil, false, err
	}
	return item.Value, true, nil
}

// Commit writes or updates the session data with an expiration time
func (m *MemcachedStore) Commit(token string, b []byte, expiry time.Time) error {
	// Calculate the TTL in seconds relative to now
	ttl := int32(time.Until(expiry).Seconds())
	if ttl < 0 {
		ttl = 0
	}

	return m.client.Set(&memcache.Item{
		Key:        token,
		Value:      b,
		Expiration: ttl,
	})
}

// Delete removes the session token from Memcached
func (m *MemcachedStore) Delete(token string) error {
	err := m.client.Delete(token)
	if err == memcache.ErrCacheMiss {
		return nil // scs expects a no-op if key doesn't exist
	}
	return err
}
