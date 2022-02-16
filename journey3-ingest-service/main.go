package main

import (
	"time"

	log "github.com/sirupsen/logrus"

	"artemkv.net/journey2/app"
	"artemkv.net/journey2/health"
	"artemkv.net/journey2/reststats"
	"artemkv.net/journey2/server"
	"github.com/gin-gonic/gin"
)

var version = "1.0"

func main() {
	// setup logging
	log.SetFormatter(&log.JSONFormatter{
		TimestampFormat: time.RFC3339,
	})

	// load .env
	LoadDotEnv()

	// initialize REST stats
	reststats.Initialize(version)

	// establish connection with SQS
	topicArn := GetMandatoryString("JOURNEY3_TOPIC")
	app.InitSNSConnection(topicArn)

	// configure router
	router := gin.New()
	app.SetupRouter(router)

	// determine whether to use HTTPS
	useTls := GetBoolean("JOURNEY3_TLS")
	certFile := ""
	keyFile := ""
	if useTls {
		certFile = GetMandatoryString("JOURNEY3_CERT_FILE")
		keyFile = GetMandatoryString("JOURNEY3_KEY_FILE")
	}

	serverConfig := &server.ServerConfiguration{
		UseTls:   useTls,
		CertFile: certFile,
		KeyFile:  keyFile,
	}

	// determine port
	port := GetOptionalString("JOURNEY3_PORT", ":8600")

	// start the server
	server.Serve(router, port, serverConfig, func() {
		health.SetIsReadyGlobally()
	})
}
