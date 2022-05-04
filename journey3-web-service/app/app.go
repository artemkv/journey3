package app

import (
	"fmt"
	"net/http"
	"time"

	log "github.com/sirupsen/logrus"

	"artemkv.net/journey3web/health"
	"artemkv.net/journey3web/reststats"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func SetupRouter(router *gin.Engine, allowedOrigin string) {
	// setup logger, recover and CORS
	router.Use(requestLogger(log.StandardLogger()))
	router.Use(gin.CustomRecovery(recover))
	router.Use(cors.New(getCorsConfig(allowedOrigin)))

	// favicon
	router.StaticFile("/favicon.ico", "./resources/favicon.ico")

	// update stats
	router.Use(reststats.RequestCounter())

	// used for testing / health checks
	router.GET("/health", health.HandleHealthCheck)
	router.GET("/liveness", health.HandleLivenessCheck)
	router.GET("/readiness", health.HandleReadinessCheck)
	router.GET("/error", handleError)

	// stats
	router.GET("/stats", reststats.HandleEndpointWithStats(reststats.HandleGetStats))

	// sign-in
	router.POST("/signin", reststats.HandleEndpointWithStats(handleSignIn))

	// do business

	// stats
	// TODO: is this a good naming convention? should I drop per_period?
	router.GET("/sessions_per_period", reststats.HandleEndpointWithStats(
		withAuthentication(handleSessionsPerPeriod)))
	router.GET("/error_sessions_per_period", reststats.HandleEndpointWithStats(
		withAuthentication(handleErrorSessionsPerPeriod)))
	router.GET("/unique_users_per_period", reststats.HandleEndpointWithStats(
		withAuthentication(handleUniqueUsersPerPeriod)))
	router.GET("/new_users_per_period", reststats.HandleEndpointWithStats(
		withAuthentication(handleNewUsersPerPeriod)))
	router.GET("/events_per_period", reststats.HandleEndpointWithStats(
		withAuthentication(handleEventsPerPeriod)))
	router.GET("/event_sessions_per_period", reststats.HandleEndpointWithStats(
		withAuthentication(handleEventSessionsPerPeriod)))

	router.GET("/retention_on_day", reststats.HandleEndpointWithStats(
		withAuthentication(handleRetentionOnDayPerBucket)))
	router.GET("/retention_since_day", reststats.HandleEndpointWithStats(
		withAuthentication(handleRetentionSinceDayPerBucket)))

	router.GET("/conversions", reststats.HandleEndpointWithStats(
		withAuthentication(handleConversionsPerStage)))

	// account
	router.GET("/acc", reststats.HandleEndpointWithStats(
		withAuthentication(handleGetAcc)))

	// apps
	router.GET("/apps/:id", reststats.HandleEndpointWithStats(
		withAuthentication(handleGetApp)))
	router.GET("/apps", reststats.HandleEndpointWithStats(
		withAuthentication(handleGetApps)))
	router.POST("/apps", reststats.HandleEndpointWithStats(
		withAuthentication(handlePostApp)))
	router.PUT("/apps/:id", reststats.HandleEndpointWithStats(
		withAuthentication(handlePutApp)))
	router.DELETE("/apps/:id", reststats.HandleEndpointWithStats(
		withAuthentication(handleDeleteApp)))

	// handle 404
	router.NoRoute(reststats.HandleWithStats(notFoundHandler()))
}

func getCorsConfig(allowedOrigin string) cors.Config {
	return cors.Config{
		AllowOrigins: []string{allowedOrigin},
		AllowHeaders: []string{"*"},
		AllowMethods: []string{"*"},
	}
}

func toSuccess(c *gin.Context, data interface{}) {
	c.JSON(http.StatusOK, gin.H{"data": data})
}

func toCreated(c *gin.Context, data interface{}) {
	c.JSON(http.StatusCreated, gin.H{"data": data})
}

func toNoContent(c *gin.Context) {
	c.Status(http.StatusNoContent)
}

func toUnauthorized(c *gin.Context) {
	c.JSON(http.StatusUnauthorized, gin.H{"err": "Unauthorized"})
}

func toBadRequest(c *gin.Context, err error) {
	c.JSON(http.StatusBadRequest, gin.H{"err": err.Error()})
}

func toNotFound(c *gin.Context) {
	c.JSON(http.StatusNotFound, gin.H{"err": "Not Found"})
}

func toInternalServerError(c *gin.Context, errText string) {
	// TODO: when too many internal server errors, set liveness to false and exit
	c.JSON(http.StatusInternalServerError, gin.H{"err": errText})
}

func recover(c *gin.Context, err interface{}) {
	if errText, ok := err.(string); ok {
		toInternalServerError(c, errText)
	}
	c.AbortWithStatus(http.StatusInternalServerError)

	reststats.UpdateResponseStatsOnRecover(
		time.Now(), c.Request.RequestURI, http.StatusInternalServerError)
}

func requestLogger(logger *log.Logger) gin.HandlerFunc {
	return func(c *gin.Context) {
		message := fmt.Sprintf("%d %s %s",
			c.Writer.Status(),
			c.Request.Method,
			c.Request.URL.Path)

		logger.Info(message)
	}
}

func notFoundHandler() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.JSON(http.StatusNotFound, gin.H{"err": "Not found"})
	}
}

func handleError(c *gin.Context) {
	panic("Test error")
}
