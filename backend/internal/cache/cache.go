package cache

import "github.com/bradfitz/gomemcache/memcache"

var Client *memcache.Client

func Create() {
	Client = memcache.New("localhost:11211")
}
