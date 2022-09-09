package app

import (
	"context"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb/types"
	"github.com/google/uuid"
)

var (
	FEEDBACK_TABLE_NAME      string = "journey3feedback"
	FEEDBACK_TABLE_KEY       string = "Key"
	FEEDBACK_TABLE_SORT_KEY  string = "SortKey"
	FEEDBACK_TABLE_TEXT_ATTR string = "text"
)

func registerFeedback(text string) error {
	// get service
	cfg, err := config.LoadDefaultConfig(context.TODO())
	if err != nil {
		return logAndConvertError(err)
	}
	svc := dynamodb.NewFromConfig(cfg)

	// define keys
	hashKey := generateTimestamp()
	sortKey := uuid.New().String()

	// query input
	input := &dynamodb.PutItemInput{
		TableName: aws.String(FEEDBACK_TABLE_NAME),
		Item: map[string]types.AttributeValue{
			FEEDBACK_TABLE_KEY:       &types.AttributeValueMemberS{Value: hashKey},
			FEEDBACK_TABLE_SORT_KEY:  &types.AttributeValueMemberS{Value: sortKey},
			FEEDBACK_TABLE_TEXT_ATTR: &types.AttributeValueMemberS{Value: text},
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
