package app

import (
	"fmt"

	log "github.com/sirupsen/logrus"

	"github.com/gin-gonic/gin"
)

type tokenContainerData struct {
	IdToken string `json:"id_token" binding:"required"`
}

type sessionContainerData struct {
	Session []byte `json:"session" binding:"required"`
}

func handleSignIn(c *gin.Context) {
	// get app data from the POST body
	var tokenContainer tokenContainerData
	if err := c.ShouldBindJSON(&tokenContainer); err != nil {
		toBadRequest(c, err)
		return
	}

	// parse token
	parsedToken, err := parseAndValidateIdToken(tokenContainer.IdToken)
	if err != nil {
		log.Printf("%v", err)
		toUnauthorized(c)
		return
	}

	// sanitize
	userId := parsedToken.UserId
	if !isUserIdValid(userId) {
		log.Printf("%v", fmt.Errorf("invalid user id: '%s'", userId))
		toUnauthorized(c)
		return
	}
	userEmail := parsedToken.EMail
	if !isEmailValid(userEmail) {
		log.Printf("%v", fmt.Errorf("invalid email: '%s'", userEmail))
		toUnauthorized(c)
		return
	}

	// create new user record if this is a first time user logs in
	newAccId := generateNewAccId()
	defaultAppId := generateNewAppId(newAccId)
	createdAt := generateTimestamp()
	isNewUser, err := ensureUserExists(userId, userEmail, newAccId, defaultAppId, createdAt)
	if err != nil {
		toInternalServerError(c, err.Error())
		return
	}

	// save the default app metadata
	// if this step fails, some empty metadata has to be provided dynamically upon listing apps,
	// forcing the user to update the data
	if isNewUser {
		err = createApp(newAccId, defaultAppId, "default", createdAt)
		if err != nil {
			toInternalServerError(c, err.Error())
			return
		}
	}

	// find out the acc id: use newly generated or take from existing user
	var accId string
	if isNewUser {
		accId = newAccId
	} else {
		accId, err = getUserAccId(userId)
		if err != nil {
			toInternalServerError(c, err.Error())
			return
		}
	}

	// create record in accounts table
	ensureAccountRecordExists(accId)
	if err != nil {
		toInternalServerError(c, err.Error())
		return
	}

	// generate session
	session, err := generateSession(userId, userEmail, accId)
	if err != nil {
		log.Printf("%v", err)
		toUnauthorized(c)
		return
	}

	// create response
	sessionContainer := sessionContainerData{
		Session: session,
	}
	toSuccess(c, sessionContainer)
}
