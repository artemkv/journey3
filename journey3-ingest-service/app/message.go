package app

import (
	"fmt"
	"time"

	"github.com/gin-gonic/gin"
)

type messageIncomingData struct {
	AccId string `json:"acc" binding:"required"`
	AppId string `json:"aid" binding:"required"`
}

type messageOutgoingData struct {
	AccId string `json:"acc" binding:"required"`
	AppId string `json:"aid" binding:"required"`
	Date  string `json:"dts"`
}

func handlePostAction(c *gin.Context) {
	var messageIn messageIncomingData
	if err := c.ShouldBindJSON(&messageIn); err != nil {
		toBadRequest(c, err)
		return
	}

	// TODO: this is temporary solution to avoid high billing
	// TODO: sanitize the app id and apply rate limiter
	if !IsWhitelisted(messageIn.AppId) {
		toBadRequest(c, fmt.Errorf("not allowed for aid: %s", messageIn.AppId))
		return
	}

	messageOut := constructMessageOut(&messageIn)

	msgId, err := EnqueueMessage(messageOut)
	if err != nil {
		toInternalServerError(c, err.Error())
		return
	}

	toSuccess(c, msgId)
}

func constructMessageOut(messageIn *messageIncomingData) *messageOutgoingData {
	return &messageOutgoingData{
		AccId: messageIn.AccId,
		AppId: messageIn.AppId,
		Date:  time.Now().UTC().Format(time.RFC3339),
	}
}
