package app

import (
	"context"
	"errors"
	"fmt"
	"time"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/feature/dynamodb/attributevalue"
	"github.com/aws/aws-sdk-go-v2/feature/dynamodb/expression"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb/types"
	"github.com/google/uuid"
)

var (
	APP_TABLE_NAME             string = "journey3app"
	APP_TABLE_KEY              string = "Key"
	APP_TABLE_SORT_KEY         string = "SortKey"
	APP_TABLE_USER_ACC_ID_ATTR string = "acc"
	APP_TABLE_USER_EMAIL_ATTR  string = "email"
	APP_TABLE_USER_APPS_ATTR   string = "apps"
	APP_TABLE_APP_NAME_ATTR    string = "name"
	APP_TABLE_CREATED_AT_ATTR  string = "createdAt"
	APP_TABLE_UPDATED_AT_ATTR  string = "udpatedAt"
)

type userAppsItem struct {
	Apps []string
}

type userAccIdItem struct {
	Acc string
}

type userAccItem struct {
	Acc  string
	Apps []string
}

type userAppMetadataItem struct {
	SortKey string
	Name    string
}

func canRead(userId string, appId string) (bool, error) {
	// TODO: for now, sharing app with someone else is not implemented,
	// TODO: so if you can write, you can read too
	return canWrite(userId, appId)
}

func canWrite(userId string, appId string) (bool, error) {
	appIds, err := getUserApps(userId)
	if err != nil {
		return false, logAndConvertError(err)
	}

	return contains(appIds, appId), nil
}

func generateNewAccId() string {
	return uuid.New().String()
}

func generateNewAppId(accId string) string {
	return uuid.New().String()
}

func generateTimestamp() string {
	return time.Now().Format(time.RFC3339)
}

func ensureUserExists(userId string, email string, newAccId string, defaultAppId string, createdAt string) (bool, error) {
	// get service
	cfg, err := config.LoadDefaultConfig(context.TODO())
	if err != nil {
		return false, logAndConvertError(err)
	}
	svc := dynamodb.NewFromConfig(cfg)

	// define keys
	hashKey := "USER"
	sortKey := userId

	// query expression
	expr, err := expression.NewBuilder().WithCondition(
		expression.And(
			expression.AttributeNotExists(expression.Name(APP_TABLE_KEY)),
			expression.AttributeNotExists(expression.Name(APP_TABLE_SORT_KEY))),
	).Build()
	if err != nil {
		return false, logAndConvertError(err)
	}

	// query input
	input := &dynamodb.PutItemInput{
		TableName: aws.String(APP_TABLE_NAME),
		Item: map[string]types.AttributeValue{
			APP_TABLE_KEY:              &types.AttributeValueMemberS{Value: hashKey},
			APP_TABLE_SORT_KEY:         &types.AttributeValueMemberS{Value: sortKey},
			APP_TABLE_USER_EMAIL_ATTR:  &types.AttributeValueMemberS{Value: email},
			APP_TABLE_USER_ACC_ID_ATTR: &types.AttributeValueMemberS{Value: newAccId},
			APP_TABLE_USER_APPS_ATTR:   &types.AttributeValueMemberSS{Value: []string{defaultAppId}},
			APP_TABLE_CREATED_AT_ATTR:  &types.AttributeValueMemberS{Value: createdAt},
		},
		ConditionExpression:       expr.Condition(),
		ExpressionAttributeNames:  expr.Names(),
		ExpressionAttributeValues: expr.Values(),
		ReturnValues:              types.ReturnValueNone,
	}

	// run query
	_, err = svc.PutItem(context.TODO(), input)
	if err != nil {
		var ccfe *types.ConditionalCheckFailedException
		if errors.As(err, &ccfe) {
			// User already exists
			return false, nil
		}
		return false, logAndConvertError(err)
	}

	return true, nil
}

func getUserAccId(userId string) (string, error) {
	// get service
	cfg, err := config.LoadDefaultConfig(context.TODO())
	if err != nil {
		return "", logAndConvertError(err)
	}
	svc := dynamodb.NewFromConfig(cfg)

	// define keys
	hashKey := "USER"
	sortKey := userId

	// query expression
	projection := expression.NamesList(expression.Name(APP_TABLE_USER_ACC_ID_ATTR))
	expr, err := expression.NewBuilder().WithProjection(projection).Build()
	if err != nil {
		return "", logAndConvertError(err)
	}

	// query input
	input := &dynamodb.GetItemInput{
		TableName: aws.String(APP_TABLE_NAME),
		Key: map[string]types.AttributeValue{
			APP_TABLE_KEY:      &types.AttributeValueMemberS{Value: hashKey},
			APP_TABLE_SORT_KEY: &types.AttributeValueMemberS{Value: sortKey},
		},
		ExpressionAttributeNames: expr.Names(),
		ProjectionExpression:     expr.Projection(),
	}

	// run query
	result, err := svc.GetItem(context.TODO(), input)
	if err != nil {
		return "", logAndConvertError(err)
	}

	// re-pack the results
	item := userAccIdItem{}
	err = attributevalue.UnmarshalMap(result.Item, &item)
	if err != nil {
		return "", logAndConvertError(err)
	}

	return item.Acc, nil
}

func getUserApps(userId string) ([]string, error) {
	// get service
	cfg, err := config.LoadDefaultConfig(context.TODO())
	if err != nil {
		return nil, logAndConvertError(err)
	}
	svc := dynamodb.NewFromConfig(cfg)

	// define keys
	hashKey := "USER"
	sortKey := userId

	// query expression
	projection := expression.NamesList(expression.Name(APP_TABLE_USER_APPS_ATTR))
	expr, err := expression.NewBuilder().WithProjection(projection).Build()
	if err != nil {
		return nil, logAndConvertError(err)
	}

	// query input
	input := &dynamodb.GetItemInput{
		TableName: aws.String(APP_TABLE_NAME),
		Key: map[string]types.AttributeValue{
			APP_TABLE_KEY:      &types.AttributeValueMemberS{Value: hashKey},
			APP_TABLE_SORT_KEY: &types.AttributeValueMemberS{Value: sortKey},
		},
		ExpressionAttributeNames: expr.Names(),
		ProjectionExpression:     expr.Projection(),
	}

	// run query
	result, err := svc.GetItem(context.TODO(), input)
	if err != nil {
		return nil, logAndConvertError(err)
	}

	// re-pack the results
	item := userAppsItem{}
	err = attributevalue.UnmarshalMap(result.Item, &item)
	if err != nil {
		return nil, logAndConvertError(err)
	}

	return item.Apps, nil
}

func getUserAccIdAndApps(userId string) (string, []string, error) {
	// get service
	cfg, err := config.LoadDefaultConfig(context.TODO())
	if err != nil {
		return "", nil, logAndConvertError(err)
	}
	svc := dynamodb.NewFromConfig(cfg)

	// define keys
	hashKey := "USER"
	sortKey := userId

	// query expression
	projection := expression.NamesList(
		expression.Name(APP_TABLE_USER_ACC_ID_ATTR),
		expression.Name(APP_TABLE_USER_APPS_ATTR))
	expr, err := expression.NewBuilder().WithProjection(projection).Build()
	if err != nil {
		return "", nil, logAndConvertError(err)
	}

	// query input
	input := &dynamodb.GetItemInput{
		TableName: aws.String(APP_TABLE_NAME),
		Key: map[string]types.AttributeValue{
			APP_TABLE_KEY:      &types.AttributeValueMemberS{Value: hashKey},
			APP_TABLE_SORT_KEY: &types.AttributeValueMemberS{Value: sortKey},
		},
		ExpressionAttributeNames: expr.Names(),
		ProjectionExpression:     expr.Projection(),
	}

	// run query
	result, err := svc.GetItem(context.TODO(), input)
	if err != nil {
		return "", nil, logAndConvertError(err)
	}

	// re-pack the results
	item := userAccItem{}
	err = attributevalue.UnmarshalMap(result.Item, &item)
	if err != nil {
		return "", nil, logAndConvertError(err)
	}

	return item.Acc, item.Apps, nil
}

func addUserApp(userId string, appId string, appData postAppDataIn) error {
	// get service
	cfg, err := config.LoadDefaultConfig(context.TODO())
	if err != nil {
		return logAndConvertError(err)
	}
	svc := dynamodb.NewFromConfig(cfg)

	// define keys
	hashKey := "USER"
	sortKey := userId

	// query expression
	expr, err := expression.NewBuilder().WithUpdate(
		expression.Add(
			expression.Name(APP_TABLE_USER_APPS_ATTR),
			expression.Value(&types.AttributeValueMemberSS{Value: []string{appId}})),
	).Build()
	if err != nil {
		return logAndConvertError(err)
	}

	// query input
	input := &dynamodb.UpdateItemInput{
		TableName: aws.String(APP_TABLE_NAME),
		Key: map[string]types.AttributeValue{
			APP_TABLE_KEY:      &types.AttributeValueMemberS{Value: hashKey},
			APP_TABLE_SORT_KEY: &types.AttributeValueMemberS{Value: sortKey},
		},
		UpdateExpression:          expr.Update(),
		ExpressionAttributeNames:  expr.Names(),
		ExpressionAttributeValues: expr.Values(),
		ReturnValues:              types.ReturnValueNone,
	}

	// run query
	_, err = svc.UpdateItem(context.TODO(), input)
	if err != nil {
		return logAndConvertError(err)
	}

	return nil
}

func removeUserApp(userId string, appId string) error {
	// get service
	cfg, err := config.LoadDefaultConfig(context.TODO())
	if err != nil {
		return logAndConvertError(err)
	}
	svc := dynamodb.NewFromConfig(cfg)

	// define keys
	hashKey := "USER"
	sortKey := userId

	// query expression
	expr, err := expression.NewBuilder().WithUpdate(
		expression.Delete(
			expression.Name(APP_TABLE_USER_APPS_ATTR),
			expression.Value(&types.AttributeValueMemberSS{Value: []string{appId}})),
	).Build()
	if err != nil {
		return logAndConvertError(err)
	}

	// query input
	input := &dynamodb.UpdateItemInput{
		TableName: aws.String(APP_TABLE_NAME),
		Key: map[string]types.AttributeValue{
			APP_TABLE_KEY:      &types.AttributeValueMemberS{Value: hashKey},
			APP_TABLE_SORT_KEY: &types.AttributeValueMemberS{Value: sortKey},
		},
		UpdateExpression:          expr.Update(),
		ExpressionAttributeNames:  expr.Names(),
		ExpressionAttributeValues: expr.Values(),
		ReturnValues:              types.ReturnValueNone,
	}

	// run query
	_, err = svc.UpdateItem(context.TODO(), input)
	if err != nil {
		return logAndConvertError(err)
	}

	return nil
}

func getApp(accId string, appId string) (*appDataOut, error) {
	// get service
	cfg, err := config.LoadDefaultConfig(context.TODO())
	if err != nil {
		return nil, logAndConvertError(err)
	}
	svc := dynamodb.NewFromConfig(cfg)

	// define keys
	hashKey := fmt.Sprintf("APP#%s", accId)
	sortKey := appId

	// query expression
	projection := expression.NamesList(
		expression.Name(APP_TABLE_SORT_KEY),
		expression.Name(APP_TABLE_APP_NAME_ATTR))
	expr, err := expression.NewBuilder().WithProjection(projection).Build()
	if err != nil {
		return nil, logAndConvertError(err)
	}

	// query input
	input := &dynamodb.GetItemInput{
		TableName: aws.String(APP_TABLE_NAME),
		Key: map[string]types.AttributeValue{
			APP_TABLE_KEY:      &types.AttributeValueMemberS{Value: hashKey},
			APP_TABLE_SORT_KEY: &types.AttributeValueMemberS{Value: sortKey},
		},
		ExpressionAttributeNames: expr.Names(),
		ProjectionExpression:     expr.Projection(),
	}

	// run query
	result, err := svc.GetItem(context.TODO(), input)
	if err != nil {
		return nil, logAndConvertError(err)
	}

	// re-pack the results
	if result.Item == nil {
		return nil, nil
	}
	item := userAppMetadataItem{}
	err = attributevalue.UnmarshalMap(result.Item, &item)
	if err != nil {
		return nil, logAndConvertError(err)
	}
	app := appDataOut{
		Id:   item.SortKey,
		Name: item.Name,
	}

	return &app, nil
}

func getApps(accId string) (map[string]string, error) {
	// get service
	cfg, err := config.LoadDefaultConfig(context.TODO())
	if err != nil {
		return nil, logAndConvertError(err)
	}
	svc := dynamodb.NewFromConfig(cfg)

	// define keys
	hashKey := fmt.Sprintf("APP#%s", accId)

	// query expression
	projection := expression.NamesList(
		expression.Name(APP_TABLE_SORT_KEY),
		expression.Name(APP_TABLE_APP_NAME_ATTR))
	expr, err := expression.NewBuilder().WithKeyCondition(
		expression.Key(APP_TABLE_KEY).Equal(expression.Value(hashKey)),
	).WithProjection(projection).Build()
	if err != nil {
		return nil, logAndConvertError(err)
	}

	input := &dynamodb.QueryInput{
		TableName:                 aws.String(APP_TABLE_NAME),
		ExpressionAttributeNames:  expr.Names(),
		ExpressionAttributeValues: expr.Values(),
		KeyConditionExpression:    expr.KeyCondition(),
		ProjectionExpression:      expr.Projection(),
	}

	// run query
	result, err := svc.Query(context.TODO(), input)
	if err != nil {
		return nil, logAndConvertError(err)
	}

	// re-pack the results
	apps := make(map[string]string, len(result.Items))
	for _, v := range result.Items {
		item := userAppMetadataItem{}

		err = attributevalue.UnmarshalMap(v, &item)
		if err != nil {
			return nil, logAndConvertError(err)
		}

		apps[item.SortKey] = item.Name
	}

	// done
	return apps, nil
}

func createApp(accId string, appId string, appName string, createdAt string) error {
	// get service
	cfg, err := config.LoadDefaultConfig(context.TODO())
	if err != nil {
		return logAndConvertError(err)
	}
	svc := dynamodb.NewFromConfig(cfg)

	// define keys
	hashKey := fmt.Sprintf("APP#%s", accId)
	sortKey := appId

	// query input
	input := &dynamodb.PutItemInput{
		TableName: aws.String(APP_TABLE_NAME),
		Item: map[string]types.AttributeValue{
			APP_TABLE_KEY:             &types.AttributeValueMemberS{Value: hashKey},
			APP_TABLE_SORT_KEY:        &types.AttributeValueMemberS{Value: sortKey},
			APP_TABLE_APP_NAME_ATTR:   &types.AttributeValueMemberS{Value: appName},
			APP_TABLE_CREATED_AT_ATTR: &types.AttributeValueMemberS{Value: createdAt},
		},
		ReturnValues: types.ReturnValueNone,
	}

	// run query
	_, err = svc.PutItem(context.TODO(), input)
	if err != nil {
		return logAndConvertError(err)
	}

	// done
	return nil
}

func updateApp(accId string, appId string, appName string, updatedAt string) (bool, error) {
	// get service
	cfg, err := config.LoadDefaultConfig(context.TODO())
	if err != nil {
		return false, logAndConvertError(err)
	}
	svc := dynamodb.NewFromConfig(cfg)

	// define keys
	hashKey := fmt.Sprintf("APP#%s", accId)
	sortKey := appId

	// query expression
	expr, err := expression.NewBuilder().WithUpdate(
		expression.Set(
			expression.Name(APP_TABLE_APP_NAME_ATTR),
			expression.Value(appName)).Set(
			expression.Name(APP_TABLE_UPDATED_AT_ATTR),
			expression.Value(updatedAt)),
	).WithCondition(
		expression.And(
			expression.AttributeExists(expression.Name(APP_TABLE_KEY)),
			expression.AttributeExists(expression.Name(APP_TABLE_SORT_KEY))),
	).Build()
	if err != nil {
		return false, logAndConvertError(err)
	}

	// query input
	input := &dynamodb.UpdateItemInput{
		TableName: aws.String(APP_TABLE_NAME),
		Key: map[string]types.AttributeValue{
			APP_TABLE_KEY:      &types.AttributeValueMemberS{Value: hashKey},
			APP_TABLE_SORT_KEY: &types.AttributeValueMemberS{Value: sortKey},
		},
		UpdateExpression:          expr.Update(),
		ConditionExpression:       expr.Condition(),
		ExpressionAttributeNames:  expr.Names(),
		ExpressionAttributeValues: expr.Values(),
		ReturnValues:              types.ReturnValueNone,
	}

	// run query
	_, err = svc.UpdateItem(context.TODO(), input)
	if err != nil {
		var ccfe *types.ConditionalCheckFailedException
		if errors.As(err, &ccfe) {
			// User already exists
			return false, nil
		}
		return false, logAndConvertError(err)
	}

	return true, nil
}

func deleteApp(accId string, appId string) (bool, error) {
	// get service
	cfg, err := config.LoadDefaultConfig(context.TODO())
	if err != nil {
		return false, logAndConvertError(err)
	}
	svc := dynamodb.NewFromConfig(cfg)

	// define keys
	hashKey := fmt.Sprintf("APP#%s", accId)
	sortKey := appId

	// query expression
	expr, err := expression.NewBuilder().WithCondition(
		expression.And(
			expression.AttributeExists(expression.Name(APP_TABLE_KEY)),
			expression.AttributeExists(expression.Name(APP_TABLE_SORT_KEY))),
	).Build()
	if err != nil {
		return false, logAndConvertError(err)
	}

	// query input
	input := &dynamodb.DeleteItemInput{
		TableName: aws.String(APP_TABLE_NAME),
		Key: map[string]types.AttributeValue{
			APP_TABLE_KEY:      &types.AttributeValueMemberS{Value: hashKey},
			APP_TABLE_SORT_KEY: &types.AttributeValueMemberS{Value: sortKey},
		},
		ConditionExpression:       expr.Condition(),
		ExpressionAttributeNames:  expr.Names(),
		ExpressionAttributeValues: expr.Values(),
	}

	// run query
	_, err = svc.DeleteItem(context.TODO(), input)
	if err != nil {
		var ccfe *types.ConditionalCheckFailedException
		if errors.As(err, &ccfe) {
			// User already exists
			return false, nil
		}
		return false, logAndConvertError(err)
	}

	return true, nil
}

func contains(ss []string, s string) bool {
	for _, x := range ss {
		if x == s {
			return true
		}
	}
	return false
}
