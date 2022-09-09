package app

import (
	"fmt"

	"github.com/gin-gonic/gin"
)

type feedbackDataIn struct {
	Text string `json:"text" binding:"required"`
}

func handlePostFeedback(c *gin.Context) {
	// get app data from the POST body
	var feedback feedbackDataIn
	if err := c.ShouldBindJSON(&feedback); err != nil {
		toBadRequest(c, err)
		return
	}

	// sanitize
	if !isFeedbackTextValid(feedback.Text) {
		err := fmt.Errorf("invalid text for feedback")
		toBadRequest(c, err)
		return
	}

	// add app to user
	err := registerFeedback(feedback.Text)
	if err != nil {
		toInternalServerError(c, err.Error())
		return
	}

	toNoContent(c)
}
