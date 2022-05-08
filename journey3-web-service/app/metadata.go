package app

import (
	"context"
	"fmt"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/feature/dynamodb/attributevalue"
	"github.com/aws/aws-sdk-go-v2/feature/dynamodb/expression"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb"
)

var (
	META_TABLE_NAME     string = "journey3meta"
	META_TABLE_KEY      string = "Key"
	META_TABLE_SORT_KEY string = "SortKey"
	META_TABLE_VAL_ATTR string = "Val"
)

type metaItem struct {
	SortKey string
	Val     string
}

type stageData struct {
	Stage string `json:"stage"`
	Name  string `json:"name"`
}

func getStages(appId string, build string) ([]stageData, error) {
	hashKey := getHashKey("STAGES", appId, build)

	fmt.Printf("HASH: %s\n", hashKey)

	// run query
	results, err := executeMetaQuery(hashKey)
	if err != nil {
		return nil, logAndConvertError(err)
	}

	// re-pack the results
	stages, err := repackResultsByStageIntoStageData(results)
	if err != nil {
		return nil, logAndConvertError(err)
	}

	// done
	return stages, nil
}

func repackResultsByStageIntoStageData(results *dynamodb.QueryOutput) ([]stageData, error) {
	stages := make([]stageData, 0, len(results.Items))
	for _, v := range results.Items {
		item := metaItem{}

		err := attributevalue.UnmarshalMap(v, &item)
		if err != nil {
			return nil, err
		}

		stage := stageData{
			Stage: item.SortKey,
			Name:  item.Val,
		}
		stages = append(stages, stage)
	}
	return stages, nil
}

func executeMetaQuery(hashKey string) (*dynamodb.QueryOutput, error) {
	// get service
	cfg, err := config.LoadDefaultConfig(context.TODO())
	if err != nil {
		return nil, err
	}
	svc := dynamodb.NewFromConfig(cfg)

	// build expression
	projection := expression.NamesList(
		expression.Name(META_TABLE_SORT_KEY),
		expression.Name(META_TABLE_VAL_ATTR))
	expr, err := expression.NewBuilder().WithKeyCondition(
		expression.Key(META_TABLE_KEY).Equal(expression.Value(hashKey)),
	).WithProjection(projection).Build()
	if err != nil {
		return nil, err
	}

	// query input
	input := &dynamodb.QueryInput{
		TableName:                 aws.String(META_TABLE_NAME),
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
