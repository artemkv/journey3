package app

import (
	"context"
	"fmt"
	"strings"

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

type eventData struct {
	Event string      `json:"evt"`
	Stats []statsData `json:"stats"`
}

func getSessionsPerPeriod(appId string, build string, period string, dt string) ([]statsData, error) {
	// define keys
	keyPrefix, err := getSessionsByPeriodKeyPrefix(period)
	if err != nil {
		return nil, logAndConvertError(err)
	}
	hashKey := getHashKey(keyPrefix, appId, build)
	sortKeyPrefix := dt

	// run query
	results, err := executeQuery(hashKey, sortKeyPrefix)
	if err != nil {
		return nil, logAndConvertError(err)
	}

	// re-pack the results
	stats, err := repackResultsByDtVersionIntoStatsData(results)
	if err != nil {
		return nil, logAndConvertError(err)
	}

	// done
	return stats, nil
}

func getErrorSessionsPerPeriod(appId string, build string, period string, dt string) ([]statsData, error) {
	// define keys
	keyPrefix, err := getErrorSessionsByPeriodKeyPrefix(period)
	if err != nil {
		return nil, logAndConvertError(err)
	}
	hashKey := getHashKey(keyPrefix, appId, build)
	sortKeyPrefix := dt

	// run query
	results, err := executeQuery(hashKey, sortKeyPrefix)
	if err != nil {
		return nil, logAndConvertError(err)
	}

	// re-pack the results
	stats, err := repackResultsByDtVersionIntoStatsData(results)
	if err != nil {
		return nil, logAndConvertError(err)
	}

	// done
	return stats, nil
}

func getUniqueUsersPerPeriod(appId string, build string, period string, dt string) ([]statsData, error) {
	// define keys
	keyPrefix, err := getUniqueUsersByPeriodKeyPrefix(period)
	if err != nil {
		return nil, logAndConvertError(err)
	}
	hashKey := getHashKey(keyPrefix, appId, build)
	sortKeyPrefix := dt

	// run query
	results, err := executeQuery(hashKey, sortKeyPrefix)
	if err != nil {
		return nil, logAndConvertError(err)
	}

	// re-pack the results
	stats, err := repackResultsByDtVersionIntoStatsData(results)
	if err != nil {
		return nil, logAndConvertError(err)
	}

	// done
	return stats, nil
}

func getNewUsersPerPeriod(appId string, build string, period string, dt string) ([]statsData, error) {
	// define keys
	keyPrefix, err := getNewUsersByPeriodKeyPrefix(period)
	if err != nil {
		return nil, logAndConvertError(err)
	}
	hashKey := getHashKey(keyPrefix, appId, build)
	sortKeyPrefix := dt

	// run query
	results, err := executeQuery(hashKey, sortKeyPrefix)
	if err != nil {
		return nil, logAndConvertError(err)
	}

	// re-pack the results
	stats, err := repackResultsByDtVersionIntoStatsData(results)
	if err != nil {
		return nil, logAndConvertError(err)
	}

	// done
	return stats, nil
}

func getEventsPerPeriod(appId string, build string, period string, dt string) ([]eventData, error) {
	// define keys
	keyPrefix, err := getEventsByPeriodKeyPrefix(period)
	if err != nil {
		return nil, logAndConvertError(err)
	}
	hashKey := getHashKey(keyPrefix, appId, build)
	sortKeyPrefix := dt

	// run query
	results, err := executeQuery(hashKey, sortKeyPrefix)
	if err != nil {
		return nil, logAndConvertError(err)
	}

	// re-pack the results
	events, err := repackResultsByDtEventVersionIntoEventData(results)
	if err != nil {
		return nil, logAndConvertError(err)
	}

	// done
	return events, nil
}

func getSessionsByPeriodKeyPrefix(period string) (string, error) {
	if period == "year" {
		return "SESSIONS_BY_MONTH", nil
	}
	if period == "month" {
		return "SESSIONS_BY_DAY", nil
	}
	if period == "day" {
		return "SESSIONS_BY_HOUR", nil
	}

	err := fmt.Errorf("unknown period '%s', expected 'year', 'month' or 'day'", period)
	return "", err
}

func getErrorSessionsByPeriodKeyPrefix(period string) (string, error) {
	if period == "year" {
		return "ERROR_SESSIONS_BY_MONTH", nil
	}
	if period == "month" {
		return "ERROR_SESSIONS_BY_DAY", nil
	}
	if period == "day" {
		return "ERROR_SESSIONS_BY_HOUR", nil
	}

	err := fmt.Errorf("unknown period '%s', expected 'year', 'month' or 'day'", period)
	return "", err
}

func getUniqueUsersByPeriodKeyPrefix(period string) (string, error) {
	if period == "year" {
		return "UNIQUE_USERS_BY_MONTH", nil
	}
	if period == "month" {
		return "UNIQUE_USERS_BY_DAY", nil
	}
	if period == "day" {
		return "UNIQUE_USERS_BY_HOUR", nil
	}

	err := fmt.Errorf("unknown period '%s', expected 'year', 'month' or 'day'", period)
	return "", err
}

func getNewUsersByPeriodKeyPrefix(period string) (string, error) {
	if period == "year" {
		return "NEW_USERS_BY_MONTH", nil
	}
	if period == "month" {
		return "NEW_USERS_BY_DAY", nil
	}
	if period == "day" {
		return "NEW_USERS_BY_HOUR", nil
	}

	err := fmt.Errorf("unknown period '%s', expected 'year', 'month' or 'day'", period)
	return "", err
}

func getEventsByPeriodKeyPrefix(period string) (string, error) {
	if period == "year" {
		return "EVENTS_BY_MONTH", nil
	}
	if period == "month" {
		return "EVENTS_BY_DAY", nil
	}
	if period == "day" {
		return "EVENTS_BY_HOUR", nil
	}

	err := fmt.Errorf("unknown period '%s', expected 'year', 'month' or 'day'", period)
	return "", err
}

func splitIntoDtVersion(key string) (string, string) {
	parts := strings.Split(key, "#")
	dt := parts[0]
	vesion := "unknown"
	if len(parts) > 1 {
		vesion = parts[1]
	}
	return dt, vesion
}

func splitIntoDtEventVersion(key string) (string, string, string) {
	parts := strings.Split(key, "#")
	dt := parts[0]
	event := "unknown"
	if len(parts) > 1 {
		event = parts[1]
	}
	vesion := "unknown"
	if len(parts) > 2 {
		vesion = parts[2]
	}
	return dt, event, vesion
}

func getHashKey(keyPrefix string, appId string, build string) string {
	return fmt.Sprintf("%s#%s#%s", keyPrefix, appId, build)
}

func executeQuery(hashKey string, sortKeyPrefix string) (*dynamodb.QueryOutput, error) {
	// get service
	cfg, err := config.LoadDefaultConfig(context.TODO())
	if err != nil {
		return nil, err
	}
	svc := dynamodb.NewFromConfig(cfg)

	// build expression
	projection := expression.NamesList(
		expression.Name(STATS_TABLE_SORT_KEY),
		expression.Name(STATS_TABLE_CNT_ATTR))
	expr, err := expression.NewBuilder().WithKeyCondition(
		expression.Key(STATS_TABLE_KEY).Equal(expression.Value(hashKey)).And(
			expression.KeyBeginsWith(expression.Key(STATS_TABLE_SORT_KEY), sortKeyPrefix)),
	).WithProjection(projection).Build()
	if err != nil {
		return nil, err
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
		return nil, err
	}
	return result, nil
}

func repackResultsByDtVersionIntoStatsData(results *dynamodb.QueryOutput) ([]statsData, error) {
	stats := make([]statsData, 0, len(results.Items))
	for _, v := range results.Items {
		item := statsItem{}

		err := attributevalue.UnmarshalMap(v, &item)
		if err != nil {
			return nil, err
		}

		dt, _ := splitIntoDtVersion(item.SortKey)

		statsItem := statsData{
			Dt:    dt,
			Count: item.Cnt,
		}
		stats = append(stats, statsItem)
	}
	return stats, nil
}

func repackResultsByDtEventVersionIntoEventData(results *dynamodb.QueryOutput) ([]eventData, error) {
	statsByEvent := make(map[string]eventData)
	for _, v := range results.Items {
		item := statsItem{}

		err := attributevalue.UnmarshalMap(v, &item)
		if err != nil {
			return nil, err
		}

		dt, event, _ := splitIntoDtEventVersion(item.SortKey)
		statsItem := statsData{
			Dt:    dt,
			Count: item.Cnt,
		}

		if _, ok := statsByEvent[event]; !ok {
			statsByEvent[event] = eventData{
				Event: event,
				Stats: make([]statsData, 0),
			}
		}
		eventStats := statsByEvent[event]
		eventStats.Stats = append(eventStats.Stats, statsItem)
		statsByEvent[event] = eventStats
	}

	events := make([]eventData, 0, len(statsByEvent))
	for _, v := range statsByEvent {
		events = append(events, v)
	}
	return events, nil
}

func logAndConvertError(err error) error {
	log.Printf("%v", err)
	return fmt.Errorf("service unavailable")
}
