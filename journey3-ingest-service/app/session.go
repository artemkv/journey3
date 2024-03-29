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

type sessionHeadIncomingData struct {
	Type                   string    `json:"t" binding:"required"`
	ProtoVersion           string    `json:"v" binding:"required"`
	Id                     string    `json:"id" binding:"required"`
	Since                  string    `json:"since" binding:"required"`
	Start                  string    `json:"start" binding:"required"`
	AccId                  string    `json:"acc" binding:"required"`
	AppId                  string    `json:"aid" binding:"required"`
	Version                string    `json:"version"`
	IsRelease              bool      `json:"is_release"`
	FirstLaunch            bool      `json:"fst_launch"`
	FirstLaunchThisHour    bool      `json:"fst_launch_hour"`
	FirstLaunchToday       bool      `json:"fst_launch_day"`
	FirstLaunchThisMonth   bool      `json:"fst_launch_month"`
	FirstLaunchThisYear    bool      `json:"fst_launch_year"`
	FirstLaunchThisVersion bool      `json:"fst_launch_version"`
	PrevStage              stageData `json:"prev_stage"`
}

type sessionHeadOutgoingData struct {
	Type                   string    `json:"t"`
	ProtoVersion           string    `json:"v"`
	Ids                    string    `json:"ids"`
	Dts                    string    `json:"dts"`
	Id                     string    `json:"id"`
	Since                  string    `json:"since"`
	Start                  string    `json:"start"`
	AccId                  string    `json:"acc"`
	AppId                  string    `json:"aid"`
	Version                string    `json:"version"`
	IsRelease              bool      `json:"is_release"`
	FirstLaunch            bool      `json:"fst_launch"`
	FirstLaunchThisHour    bool      `json:"fst_launch_hour"`
	FirstLaunchToday       bool      `json:"fst_launch_day"`
	FirstLaunchThisMonth   bool      `json:"fst_launch_month"`
	FirstLaunchThisYear    bool      `json:"fst_launch_year"`
	FirstLaunchThisVersion bool      `json:"fst_launch_version"`
	PrevStage              stageData `json:"prev_stage"`
}

type sessionTailIncomingData struct {
	Type               string         `json:"t" binding:"required"`
	ProtoVersion       string         `json:"v" binding:"required"`
	Id                 string         `json:"id" binding:"required"`
	Since              string         `json:"since" binding:"required"`
	Start              string         `json:"start" binding:"required"`
	End                string         `json:"end" binding:"required"`
	AccId              string         `json:"acc" binding:"required"`
	AppId              string         `json:"aid" binding:"required"`
	Version            string         `json:"version"`
	IsRelease          bool           `json:"is_release"`
	FirstLaunch        bool           `json:"fst_launch"`
	HasError           bool           `json:"has_error"`
	HasCrash           bool           `json:"has_crash"`
	EventCounts        map[string]int `json:"evts" binding:"required"`
	FlushedEventCounts map[string]int `json:"flushed"`
	EventSequence      []string       `json:"evt_seq" binding:"required"`
	PrevStage          stageData      `json:"prev_stage" binding:"required"`
	NewStage           stageData      `json:"new_stage" binding:"required"`
}

type sessionTailOutgoingData struct {
	Type               string         `json:"t"`
	ProtoVersion       string         `json:"v"`
	Ids                string         `json:"ids"`
	Dts                string         `json:"dts"`
	Id                 string         `json:"id"`
	Since              string         `json:"since"`
	Start              string         `json:"start"`
	End                string         `json:"end"`
	AccId              string         `json:"acc"`
	AppId              string         `json:"aid"`
	Version            string         `json:"version"`
	IsRelease          bool           `json:"is_release"`
	FirstLaunch        bool           `json:"fst_launch"`
	HasError           bool           `json:"has_error"`
	HasCrash           bool           `json:"has_crash"`
	EventCounts        map[string]int `json:"evts"`
	FlushedEventCounts map[string]int `json:"flushed"`
	EventSequence      []string       `json:"evt_seq"`
	PrevStage          stageData      `json:"prev_stage"`
	NewStage           stageData      `json:"new_stage"`
}

type sessionFlushIncomingData struct {
	Type               string         `json:"t" binding:"required"`
	ProtoVersion       string         `json:"v" binding:"required"`
	Id                 string         `json:"id" binding:"required"`
	Start              string         `json:"start" binding:"required"`
	AccId              string         `json:"acc" binding:"required"`
	AppId              string         `json:"aid" binding:"required"`
	Version            string         `json:"version"`
	IsRelease          bool           `json:"is_release"`
	FirstLaunch        bool           `json:"fst_launch"`
	EventCounts        map[string]int `json:"evts" binding:"required"`
	FlushedEventCounts map[string]int `json:"flushed" binding:"required"`
}

type sessionFlushOutgoingData struct {
	Type               string         `json:"t"`
	ProtoVersion       string         `json:"v"`
	Ids                string         `json:"ids"`
	Dts                string         `json:"dts"`
	Id                 string         `json:"id"`
	Start              string         `json:"start"`
	AccId              string         `json:"acc"`
	AppId              string         `json:"aid"`
	Version            string         `json:"version"`
	IsRelease          bool           `json:"is_release"`
	FirstLaunch        bool           `json:"fst_launch"`
	EventCounts        map[string]int `json:"evts"`
	FlushedEventCounts map[string]int `json:"flushed"`
}

func handlePostSessionHead(c *gin.Context) {
	var sessionHeadIn sessionHeadIncomingData
	if err := c.ShouldBindJSON(&sessionHeadIn); err != nil {
		toBadRequest(c, err)
		return
	}

	if sessionHeadIn.Type != "shead" {
		toBadRequest(c, fmt.Errorf("Type '%s' is invalid, expected 'shead'", sessionHeadIn.Type))
		return
	}

	if !IsValidAccount(sessionHeadIn.AccId) {
		toBadRequest(c, fmt.Errorf("Account '%s' does not exist or not active", sessionHeadIn.AccId))
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

	if sessionTailIn.Type != "stail" {
		toBadRequest(c, fmt.Errorf("Type '%s' is invalid, expected 'stail'", sessionTailIn.Type))
		return
	}

	if !IsValidAccount(sessionTailIn.AccId) {
		toBadRequest(c, fmt.Errorf("Account '%s' does not exist or not active", sessionTailIn.AccId))
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

func handlePostSessionFlush(c *gin.Context) {
	var sessionFlushIn sessionFlushIncomingData
	if err := c.ShouldBindJSON(&sessionFlushIn); err != nil {
		toBadRequest(c, err)
		return
	}

	if sessionFlushIn.Type != "sflush" {
		toBadRequest(c, fmt.Errorf("Type '%s' is invalid, expected 'sflush'", sessionFlushIn.Type))
		return
	}

	if !IsValidAccount(sessionFlushIn.AccId) {
		toBadRequest(c, fmt.Errorf("Account '%s' does not exist or not active", sessionFlushIn.AccId))
		return
	}

	sessionFlushOut := constructSessionFlushOut(&sessionFlushIn)
	msgId, err := EnqueueMessage(sessionFlushOut)
	if err != nil {
		toInternalServerError(c, err.Error())
		return
	}

	toSuccess(c, msgId)
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
		PrevStage:              in.PrevStage,
	}
}

func constructSessionTailOut(in *sessionTailIncomingData) *sessionTailOutgoingData {
	var flushedEventCounts map[string]int
	if in.FlushedEventCounts == nil {
		flushedEventCounts = map[string]int{}
	} else {
		flushedEventCounts = in.FlushedEventCounts
	}

	return &sessionTailOutgoingData{
		Type:               in.Type,
		ProtoVersion:       in.ProtoVersion,
		Ids:                uuid.New().String(),
		Dts:                time.Now().UTC().Format(time.RFC3339),
		Id:                 in.Id,
		Since:              in.Since,
		Start:              in.Start,
		End:                in.End,
		AccId:              in.AccId,
		AppId:              in.AppId,
		Version:            in.Version,
		IsRelease:          in.IsRelease,
		FirstLaunch:        in.FirstLaunch,
		HasError:           in.HasError,
		HasCrash:           in.HasCrash,
		EventCounts:        in.EventCounts,
		FlushedEventCounts: flushedEventCounts,
		EventSequence:      in.EventSequence,
		PrevStage:          in.PrevStage,
		NewStage:           in.NewStage,
	}
}

func constructSessionFlushOut(in *sessionFlushIncomingData) *sessionFlushOutgoingData {
	return &sessionFlushOutgoingData{
		Type:               in.Type,
		ProtoVersion:       in.ProtoVersion,
		Ids:                uuid.New().String(),
		Dts:                time.Now().UTC().Format(time.RFC3339),
		Id:                 in.Id,
		Start:              in.Start,
		AccId:              in.AccId,
		AppId:              in.AppId,
		Version:            in.Version,
		IsRelease:          in.IsRelease,
		FirstLaunch:        in.FirstLaunch,
		EventCounts:        in.EventCounts,
		FlushedEventCounts: in.FlushedEventCounts,
	}
}
