package app

import (
	"context"
	"errors"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/feature/dynamodb/expression"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb/types"
)

var (
	ACCOUNTS_TABLE_NAME     string = "journey3accounts"
	ACCOUNTS_TABLE_KEY      string = "Key"
	ACCOUNTS_TABLE_SORT_KEY string = "SortKey"
)

func ensureAccountRecordExists(accId string) error {
	// get service
	cfg, err := config.LoadDefaultConfig(context.TODO())
	if err != nil {
		return logAndConvertError(err)
	}
	svc := dynamodb.NewFromConfig(cfg)

	// define keys
	hashKey := "ACC"
	sortKey := accId

	// query expression
	expr, err := expression.NewBuilder().WithCondition(
		expression.And(
			expression.AttributeNotExists(expression.Name(ACCOUNTS_TABLE_KEY)),
			expression.AttributeNotExists(expression.Name(ACCOUNTS_TABLE_SORT_KEY))),
	).Build()
	if err != nil {
		return logAndConvertError(err)
	}

	// query input
	input := &dynamodb.PutItemInput{
		TableName: aws.String(ACCOUNTS_TABLE_NAME),
		Item: map[string]types.AttributeValue{
			ACCOUNTS_TABLE_KEY:      &types.AttributeValueMemberS{Value: hashKey},
			ACCOUNTS_TABLE_SORT_KEY: &types.AttributeValueMemberS{Value: sortKey},
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
			return nil
		}
		return logAndConvertError(err)
	}

	return nil
}
