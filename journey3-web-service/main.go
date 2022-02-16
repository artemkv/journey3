package main

import (
	"time"

	log "github.com/sirupsen/logrus"

	"artemkv.net/journey3web/app"
	"artemkv.net/journey3web/health"
	"artemkv.net/journey3web/reststats"
	"artemkv.net/journey3web/server"
	"github.com/gin-gonic/gin"
)

var version = "1.2"

func main() {
	// setup logging
	log.SetFormatter(&log.JSONFormatter{
		TimestampFormat: time.RFC3339,
	})

	// load .env
	LoadDotEnv()

	// initialize session encryption key
	sessionEncryptionPassphrase := GetMandatoryString("JOURNEY3WEB_SESSION_ENCRYPTION_PASSPHRASE")
	app.SetEncryptionPassphrase(sessionEncryptionPassphrase)

	// initialize REST stats
	reststats.Initialize(version)

	// configure router
	allowedOrigin := GetMandatoryString("JOURNEY3WEB_ALLOW_ORIGIN")
	router := gin.New()
	app.SetupRouter(router, allowedOrigin)

	// determine whether to use HTTPS
	useTls := GetBoolean("JOURNEY3WEB_TLS")
	certFile := ""
	keyFile := ""
	if useTls {
		certFile = GetMandatoryString("JOURNEY3WEB_CERT_FILE")
		keyFile = GetMandatoryString("JOURNEY3WEB_KEY_FILE")
	}

	serverConfig := &server.ServerConfiguration{
		UseTls:   useTls,
		CertFile: certFile,
		KeyFile:  keyFile,
	}

	// determine port
	port := GetOptionalString("JOURNEY3WEB_PORT", ":8700")

	// start the server
	server.Serve(router, port, serverConfig, func() {
		health.SetIsReadyGlobally()
	})
}
