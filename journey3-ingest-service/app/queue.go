package app

import (
	"context"
	"encoding/json"

	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/service/sns"
)

var _topicArn string

func InitSNSConnection(topicArn string) {
	_topicArn = topicArn
}

func EnqueueMessage(message interface{}) (string, error) {
	// serialize message
	bytes, err := json.Marshal(message)
	if err != nil {
		return "", err
	}
	msg := string(bytes)

	// TODO: debug code
	// fmt.Printf("SENDING: %s", msg)

	// init client
	cfg, err := config.LoadDefaultConfig(context.TODO())
	if err != nil {
		return "", err
	}
	client := sns.NewFromConfig(cfg)

	// prepare input
	input := &sns.PublishInput{
		Message:  &msg,
		TopicArn: &_topicArn,
	}

	// publish
	result, err := client.Publish(context.TODO(), input)

	// handle error
	if err != nil {
		return "", err
	}
	return *result.MessageId, nil
}
