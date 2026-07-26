package main

import (
	"fame/internal/analytics"
	"fame/internal/auth"
	"fame/internal/cache"
	"fame/internal/db"
	"fame/internal/names"
	"fame/internal/server"
	"fame/pkg/memcachestore"
)

func init() {
	cache.Create()

	db.Init()
	analytics.Init()

	auth.Init(memcachestore.NewMemcachedStore(cache.Client))

	names.PrepareWordlists()

	server.Setup()
}

func main() {
	defer cache.Client.Close()
	defer db.Close()
	defer analytics.Close()

	server.Start()
}
