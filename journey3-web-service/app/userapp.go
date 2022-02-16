package app

import (
	"fmt"

	"github.com/gin-gonic/gin"
)

type accountDataOut struct {
	AccountId string       `json:"acc"`
	Apps      []appDataOut `json:"apps"`
}

type appDataOut struct {
	Id   string `json:"aid"`
	Name string `json:"name"`
}

type postAppDataIn struct {
	Name string `json:"name" binding:"required"`
}

type putAppDataIn struct {
	Id   string `json:"aid" binding:"required"`
	Name string `json:"name" binding:"required"`
}

type appRefData struct {
	Id string `uri:"id" binding:"required"`
}

func handleGetAcc(c *gin.Context, userId string, _ string, accId string) {
	// retrieve apps users owns
	accId, apps, err := getUserAccIdAndApps(userId)
	if err != nil {
		toInternalServerError(c, err.Error())
		return
	}

	// retrieve metadata from the apps that are linked to the user account
	appsMetadata, err := getApps(accId)
	if err != nil {
		toInternalServerError(c, err.Error())
		return
	}

	// create response
	appsResponse := assembleGetUserAppsResponse(apps, appsMetadata)
	account := accountDataOut{
		AccountId: accId,
		Apps:      appsResponse,
	}
	toSuccess(c, account)
}

func handleGetApp(c *gin.Context, userId string, _ string, accId string) {
	// get app id from Url
	var appRef appRefData
	if err := c.ShouldBindUri(&appRef); err != nil {
		toBadRequest(c, err)
		return
	}

	// sanitize
	appId := appRef.Id
	if !isAppIdValid(appId) {
		err := fmt.Errorf("invalid value '%s' for 'aid', expected valid app id", appId)
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
	app, err := getApp(accId, appId)
	if err != nil {
		toInternalServerError(c, err.Error())
		return
	}

	// create response
	if app == nil {
		app = &appDataOut{
			Id:   appId,
			Name: "unknown",
		}
	}
	toSuccess(c, app)
}

func handleGetApps(c *gin.Context, userId string, _ string, accId string) {
	// retrieve apps users owns
	apps, err := getUserApps(userId)
	if err != nil {
		toInternalServerError(c, err.Error())
		return
	}

	// retrieve metadata from the apps that are linked to the user account
	appsMetadata, err := getApps(accId)
	if err != nil {
		toInternalServerError(c, err.Error())
		return
	}

	// create response
	response := assembleGetUserAppsResponse(apps, appsMetadata)
	toSuccess(c, response)
}

func handlePostApp(c *gin.Context, userId string, _ string, accId string) {
	// get app data from the POST body
	var app postAppDataIn
	if err := c.ShouldBindJSON(&app); err != nil {
		toBadRequest(c, err)
		return
	}

	// sanitize
	if !isAppNameValid(app.Name) {
		err := fmt.Errorf("invalid name '%s' for application", app.Name)
		toBadRequest(c, err)
		return
	}

	// add app to user
	appId := generateNewAppId(accId)
	createdAt := generateTimestamp()
	err := addUserApp(userId, appId, app)
	if err != nil {
		toInternalServerError(c, err.Error())
		return
	}

	// save app metadata
	// if this step fails, app will appear in the list but empty metadata will be shown,
	// forcing owner to do update again
	err = createApp(accId, appId, app.Name, createdAt)
	if err != nil {
		toInternalServerError(c, err.Error())
		return
	}

	// create response
	response := appDataOut{
		Id:   appId,
		Name: app.Name,
	}
	toCreated(c, response)
}

func handlePutApp(c *gin.Context, userId string, _ string, accId string) {
	// get app id from Url
	var appRef appRefData
	if err := c.ShouldBindUri(&appRef); err != nil {
		toBadRequest(c, err)
		return
	}

	// get app data from the POST body
	var app putAppDataIn
	if err := c.ShouldBindJSON(&app); err != nil {
		toBadRequest(c, err)
		return
	}

	// sanitize
	if appRef.Id != app.Id {
		err := fmt.Errorf("id in URL '%s' does not match id in POST body '%s'", appRef.Id, app.Id)
		toBadRequest(c, err)
		return
	}
	if !isAppIdValid(app.Id) {
		err := fmt.Errorf("invalid value '%s' for 'aid', expected valid app id", app.Id)
		toBadRequest(c, err)
		return
	}
	if !isAppNameValid(app.Name) {
		err := fmt.Errorf("invalid name '%s' for application, should be less than 100 chars long", app.Name)
		toBadRequest(c, err)
		return
	}

	// check access rights
	canWrite, err := canWrite(userId, app.Id)
	if !canWrite || err != nil {
		toUnauthorized(c)
		return
	}

	// try updating existing app
	updatedAt := generateTimestamp()
	updated, err := updateApp(accId, app.Id, app.Name, updatedAt)
	if err != nil {
		toInternalServerError(c, err.Error())
		return
	}

	// if not found, create new
	if !updated {
		createdAt := generateTimestamp()
		err = createApp(accId, app.Id, app.Name, createdAt)
		if err != nil {
			toInternalServerError(c, err.Error())
			return
		}
	}

	// create response
	response := appDataOut(app)
	toSuccess(c, response)
}

func handleDeleteApp(c *gin.Context, userId string, _ string, accId string) {
	// get app id from Url
	var appRef appRefData
	if err := c.ShouldBindUri(&appRef); err != nil {
		toBadRequest(c, err)
		return
	}

	// sanitize
	appId := appRef.Id
	if !isAppIdValid(appId) {
		err := fmt.Errorf("invalid value '%s' for 'aid', expected valid app id", appId)
		toBadRequest(c, err)
		return
	}

	// check access rights
	canWrite, err := canWrite(userId, appId)
	if !canWrite || err != nil {
		toUnauthorized(c)
		return
	}

	// delete the app
	_, err = deleteApp(accId, appId)
	if err != nil {
		toInternalServerError(c, err.Error())
		return
	}

	// remove the app from the user app list
	// if this step fails, app will appear in the list but empty metadata will be shown,
	// forcing owner to do delete again
	err = removeUserApp(userId, appId)
	if err != nil {
		toInternalServerError(c, err.Error())
		return
	}

	// create response
	toNoContent(c)
}

func assembleGetUserAppsResponse(apps []string, appsMetadata map[string]string) []appDataOut {
	response := make([]appDataOut, 0, len(apps))

	for _, appId := range apps {
		appName := "unknown"
		if name, ok := appsMetadata[appId]; ok {
			appName = name
		}

		response = append(response, appDataOut{
			Id:   appId,
			Name: appName,
		})
	}

	return response
}
