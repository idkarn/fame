package db

import (
	"context"

	"github.com/google/uuid"
)

func CreateUser(ctx context.Context, email, secret string) (uuid.UUID, error) {
	id := uuid.New()
	_, err := db.NewInsert().Model(&User{
		ID:     id,
		Email:  email,
		Secret: secret,
	}).Exec(ctx)
	if err != nil {
		return id, err
	}
	return id, nil
}

func FindUser(ctx context.Context, email string) (*User, error) {
	user := new(User)
	if err := db.NewSelect().Model(user).Where("email = ?", email).Scan(ctx); err != nil {
		return nil, err
	}
	return user, nil
}
