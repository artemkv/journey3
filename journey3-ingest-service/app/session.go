package app

import (
	"fmt"

	"github.com/gin-gonic/gin"
)

type sessionIncomingData struct {
	Id            string         `json:"id" binding:"required"`
	Start         string         `json:"start" binding:"required"`
	End           string         `json:"end" binding:"required"`
	AccId         string         `json:"acc" binding:"required"`
	AppId         string         `json:"aid" binding:"required"`
	Version       string         `json:"version"`
	IsRelease     bool           `json:"is_release"`
	FirstLaunch   bool           `json:"fst_launch"`
	HasError      bool           `json:"has_error"`
	EventCounts   map[string]int `json:"evts" binding:"required"`
	EventSequence []string       `json:"evt_seq" binding:"required"`
}

type sessionOutgoingData struct {
	Id            string         `json:"id"`
	Start         string         `json:"start"`
	End           string         `json:"end"`
	AccId         string         `json:"acc"`
	AppId         string         `json:"aid"`
	Version       string         `json:"version"`
	IsRelease     bool           `json:"is_release"`
	FirstLaunch   bool           `json:"fst_launch"`
	HasError      bool           `json:"has_error"`
	EventCounts   map[string]int `json:"evts"`
	EventSequence []string       `json:"evt_seq"`
}

func handlePostSession(c *gin.Context) {
	var sessionIn sessionIncomingData
	if err := c.ShouldBindJSON(&sessionIn); err != nil {
		toBadRequest(c, err)
		return
	}

	// TODO: this is temporary solution to avoid high billing
	// TODO: sanitize the app id and apply rate limiter
	if !IsWhitelisted(sessionIn.AppId) {
		toBadRequest(c, fmt.Errorf("not allowed for aid: %s", sessionIn.AppId))
		return
	}

	sessionOut := constructsessionOut(&sessionIn)
	msgId, err := EnqueueMessage(sessionOut)
	if err != nil {
		toInternalServerError(c, err.Error())
		return
	}

	toSuccess(c, msgId)
}

func constructsessionOut(sessionIn *sessionIncomingData) *sessionOutgoingData {
	return &sessionOutgoingData{
		Id:            sessionIn.Id,
		Start:         sessionIn.Start,
		End:           sessionIn.End,
		AccId:         sessionIn.AccId,
		AppId:         sessionIn.AppId,
		Version:       sessionIn.Version,
		IsRelease:     sessionIn.IsRelease,
		FirstLaunch:   sessionIn.FirstLaunch,
		HasError:      sessionIn.HasError,
		EventCounts:   sessionIn.EventCounts,
		EventSequence: sessionIn.EventSequence,
	}
}
