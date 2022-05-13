package app

import (
	"context"
	"encoding/json"
	"fmt"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/feature/dynamodb/attributevalue"
	"github.com/aws/aws-sdk-go-v2/feature/dynamodb/expression"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb"
)

var (
	SESSION_TABLE_NAME     string = "journey3sessions"
	SESSION_TABLE_KEY      string = "Key"
	SESSION_TABLE_SORT_KEY string = "SortKey"
	SESSION_TABLE_VAL_ATTR string = "Val"
)

// TODO: probably need to return SortKey somehow too, if I want to use it as a session id
type journeySessionData struct {
	Id            string   `json:"id"`
	Start         string   `json:"start"`
	End           string   `json:"end"`
	Version       string   `json:"version"`
	FirstLaunch   bool     `json:"fst_launch"`
	HasError      bool     `json:"has_error"`
	HasCrash      bool     `json:"has_crash"`
	EventSequence []string `json:"evt_seq"`
}

type sessionItem struct {
	SortKey string
	Val     string
}

func getSessions(
	appId string,
	build string,
	errorLevel string,
	version string) ([]journeySessionData, error) {
	// get service
	cfg, err := config.LoadDefaultConfig(context.TODO())
	if err != nil {
		return nil, logAndConvertError(err)
	}
	svc := dynamodb.NewFromConfig(cfg)

	versionSelector := version + "#"
	if version == "all" {
		versionSelector = ""
	}

	// define keys
	hashKey := getHashKey("SESSION", appId, build)
	sortKeyPrefix := fmt.Sprintf("%s#%s", errorLevel, versionSelector)

	// build expression
	projection := expression.NamesList(
		expression.Name(SESSION_TABLE_SORT_KEY),
		expression.Name(SESSION_TABLE_VAL_ATTR))
	expr, err := expression.NewBuilder().WithKeyCondition(
		expression.Key(SESSION_TABLE_KEY).Equal(expression.Value(hashKey)).And(
			expression.KeyBeginsWith(expression.Key(SESSION_TABLE_SORT_KEY), sortKeyPrefix)),
	).WithProjection(projection).Build()
	if err != nil {
		return nil, logAndConvertError(err)
	}

	var limit int32 = 50

	// query input
	input := &dynamodb.QueryInput{
		TableName:                 aws.String(SESSION_TABLE_NAME),
		ExpressionAttributeNames:  expr.Names(),
		ExpressionAttributeValues: expr.Values(),
		KeyConditionExpression:    expr.KeyCondition(),
		ProjectionExpression:      expr.Projection(),
		Limit:                     &limit,
		ScanIndexForward:          aws.Bool(false),
	}

	// run query
	result, err := svc.Query(context.TODO(), input)
	if err != nil {
		return nil, logAndConvertError(err)
	}

	// repack results
	sessions := make([]journeySessionData, 0, len(result.Items))
	for _, v := range result.Items {
		item := sessionItem{}

		err := attributevalue.UnmarshalMap(v, &item)
		if err != nil {
			return nil, logAndConvertError(err)
		}

		session := journeySessionData{}
		err = json.Unmarshal([]byte(item.Val), &session)
		if err != nil {
			return nil, logAndConvertError(err)
		}

		sessions = append(sessions, session)
	}

	return sessions, nil
}
