package users

import (
	"context"
	"fame/internal/db"

	"github.com/google/uuid"
)

func CreateUser(ctx context.Context, email, secret string) (uuid.UUID, error) {
	id := uuid.New()
	_, err := db.Insert(&db.User{
		ID:     id,
		Email:  email,
		Secret: secret,
	}).Exec(ctx)
	if err != nil {
		return id, err
	}
	return id, nil
}

func FindUser(ctx context.Context, email string) (*db.User, error) {
	user := new(db.User)
	if err := db.Select(user).Where("email = ?", email).Scan(ctx); err != nil {
		return nil, err
	}
	return user, nil
}
