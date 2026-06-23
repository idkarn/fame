package main

import (
	"crypto/rand"
	"crypto/sha256"
	"fame/internal/auth"
	"fame/internal/cache"
	"fame/internal/db"
	"fame/internal/server"
	"fame/pkg/memcachestore"
	"fmt"
	"io"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"golang.org/x/crypto/hkdf"
)

func init() {
	cache.Create()

	db.Init()

	auth.Init(memcachestore.NewMemcachedStore(cache.Client))

	server.Setup()
}

func gen(master []byte) string {
	gid := uuid.NewString()

	rand.Read(master)

	secretReader := hkdf.New(sha256.New, master, nil, []byte(gid))

	// Generate a 32-byte (256-bit) key suitable for HS256
	key := make([]byte, 32)
	if _, err := io.ReadFull(secretReader, key); err != nil {
		panic(err)
	}

	tok, err := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"sub": gid,
		"exp": time.Now().Add(time.Second * 15).Unix(),
		"iat": time.Now().Unix(),
	}).SignedString(key)

	fmt.Println("master", master)
	fmt.Println("gid", gid)
	fmt.Println("tok", tok)
	fmt.Println("err", err)

	return tok
}

func verify(master []byte, tok string) {
	parser := jwt.NewParser()
	t, _, err := parser.ParseUnverified(tok, jwt.MapClaims{})
	if err != nil {
		panic(err)
	}

	sub, err := t.Claims.GetSubject()
	if err != nil {
		panic(err)
	}
	secretReader := hkdf.New(sha256.New, master, nil, []byte(sub))

	key := make([]byte, 32)
	if _, err := io.ReadFull(secretReader, key); err != nil {
		panic(err)
	}

	t2, err := jwt.Parse(tok, func(t *jwt.Token) (any, error) {
		return key, nil
	})
	if err != nil {
		panic(err)
	}

	// If successful, you can safely access the verified claims
	if claims, ok := t2.Claims.(jwt.MapClaims); ok && t2.Valid {
		fmt.Println("Token is valid!")
		fmt.Printf("Subject: %v\n", claims["sub"])
	}
}

func main() {
	defer cache.Client.Close()
	defer db.Close()

	// 1. Initialize the session manager

	// ctx := context.TODO()

	// Open database connection
	// sqldb, err := sql.Open(sql., "file::memory:?cache=shared")
	// if err != nil {
	// 	panic(err)
	// }
	// defer sqldb.Close()

	// Create Bun database instance

	// Create table

	// Insert user
	// user := &User{Name: "John Doe", Email: "john@example.com"}
	// _, err = db.NewInsert().Model(user).Exec(ctx)
	// if err != nil {
	// 	panic(err)
	// }

	// Select user
	// var selectedUser User
	// err = db.NewSelect().Model(&selectedUser).Where("email = ?", "john@example.com").Scan(ctx)
	// if err != nil {
	// 	panic(err)
	// }

	// fmt.Printf("User: %+v\n", selectedUser)

	// 2. Add SCS LoadAndSave middleware to Echo
	server.Start()
}
