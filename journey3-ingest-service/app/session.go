package app

import (
	"fmt"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type stageData struct {
	Ts    string `json:"ts"`
	Stage int    `json:"stage"`
	Name  string `json:"name"`
}

type sessionIncomingData struct {
	Id                     string         `json:"id" binding:"required"`
	Since                  string         `json:"since"`
	Start                  string         `json:"start" binding:"required"`
	End                    string         `json:"end" binding:"required"`
	AccId                  string         `json:"acc" binding:"required"`
	AppId                  string         `json:"aid" binding:"required"`
	Version                string         `json:"version"`
	IsRelease              bool           `json:"is_release"`
	FirstLaunch            bool           `json:"fst_launch"`
	FirstLaunchThisHour    bool           `json:"fst_launch_hour"`
	FirstLaunchToday       bool           `json:"fst_launch_day"`
	FirstLaunchThisMonth   bool           `json:"fst_launch_month"`
	FirstLaunchThisYear    bool           `json:"fst_launch_year"`
	FirstLaunchThisVersion bool           `json:"fst_launch_version"`
	HasError               bool           `json:"has_error"`
	EventCounts            map[string]int `json:"evts" binding:"required"`
	EventSequence          []string       `json:"evt_seq" binding:"required"`
	PreviousStage          stageData      `json:"prev_stage"`
	NewStage               stageData      `json:"new_stage"`
}

type sessionOutgoingData struct {
	Ids                    string         `json:"ids"`
	Dts                    string         `json:"dts"`
	Id                     string         `json:"id"`
	Since                  string         `json:"since"`
	Start                  string         `json:"start"`
	End                    string         `json:"end"`
	AccId                  string         `json:"acc"`
	AppId                  string         `json:"aid"`
	Version                string         `json:"version"`
	IsRelease              bool           `json:"is_release"`
	FirstLaunch            bool           `json:"fst_launch"`
	FirstLaunchThisHour    bool           `json:"fst_launch_hour"`
	FirstLaunchToday       bool           `json:"fst_launch_day"`
	FirstLaunchThisMonth   bool           `json:"fst_launch_month"`
	FirstLaunchThisYear    bool           `json:"fst_launch_year"`
	FirstLaunchThisVersion bool           `json:"fst_launch_version"`
	HasError               bool           `json:"has_error"`
	EventCounts            map[string]int `json:"evts"`
	EventSequence          []string       `json:"evt_seq"`
	PreviousStage          stageData      `json:"prev_stage"`
	NewStage               stageData      `json:"new_stage"`
}

type sessionHeadIncomingData struct {
	Type                   string `json:"t" binding:"required"`
	ProtoVersion           string `json:"v" binding:"required"`
	Id                     string `json:"id" binding:"required"`
	Since                  string `json:"since" binding:"required"`
	Start                  string `json:"start" binding:"required"`
	AccId                  string `json:"acc" binding:"required"`
	AppId                  string `json:"aid" binding:"required"`
	Version                string `json:"version"`
	IsRelease              bool   `json:"is_release"`
	FirstLaunch            bool   `json:"fst_launch"`
	FirstLaunchThisHour    bool   `json:"fst_launch_hour"`
	FirstLaunchToday       bool   `json:"fst_launch_day"`
	FirstLaunchThisMonth   bool   `json:"fst_launch_month"`
	FirstLaunchThisYear    bool   `json:"fst_launch_year"`
	FirstLaunchThisVersion bool   `json:"fst_launch_version"`
}

type sessionHeadOutgoingData struct {
	Type                   string `json:"t"`
	ProtoVersion           string `json:"v"`
	Ids                    string `json:"ids"`
	Dts                    string `json:"dts"`
	Id                     string `json:"id"`
	Since                  string `json:"since"`
	Start                  string `json:"start"`
	AccId                  string `json:"acc"`
	AppId                  string `json:"aid"`
	Version                string `json:"version"`
	IsRelease              bool   `json:"is_release"`
	FirstLaunch            bool   `json:"fst_launch"`
	FirstLaunchThisHour    bool   `json:"fst_launch_hour"`
	FirstLaunchToday       bool   `json:"fst_launch_day"`
	FirstLaunchThisMonth   bool   `json:"fst_launch_month"`
	FirstLaunchThisYear    bool   `json:"fst_launch_year"`
	FirstLaunchThisVersion bool   `json:"fst_launch_version"`
}

type sessionTailIncomingData struct {
	Type                   string         `json:"t" binding:"required"`
	ProtoVersion           string         `json:"v" binding:"required"`
	Id                     string         `json:"id" binding:"required"`
	Since                  string         `json:"since" binding:"required"`
	Start                  string         `json:"start" binding:"required"`
	End                    string         `json:"end" binding:"required"`
	AccId                  string         `json:"acc" binding:"required"`
	AppId                  string         `json:"aid" binding:"required"`
	Version                string         `json:"version"`
	IsRelease              bool           `json:"is_release"`
	FirstLaunch            bool           `json:"fst_launch"`
	FirstLaunchThisHour    bool           `json:"fst_launch_hour"`
	FirstLaunchToday       bool           `json:"fst_launch_day"`
	FirstLaunchThisMonth   bool           `json:"fst_launch_month"`
	FirstLaunchThisYear    bool           `json:"fst_launch_year"`
	FirstLaunchThisVersion bool           `json:"fst_launch_version"`
	HasError               bool           `json:"has_error"`
	HasCrash               bool           `json:"has_crash"`
	EventCounts            map[string]int `json:"evts" binding:"required"`
	EventSequence          []string       `json:"evt_seq" binding:"required"`
	PrevStage              stageData      `json:"prev_stage" binding:"required"`
	NewStage               stageData      `json:"new_stage" binding:"required"`
}

type sessionTailOutgoingData struct {
	Type                   string         `json:"t"`
	ProtoVersion           string         `json:"v"`
	Ids                    string         `json:"ids"`
	Dts                    string         `json:"dts"`
	Id                     string         `json:"id"`
	Since                  string         `json:"since"`
	Start                  string         `json:"start"`
	End                    string         `json:"end"`
	AccId                  string         `json:"acc"`
	AppId                  string         `json:"aid"`
	Version                string         `json:"version"`
	IsRelease              bool           `json:"is_release"`
	FirstLaunch            bool           `json:"fst_launch"`
	FirstLaunchThisHour    bool           `json:"fst_launch_hour"`
	FirstLaunchToday       bool           `json:"fst_launch_day"`
	FirstLaunchThisMonth   bool           `json:"fst_launch_month"`
	FirstLaunchThisYear    bool           `json:"fst_launch_year"`
	FirstLaunchThisVersion bool           `json:"fst_launch_version"`
	HasError               bool           `json:"has_error"`
	HasCrash               bool           `json:"has_crash"`
	EventCounts            map[string]int `json:"evts"`
	EventSequence          []string       `json:"evt_seq"`
	PrevStage              stageData      `json:"prev_stage"`
	NewStage               stageData      `json:"new_stage"`
}

func handlePostSessionHead(c *gin.Context) {
	var sessionHeadIn sessionHeadIncomingData
	if err := c.ShouldBindJSON(&sessionHeadIn); err != nil {
		toBadRequest(c, err)
		return
	}

	// TODO: this is temporary solution to avoid high billing
	// TODO: sanitize the app id and apply rate limiter
	if !IsWhitelisted(sessionHeadIn.AppId) {
		toBadRequest(c, fmt.Errorf("not allowed for aid: %s", sessionHeadIn.AppId))
		return
	}

	sessionHeadOut := constructSessionHeadOut(&sessionHeadIn)
	msgId, err := EnqueueMessage(sessionHeadOut)
	if err != nil {
		toInternalServerError(c, err.Error())
		return
	}

	toSuccess(c, msgId)
}

func handlePostSessionTail(c *gin.Context) {
	var sessionTailIn sessionTailIncomingData
	if err := c.ShouldBindJSON(&sessionTailIn); err != nil {
		toBadRequest(c, err)
		return
	}

	// TODO: this is temporary solution to avoid high billing
	// TODO: sanitize the app id and apply rate limiter
	if !IsWhitelisted(sessionTailIn.AppId) {
		toBadRequest(c, fmt.Errorf("not allowed for aid: %s", sessionTailIn.AppId))
		return
	}

	sessionTailOut := constructSessionTailOut(&sessionTailIn)
	msgId, err := EnqueueMessage(sessionTailOut)
	if err != nil {
		toInternalServerError(c, err.Error())
		return
	}

	toSuccess(c, msgId)
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
		Ids:                    uuid.New().String(),
		Dts:                    time.Now().UTC().Format(time.RFC3339),
		Id:                     sessionIn.Id,
		Since:                  sessionIn.Since,
		Start:                  sessionIn.Start,
		End:                    sessionIn.End,
		AccId:                  sessionIn.AccId,
		AppId:                  sessionIn.AppId,
		Version:                sessionIn.Version,
		IsRelease:              sessionIn.IsRelease,
		FirstLaunch:            sessionIn.FirstLaunch,
		FirstLaunchThisHour:    sessionIn.FirstLaunchThisHour,
		FirstLaunchToday:       sessionIn.FirstLaunchToday,
		FirstLaunchThisMonth:   sessionIn.FirstLaunchThisMonth,
		FirstLaunchThisYear:    sessionIn.FirstLaunchThisYear,
		FirstLaunchThisVersion: sessionIn.FirstLaunchThisVersion,
		HasError:               sessionIn.HasError,
		EventCounts:            sessionIn.EventCounts,
		EventSequence:          sessionIn.EventSequence,
		PreviousStage:          sessionIn.PreviousStage,
		NewStage:               sessionIn.NewStage,
	}
}

func constructSessionHeadOut(in *sessionHeadIncomingData) *sessionHeadOutgoingData {
	return &sessionHeadOutgoingData{
		Type:                   in.Type,
		ProtoVersion:           in.ProtoVersion,
		Ids:                    uuid.New().String(),
		Dts:                    time.Now().UTC().Format(time.RFC3339),
		Id:                     in.Id,
		Since:                  in.Since,
		Start:                  in.Start,
		AccId:                  in.AccId,
		AppId:                  in.AppId,
		Version:                in.Version,
		IsRelease:              in.IsRelease,
		FirstLaunch:            in.FirstLaunch,
		FirstLaunchThisHour:    in.FirstLaunchThisHour,
		FirstLaunchToday:       in.FirstLaunchToday,
		FirstLaunchThisMonth:   in.FirstLaunchThisMonth,
		FirstLaunchThisYear:    in.FirstLaunchThisYear,
		FirstLaunchThisVersion: in.FirstLaunchThisVersion,
	}
}

func constructSessionTailOut(in *sessionTailIncomingData) *sessionTailOutgoingData {
	return &sessionTailOutgoingData{
		Type:                   in.Type,
		ProtoVersion:           in.ProtoVersion,
		Ids:                    uuid.New().String(),
		Dts:                    time.Now().UTC().Format(time.RFC3339),
		Id:                     in.Id,
		Since:                  in.Since,
		Start:                  in.Start,
		End:                    in.End,
		AccId:                  in.AccId,
		AppId:                  in.AppId,
		Version:                in.Version,
		IsRelease:              in.IsRelease,
		FirstLaunch:            in.FirstLaunch,
		FirstLaunchThisHour:    in.FirstLaunchThisHour,
		FirstLaunchToday:       in.FirstLaunchToday,
		FirstLaunchThisMonth:   in.FirstLaunchThisMonth,
		FirstLaunchThisYear:    in.FirstLaunchThisYear,
		FirstLaunchThisVersion: in.FirstLaunchThisVersion,
		HasError:               in.HasError,
		HasCrash:               in.HasCrash,
		EventCounts:            in.EventCounts,
		EventSequence:          in.EventSequence,
		PrevStage:              in.PrevStage,
		NewStage:               in.NewStage,
	}
}
