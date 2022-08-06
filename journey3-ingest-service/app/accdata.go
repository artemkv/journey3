package app

import (
	"context"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/feature/dynamodb/attributevalue"
	"github.com/aws/aws-sdk-go-v2/feature/dynamodb/expression"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb"
)

var (
	ACCOUNTS_TABLE_NAME     string = "journey3accounts"
	ACCOUNTS_TABLE_KEY      string = "Key"
	ACCOUNTS_TABLE_SORT_KEY string = "SortKey"
)

type accountItem struct {
	SortKey string
}

func getAccounts() ([]string, error) {
	// get service
	cfg, err := config.LoadDefaultConfig(context.TODO())
	if err != nil {
		return nil, err
	}
	svc := dynamodb.NewFromConfig(cfg)

	// define keys
	hashKey := "ACC"

	// build expression
	projection := expression.NamesList(
		expression.Name(ACCOUNTS_TABLE_SORT_KEY))
	expr, err := expression.NewBuilder().WithKeyCondition(
		expression.Key(ACCOUNTS_TABLE_KEY).Equal(expression.Value(hashKey)),
	).WithProjection(projection).Build()
	if err != nil {
		return nil, err
	}

	// query input
	input := &dynamodb.QueryInput{
		TableName:                 aws.String(ACCOUNTS_TABLE_NAME),
		ExpressionAttributeNames:  expr.Names(),
		ExpressionAttributeValues: expr.Values(),
		KeyConditionExpression:    expr.KeyCondition(),
		ProjectionExpression:      expr.Projection(),
	}

	// run query
	results, err := svc.Query(context.TODO(), input)
	if err != nil {
		return nil, err
	}

	accounts := make([]string, 0, len(results.Items))
	for _, v := range results.Items {
		item := accountItem{}

		err := attributevalue.UnmarshalMap(v, &item)
		if err != nil {
			return nil, err
		}

		accounts = append(accounts, item.SortKey)
	}
	return accounts, nil
}
