package app

import (
	"fmt"

	"github.com/gin-gonic/gin"
)

type statsRequestData struct {
	AppId  string `form:"aid" binding:"required"`
	Period string `form:"period" binding:"required"`
	Dt     string `form:"dt" binding:"required"`
}

func handleAppLaunchStats(c *gin.Context, userId string, email string, _ string) {
	// get params from query string
	var statsRequest statsRequestData
	if err := c.ShouldBind(&statsRequest); err != nil {
		toBadRequest(c, err)
		return
	}

	// sanitize
	appId := statsRequest.AppId
	if !isAppIdValid(appId) {
		err := fmt.Errorf("invalid value '%s' for 'aid', expected valid app id", appId)
		toBadRequest(c, err)
		return
	}
	period := statsRequest.Period
	if !isPeriodValid(period) {
		err := fmt.Errorf("invalid value '%s' for 'period', expected 'year', 'month' or 'day'", period)
		toBadRequest(c, err)
		return
	}
	dt := statsRequest.Dt
	if !isDtValid(period, dt) {
		err := fmt.Errorf("invalid value '%s' for 'dt', expected format 'yyyy[MM[dd]]' depending on the period", dt)
		toBadRequest(c, err)
		return
	}

	// check access rights
	canRead, err := canRead(userId, appId)
	if !canRead || err != nil {
		toUnauthorized(c)
	}

	// retrieve data
	stats, err := getAppLaunchStats(appId, period, dt)
	if err != nil {
		toInternalServerError(c, err.Error())
		return
	}

	toSuccess(c, stats)
}
