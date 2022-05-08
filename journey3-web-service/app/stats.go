package app

import (
	"fmt"

	"github.com/gin-gonic/gin"
)

type statsRequestData struct {
	AppId  string `form:"aid" binding:"required"`
	Period string `form:"period" binding:"required"`
	Dt     string `form:"dt" binding:"required"`
	Build  string `form:"build" binding:"required"`
}

const (
	INVALID_APPID_ERROR_MESSAGE            = "invalid value '%s' for 'aid', expected valid app id"
	INVALID_PERIOD_ERROR_MESSAGE           = "invalid value '%s' for 'period', expected 'year', 'month' or 'day'"
	INVALID_RETENTION_PERIOD_ERROR_MESSAGE = "invalid value '%s' for 'period', expected 'day'"
	INVALID_DT_ERROR_MESSAGE               = "invalid value '%s' for 'dt', expected format 'yyyy[MM[dd]]' depending on the period"
	INVALID_BUILD_ERROR_MESSAGE            = "invalid value '%s' for 'build', expected 'Debug', 'Release'"
)

type sessionsResponseStatsData struct {
	Stats []statsData `json:"stats"`
}

type errorSessionsResponseStatsData struct {
	Stats []statsData `json:"stats"`
}

type eventsResponseStatsData struct {
	Stats []eventStatsData `json:"stats"`
}

type eventSessionsResponseStatsData struct {
	Stats []eventStatsData `json:"stats"`
}

type uniqueUsersResponseStatsData struct {
	HigherPeriodStats []statsData `json:"higher_period_stats"`
	Stats             []statsData `json:"stats"`
}

type newUsersResponseStatsData struct {
	Stats []statsData `json:"stats"`
}

type conversionStagesAndStatsData struct {
	Stages []stageData           `json:"stages"`
	Stats  []conversionStatsData `json:"stats"`
}

func handleSessionsPerPeriod(c *gin.Context, userId string, email string, _ string) {
	// get params from query string
	var statsRequest statsRequestData
	if err := c.ShouldBind(&statsRequest); err != nil {
		toBadRequest(c, err)
		return
	}

	// sanitize
	appId := statsRequest.AppId
	if !isAppIdValid(appId) {
		err := fmt.Errorf(INVALID_APPID_ERROR_MESSAGE, appId)
		toBadRequest(c, err)
		return
	}
	period := statsRequest.Period
	if !isPeriodValid(period) {
		err := fmt.Errorf(INVALID_PERIOD_ERROR_MESSAGE, period)
		toBadRequest(c, err)
		return
	}
	dt := statsRequest.Dt
	if !isDtValid(period, dt) {
		err := fmt.Errorf(INVALID_DT_ERROR_MESSAGE, dt)
		toBadRequest(c, err)
		return
	}
	build := statsRequest.Build
	if !isBuildValid(build) {
		err := fmt.Errorf(INVALID_BUILD_ERROR_MESSAGE, build)
		toBadRequest(c, err)
		return
	}

	// check access rights
	canRead, err := canRead(userId, appId)
	if !canRead || err != nil {
		toUnauthorized(c)
		return
	}

	// retrieve data
	stats, err := getSessionsPerPeriod(appId, build, period, dt)
	if err != nil {
		toInternalServerError(c, err.Error())
		return
	}

	// assemble and return result
	result := sessionsResponseStatsData{
		Stats: stats,
	}
	toSuccess(c, result)
}

func handleErrorSessionsPerPeriod(c *gin.Context, userId string, email string, _ string) {
	// get params from query string
	var statsRequest statsRequestData
	if err := c.ShouldBind(&statsRequest); err != nil {
		toBadRequest(c, err)
		return
	}

	// sanitize
	appId := statsRequest.AppId
	if !isAppIdValid(appId) {
		err := fmt.Errorf(INVALID_APPID_ERROR_MESSAGE, appId)
		toBadRequest(c, err)
		return
	}
	period := statsRequest.Period
	if !isPeriodValid(period) {
		err := fmt.Errorf(INVALID_PERIOD_ERROR_MESSAGE, period)
		toBadRequest(c, err)
		return
	}
	dt := statsRequest.Dt
	if !isDtValid(period, dt) {
		err := fmt.Errorf(INVALID_DT_ERROR_MESSAGE, dt)
		toBadRequest(c, err)
		return
	}
	build := statsRequest.Build
	if !isBuildValid(build) {
		err := fmt.Errorf(INVALID_BUILD_ERROR_MESSAGE, build)
		toBadRequest(c, err)
		return
	}

	// check access rights
	canRead, err := canRead(userId, appId)
	if !canRead || err != nil {
		toUnauthorized(c)
		return
	}

	// retrieve data
	stats, err := getErrorSessionsPerPeriod(appId, build, period, dt)
	if err != nil {
		toInternalServerError(c, err.Error())
		return
	}

	// assemble and return result
	result := errorSessionsResponseStatsData{
		Stats: stats,
	}
	toSuccess(c, result)
}

func handleUniqueUsersPerPeriod(c *gin.Context, userId string, email string, _ string) {
	// get params from query string
	var statsRequest statsRequestData
	if err := c.ShouldBind(&statsRequest); err != nil {
		toBadRequest(c, err)
		return
	}

	// sanitize
	appId := statsRequest.AppId
	if !isAppIdValid(appId) {
		err := fmt.Errorf(INVALID_APPID_ERROR_MESSAGE, appId)
		toBadRequest(c, err)
		return
	}
	period := statsRequest.Period
	if !isPeriodValid(period) {
		err := fmt.Errorf(INVALID_PERIOD_ERROR_MESSAGE, period)
		toBadRequest(c, err)
		return
	}
	dt := statsRequest.Dt
	if !isDtValid(period, dt) {
		err := fmt.Errorf(INVALID_DT_ERROR_MESSAGE, dt)
		toBadRequest(c, err)
		return
	}
	build := statsRequest.Build
	if !isBuildValid(build) {
		err := fmt.Errorf(INVALID_BUILD_ERROR_MESSAGE, build)
		toBadRequest(c, err)
		return
	}

	// check access rights
	canRead, err := canRead(userId, appId)
	if !canRead || err != nil {
		toUnauthorized(c)
		return
	}

	// retrieve data
	stats, err := getUniqueUsersPerPeriod(appId, build, period, dt)
	if err != nil {
		toInternalServerError(c, err.Error())
		return
	}
	higherPeriodStats, err := getUniqueUsersPerHigherPeriod(appId, build, period, dt)
	if err != nil {
		toInternalServerError(c, err.Error())
		return
	}

	// assemble and return result
	result := uniqueUsersResponseStatsData{
		HigherPeriodStats: higherPeriodStats,
		Stats:             stats,
	}
	toSuccess(c, result)
}

func handleNewUsersPerPeriod(c *gin.Context, userId string, email string, _ string) {
	// get params from query string
	var statsRequest statsRequestData
	if err := c.ShouldBind(&statsRequest); err != nil {
		toBadRequest(c, err)
		return
	}

	// sanitize
	appId := statsRequest.AppId
	if !isAppIdValid(appId) {
		err := fmt.Errorf(INVALID_APPID_ERROR_MESSAGE, appId)
		toBadRequest(c, err)
		return
	}
	period := statsRequest.Period
	if !isPeriodValid(period) {
		err := fmt.Errorf(INVALID_PERIOD_ERROR_MESSAGE, period)
		toBadRequest(c, err)
		return
	}
	dt := statsRequest.Dt
	if !isDtValid(period, dt) {
		err := fmt.Errorf(INVALID_DT_ERROR_MESSAGE, dt)
		toBadRequest(c, err)
		return
	}
	build := statsRequest.Build
	if !isBuildValid(build) {
		err := fmt.Errorf(INVALID_BUILD_ERROR_MESSAGE, build)
		toBadRequest(c, err)
		return
	}

	// check access rights
	canRead, err := canRead(userId, appId)
	if !canRead || err != nil {
		toUnauthorized(c)
		return
	}

	// retrieve data
	stats, err := getNewUsersPerPeriod(appId, build, period, dt)
	if err != nil {
		toInternalServerError(c, err.Error())
		return
	}

	// assemble and return result
	result := newUsersResponseStatsData{
		Stats: stats,
	}
	toSuccess(c, result)
}

func handleEventsPerPeriod(c *gin.Context, userId string, email string, _ string) {
	// get params from query string
	var statsRequest statsRequestData
	if err := c.ShouldBind(&statsRequest); err != nil {
		toBadRequest(c, err)
		return
	}

	// sanitize
	appId := statsRequest.AppId
	if !isAppIdValid(appId) {
		err := fmt.Errorf(INVALID_APPID_ERROR_MESSAGE, appId)
		toBadRequest(c, err)
		return
	}
	period := statsRequest.Period
	if !isPeriodValid(period) {
		err := fmt.Errorf(INVALID_PERIOD_ERROR_MESSAGE, period)
		toBadRequest(c, err)
		return
	}
	dt := statsRequest.Dt
	if !isDtValid(period, dt) {
		err := fmt.Errorf(INVALID_DT_ERROR_MESSAGE, dt)
		toBadRequest(c, err)
		return
	}
	build := statsRequest.Build
	if !isBuildValid(build) {
		err := fmt.Errorf(INVALID_BUILD_ERROR_MESSAGE, build)
		toBadRequest(c, err)
		return
	}

	// check access rights
	canRead, err := canRead(userId, appId)
	if !canRead || err != nil {
		toUnauthorized(c)
		return
	}

	// retrieve data
	stats, err := getEventsPerPeriod(appId, build, period, dt)
	if err != nil {
		toInternalServerError(c, err.Error())
		return
	}

	// assemble and return result
	result := eventsResponseStatsData{
		Stats: stats,
	}
	toSuccess(c, result)
}

func handleEventSessionsPerPeriod(c *gin.Context, userId string, email string, _ string) {
	// get params from query string
	var statsRequest statsRequestData
	if err := c.ShouldBind(&statsRequest); err != nil {
		toBadRequest(c, err)
		return
	}

	// sanitize
	appId := statsRequest.AppId
	if !isAppIdValid(appId) {
		err := fmt.Errorf(INVALID_APPID_ERROR_MESSAGE, appId)
		toBadRequest(c, err)
		return
	}
	period := statsRequest.Period
	if !isPeriodValid(period) {
		err := fmt.Errorf(INVALID_PERIOD_ERROR_MESSAGE, period)
		toBadRequest(c, err)
		return
	}
	dt := statsRequest.Dt
	if !isDtValid(period, dt) {
		err := fmt.Errorf(INVALID_DT_ERROR_MESSAGE, dt)
		toBadRequest(c, err)
		return
	}
	build := statsRequest.Build
	if !isBuildValid(build) {
		err := fmt.Errorf(INVALID_BUILD_ERROR_MESSAGE, build)
		toBadRequest(c, err)
		return
	}

	// check access rights
	canRead, err := canRead(userId, appId)
	if !canRead || err != nil {
		toUnauthorized(c)
		return
	}

	// retrieve data
	stats, err := getEventSessionsPerPeriod(appId, build, period, dt)
	if err != nil {
		toInternalServerError(c, err.Error())
		return
	}

	// assemble and return result
	result := eventSessionsResponseStatsData{
		Stats: stats,
	}
	toSuccess(c, result)
}

func handleRetentionOnDayPerBucket(c *gin.Context, userId string, email string, _ string) {
	// get params from query string
	var statsRequest statsRequestData
	if err := c.ShouldBind(&statsRequest); err != nil {
		toBadRequest(c, err)
		return
	}

	// sanitize
	appId := statsRequest.AppId
	if !isAppIdValid(appId) {
		err := fmt.Errorf(INVALID_APPID_ERROR_MESSAGE, appId)
		toBadRequest(c, err)
		return
	}
	period := statsRequest.Period
	if !isRetentionPeriodValid(period) {
		err := fmt.Errorf(INVALID_RETENTION_PERIOD_ERROR_MESSAGE, period)
		toBadRequest(c, err)
		return
	}
	dt := statsRequest.Dt
	if !isDtValid(period, dt) {
		err := fmt.Errorf(INVALID_DT_ERROR_MESSAGE, dt)
		toBadRequest(c, err)
		return
	}
	build := statsRequest.Build
	if !isBuildValid(build) {
		err := fmt.Errorf(INVALID_BUILD_ERROR_MESSAGE, build)
		toBadRequest(c, err)
		return
	}

	// check access rights
	canRead, err := canRead(userId, appId)
	if !canRead || err != nil {
		toUnauthorized(c)
		return
	}

	// retrieve data
	stats, err := getRetentionOnDayPerBucket(appId, build, dt)
	if err != nil {
		toInternalServerError(c, err.Error())
		return
	}

	toSuccess(c, stats)
}

func handleRetentionSinceDayPerBucket(c *gin.Context, userId string, email string, _ string) {
	// get params from query string
	var statsRequest statsRequestData
	if err := c.ShouldBind(&statsRequest); err != nil {
		toBadRequest(c, err)
		return
	}

	// sanitize
	appId := statsRequest.AppId
	if !isAppIdValid(appId) {
		err := fmt.Errorf(INVALID_APPID_ERROR_MESSAGE, appId)
		toBadRequest(c, err)
		return
	}
	period := statsRequest.Period
	if !isRetentionPeriodValid(period) {
		err := fmt.Errorf(INVALID_RETENTION_PERIOD_ERROR_MESSAGE, period)
		toBadRequest(c, err)
		return
	}
	dt := statsRequest.Dt
	if !isDtValid(period, dt) {
		err := fmt.Errorf(INVALID_DT_ERROR_MESSAGE, dt)
		toBadRequest(c, err)
		return
	}
	build := statsRequest.Build
	if !isBuildValid(build) {
		err := fmt.Errorf(INVALID_BUILD_ERROR_MESSAGE, build)
		toBadRequest(c, err)
		return
	}

	// check access rights
	canRead, err := canRead(userId, appId)
	if !canRead || err != nil {
		toUnauthorized(c)
		return
	}

	// retrieve data
	stats, err := getRetentionSinceDayPerBucket(appId, build, dt)
	if err != nil {
		toInternalServerError(c, err.Error())
		return
	}

	toSuccess(c, stats)
}

func handleConversionsPerStage(c *gin.Context, userId string, email string, _ string) {
	// get params from query string
	var statsRequest statsRequestData
	if err := c.ShouldBind(&statsRequest); err != nil {
		toBadRequest(c, err)
		return
	}

	// sanitize
	appId := statsRequest.AppId
	if !isAppIdValid(appId) {
		err := fmt.Errorf(INVALID_APPID_ERROR_MESSAGE, appId)
		toBadRequest(c, err)
		return
	}
	period := statsRequest.Period
	if !isPeriodValid(period) {
		err := fmt.Errorf(INVALID_PERIOD_ERROR_MESSAGE, period)
		toBadRequest(c, err)
		return
	}
	dt := statsRequest.Dt
	if !isDtValid(period, dt) {
		err := fmt.Errorf(INVALID_DT_ERROR_MESSAGE, dt)
		toBadRequest(c, err)
		return
	}
	build := statsRequest.Build
	if !isBuildValid(build) {
		err := fmt.Errorf(INVALID_BUILD_ERROR_MESSAGE, build)
		toBadRequest(c, err)
		return
	}

	// check access rights
	canRead, err := canRead(userId, appId)
	if !canRead || err != nil {
		toUnauthorized(c)
		return
	}

	// retrieve data
	stats, err := getConversionsPerStage(appId, build, period, dt)
	if err != nil {
		toInternalServerError(c, err.Error())
		return
	}

	// retrieve metadata
	stages, err := getStages(appId, build)
	if err != nil {
		toInternalServerError(c, err.Error())
		return
	}

	result := conversionStagesAndStatsData{
		Stages: stages,
		Stats:  stats,
	}

	toSuccess(c, result)
}
