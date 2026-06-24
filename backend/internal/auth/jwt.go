package auth

import (
	"crypto/sha256"
	"encoding/hex"
	"io"

	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/hkdf"
)

var masterSecret = []byte("a-string-secret-at-least-256-bits-long")

func GetKeyFromJWT(t *jwt.Token) (any, error) {
	sub, err := t.Claims.GetSubject()
	if err != nil {
		return nil, err
	}

	kHash := hkdf.New(sha256.New, masterSecret, nil, []byte(sub))

	kBytes := make([]byte, 32)
	if _, err := io.ReadFull(kHash, kBytes); err != nil {
		return nil, err
	}

	kHex := hex.EncodeToString(kBytes)

	return []byte(kHex), nil
}

func NewKeyFromID(id string) string {
	secretReader := hkdf.New(sha256.New, masterSecret, nil, []byte(id))

	// Generate a 32-byte (256-bit) key suitable for HS256
	key := make([]byte, 32)
	if _, err := io.ReadFull(secretReader, key); err != nil {
		panic(err)
	}

	return hex.EncodeToString(key)
}
