package auth

import "errors"

var AlreadyAuthorized error = errors.New("Already authorized!")
var EmailNotFound error = errors.New("Email not found!")
