package names

import (
	"crypto/sha256"
	_ "embed"
	"encoding/binary"
	"fmt"
	"strings"
)

//go:embed adjectives.txt
var adjData string
var adjectives []string

//go:embed nouns.txt
var nounsData string
var nouns []string

func PrepareWordlists() {
	adjectives = strings.Split(strings.TrimSpace(adjData), "\n")
	nouns = strings.Split(strings.TrimSpace(nounsData), "\n")
}

// Generate deterministically derives a nickname from any input string
func Generate(id string) string {
	h := sha256.Sum256([]byte(id))

	// Use non-overlapping 4-byte chunks of the digest for independence
	adjIdx := binary.BigEndian.Uint32(h[0:4])
	nounIdx := binary.BigEndian.Uint32(h[4:8])
	numSeed := binary.BigEndian.Uint32(h[8:12])

	adj := adjectives[adjIdx%uint32(len(adjectives))]
	noun := nouns[nounIdx%uint32(len(nouns))]
	num := numSeed % 10000 // 4-digit suffix, 0000-9999

	return fmt.Sprintf("%s-%s-%04d", adj, noun, num)
}
