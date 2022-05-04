package app

import (
	"context"
	"fmt"
	"strings"
	"time"

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
	Dt      string `json:"dt"`
	Version string `json:"version"`
	Count   int    `json:"count"`
}

type eventStatsData struct {
	Dt      string `json:"dt"`
	Version string `json:"version"`
	Event   string `json:"evt"`
	Count   int    `json:"count"`
}

type retentionOnDayStatsData struct {
	Bucket  string `json:"bucket"`
	Version string `json:"version"`
	Count   int    `json:"count"`
}

type retentionSinceDayStatsData struct {
	Dt      string `json:"dt"`
	Bucket  string `json:"bucket"`
	Version string `json:"version"`
	Count   int    `json:"count"`
}

type conversionStatsData struct {
	Stage   string `json:"stage"`
	Version string `json:"version"`
	Count   int    `json:"count"`
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

func getEventsPerPeriod(appId string, build string, period string, dt string) ([]eventStatsData, error) {
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

func getEventSessionsPerPeriod(appId string, build string, period string, dt string) ([]eventStatsData, error) {
	// define keys
	keyPrefix, err := getEventSessionsByPeriodKeyPrefix(period)
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

func getRetentionOnDayPerBucket(appId string, build string, dt string) ([]retentionOnDayStatsData, error) {
	hashKey := getHashKey("RETENTION_ON", appId, build)
	sortKeyPrefix := dt

	// run query
	results, err := executeQuery(hashKey, sortKeyPrefix)
	if err != nil {
		return nil, logAndConvertError(err)
	}

	// re-pack the results
	stats, err := repackResultsByBucketVersionIntoRetentionOnDayStatsData(results)
	if err != nil {
		return nil, logAndConvertError(err)
	}

	// done
	return stats, nil
}

func getRetentionSinceDayPerBucket(appId string, build string, dt string) ([]retentionSinceDayStatsData, error) {
	hashKey := getHashKey("RETENTION_SINCE", appId, build)

	// 90 days preceding the passed date
	to, err := time.Parse("20060102", dt)
	if err != nil {
		return nil, logAndConvertError(err)
	}
	from := to.AddDate(0, 0, -90)

	// run query
	results, err := executeRangeQuery(hashKey, from.Format("20060102"), to.Format("20060102"))
	if err != nil {
		return nil, logAndConvertError(err)
	}

	// re-pack the results
	stats, err := repackResultsByBucketVersionIntoRetentionSinceDayStatsData(results)
	if err != nil {
		return nil, logAndConvertError(err)
	}

	// done
	return stats, nil
}

func getConversionsPerStage(appId string, build string, period string, dt string) ([]conversionStatsData, error) {
	keyPrefix, err := getConversionsKeyPrefix(period)
	if err != nil {
		return nil, logAndConvertError(err)
	}
	hashKey := getHashKey(keyPrefix, appId, build)
	sortKeyPrefix := dt

	fmt.Printf("HASH: %s\n", hashKey)

	// run query
	results, err := executeQuery(hashKey, sortKeyPrefix)
	if err != nil {
		return nil, logAndConvertError(err)
	}

	// re-pack the results
	stats, err := repackResultsByStageVersionIntoConversionStatsData(results)
	if err != nil {
		return nil, logAndConvertError(err)
	}

	// done
	return stats, nil
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

func getEventSessionsByPeriodKeyPrefix(period string) (string, error) {
	if period == "year" {
		return "EVENT_SESSIONS_BY_MONTH", nil
	}
	if period == "month" {
		return "EVENT_SESSIONS_BY_DAY", nil
	}
	if period == "day" {
		return "EVENT_SESSIONS_BY_HOUR", nil
	}

	err := fmt.Errorf("unknown period '%s', expected 'year', 'month' or 'day'", period)
	return "", err
}

func getConversionsKeyPrefix(period string) (string, error) {
	if period == "year" {
		return "CONVERSIONS_BY_YEAR", nil
	}
	if period == "month" {
		return "CONVERSIONS_BY_MONTH", nil
	}
	if period == "day" {
		return "CONVERSIONS_BY_DAY", nil
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

func splitIntoDtBucketVersion(key string) (string, string, string) {
	parts := strings.Split(key, "#")
	dt := parts[0]
	bucket := "unknown"
	vesion := "unknown"
	if len(parts) > 1 {
		bucket = parts[1]
	}
	if len(parts) > 2 {
		vesion = parts[2]
	}
	return dt, bucket, vesion
}

func splitIntoDtStageVersion(key string) (string, string, string) {
	parts := strings.Split(key, "#")
	dt := parts[0]
	stage := "unknown"
	vesion := "unknown"
	if len(parts) > 1 {
		stage = parts[1]
	}
	if len(parts) > 2 {
		vesion = parts[2]
	}
	return dt, stage, vesion
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

func executeRangeQuery(hashKey string, lower string, upper string) (*dynamodb.QueryOutput, error) {
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
			expression.KeyBetween(
				expression.Key(STATS_TABLE_SORT_KEY),
				expression.Value(lower),
				expression.Value(upper))),
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

		dt, version := splitIntoDtVersion(item.SortKey)

		statsItem := statsData{
			Dt:      dt,
			Version: version,
			Count:   item.Cnt,
		}
		stats = append(stats, statsItem)
	}
	return stats, nil
}

func repackResultsByDtEventVersionIntoEventData(results *dynamodb.QueryOutput) ([]eventStatsData, error) {
	stats := make([]eventStatsData, 0, len(results.Items))
	for _, v := range results.Items {
		item := statsItem{}

		err := attributevalue.UnmarshalMap(v, &item)
		if err != nil {
			return nil, err
		}

		dt, event, version := splitIntoDtEventVersion(item.SortKey)

		statsItem := eventStatsData{
			Dt:      dt,
			Version: version,
			Event:   event,
			Count:   item.Cnt,
		}
		stats = append(stats, statsItem)
	}
	return stats, nil
}

func repackResultsByBucketVersionIntoRetentionOnDayStatsData(results *dynamodb.QueryOutput) ([]retentionOnDayStatsData, error) {
	stats := make([]retentionOnDayStatsData, 0, len(results.Items))
	for _, v := range results.Items {
		item := statsItem{}

		err := attributevalue.UnmarshalMap(v, &item)
		if err != nil {
			return nil, err
		}

		_, bucket, version := splitIntoDtBucketVersion(item.SortKey)

		statsItem := retentionOnDayStatsData{
			Bucket:  bucket,
			Version: version,
			Count:   item.Cnt,
		}
		stats = append(stats, statsItem)
	}
	return stats, nil
}

func repackResultsByBucketVersionIntoRetentionSinceDayStatsData(results *dynamodb.QueryOutput) ([]retentionSinceDayStatsData, error) {
	stats := make([]retentionSinceDayStatsData, 0, len(results.Items))
	for _, v := range results.Items {
		item := statsItem{}

		err := attributevalue.UnmarshalMap(v, &item)
		if err != nil {
			return nil, err
		}

		dt, bucket, version := splitIntoDtBucketVersion(item.SortKey)

		statsItem := retentionSinceDayStatsData{
			Dt:      dt,
			Bucket:  bucket,
			Version: version,
			Count:   item.Cnt,
		}
		stats = append(stats, statsItem)
	}
	return stats, nil
}

func repackResultsByStageVersionIntoConversionStatsData(results *dynamodb.QueryOutput) ([]conversionStatsData, error) {
	stats := make([]conversionStatsData, 0, len(results.Items))
	for _, v := range results.Items {
		item := statsItem{}

		err := attributevalue.UnmarshalMap(v, &item)
		if err != nil {
			return nil, err
		}

		_, stage, version := splitIntoDtStageVersion(item.SortKey)

		statsItem := conversionStatsData{
			Stage:   stage,
			Version: version,
			Count:   item.Cnt,
		}
		stats = append(stats, statsItem)
	}
	return stats, nil
}

func logAndConvertError(err error) error {
	log.Printf("%v", err)
	return fmt.Errorf("service unavailable")
}
