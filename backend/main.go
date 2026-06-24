package main

import (
	"fame/internal/auth"
	"fame/internal/cache"
	"fame/internal/db"
	"fame/internal/server"
	"fame/pkg/memcachestore"
)

func init() {
	cache.Create()

	db.Init()

	auth.Init(memcachestore.NewMemcachedStore(cache.Client))

	server.Setup()
}

func main() {
	defer cache.Client.Close()
	defer db.Close()

	server.Start()
}
