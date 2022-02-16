package app

import (
	"context"
	"fmt"

	log "github.com/sirupsen/logrus"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/feature/dynamodb/attributevalue"
	"github.com/aws/aws-sdk-go-v2/feature/dynamodb/expression"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb"
)

var (
	STATS_TABLE_NAME     string = "journey3stats"
	STATS_TABLE_KEY      string = "Key"
	STATS_TABLE_SORT_KEY string = "SortKey"
	STATS_TABLE_CNT_ATTR string = "Cnt"
)

type statsItem struct {
	SortKey string
	Cnt     int
}

type statsData struct {
	Dt    string `json:"dt"`
	Count int    `json:"count"`
}

func getAppLaunchStats(appId string, period string, dt string) ([]statsData, error) {
	// get service
	cfg, err := config.LoadDefaultConfig(context.TODO())
	if err != nil {
		return nil, logAndConvertError(err)
	}
	svc := dynamodb.NewFromConfig(cfg)

	// define keys
	keyPrefix, err := getAppLaunchesByPeriodKeyPrefix(period)
	if err != nil {
		return nil, logAndConvertError(err)
	}
	hashKey := fmt.Sprintf("%s#%s", keyPrefix, appId)
	sortKeyPrefix := dt

	// query expression
	projection := expression.NamesList(
		expression.Name(STATS_TABLE_SORT_KEY),
		expression.Name(STATS_TABLE_CNT_ATTR))
	expr, err := expression.NewBuilder().WithKeyCondition(
		expression.Key(STATS_TABLE_KEY).Equal(expression.Value(hashKey)).And(
			expression.KeyBeginsWith(expression.Key(STATS_TABLE_SORT_KEY), sortKeyPrefix)),
	).WithProjection(projection).Build()
	if err != nil {
		return nil, logAndConvertError(err)
	}

	// query input
	input := &dynamodb.QueryInput{
		TableName:                 aws.String(STATS_TABLE_NAME),
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
	stats := make([]statsData, 0, len(result.Items))
	for _, v := range result.Items {
		item := statsItem{}

		err = attributevalue.UnmarshalMap(v, &item)
		if err != nil {
			return nil, logAndConvertError(err)
		}

		statsItem := statsData{
			Dt:    item.SortKey,
			Count: item.Cnt,
		}
		stats = append(stats, statsItem)
	}

	// done
	return stats, nil
}

func getAppLaunchesByPeriodKeyPrefix(period string) (string, error) {
	if period == "year" {
		return "APP_LAUNCH_CNT_BY_MONTH", nil
	}
	if period == "month" {
		return "APP_LAUNCH_CNT_BY_DAY", nil
	}
	if period == "day" {
		return "APP_LAUNCH_CNT_BY_HOUR", nil
	}

	err := fmt.Errorf("unknown period '%s', expected 'year', 'month' or 'day'", period)
	return "", err
}

func logAndConvertError(err error) error {
	log.Printf("%v", err)
	return fmt.Errorf("service unavailable")
}
