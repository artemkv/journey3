## Credentials

Create AWS user for Serverless
https://www.serverless.com/framework/docs/providers/aws/guide/credentials/

Create named AWS profile `journey3serverless` with user credentials
https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-profiles.html

## Deployment

Deploy everything

```
serverless deploy --aws-profile journey3serverless
```

Deploy function

```
serverless deploy function --function compute-stats --aws-profile journey3serverless
```

Remove stack

```
serverless remove --aws-profile journey3serverless
```

Fetch logs

```
serverless logs -f compute-stats --aws-profile journey3serverless
serverless logs -f compute-stats --startTime 5h --aws-profile journey3serverless
```

List deployments (you can rollback by timestamp, the complete deployment or a single function)

```
serverless deploy list --aws-profile journey3serverless
serverless deploy list functions --aws-profile journey3serverless
```

## Development

Invoke locally (use local DynamoDB)

```
serverless invoke local --function compute-stats --path=testevent.json --env IS_OFFLINE=true --env AWS_ACCESS_KEY_ID=fakeMyKeyId --env AWS_SECRET_ACCESS_KEY=fakeSecretAccessKey

serverless invoke local --function compute-stats --path=testevent_head.json --env IS_OFFLINE=true --env AWS_ACCESS_KEY_ID=fakeMyKeyId --env AWS_SECRET_ACCESS_KEY=fakeSecretAccessKey

serverless invoke local --function compute-stats --path=testevent_tail.json --env IS_OFFLINE=true --env AWS_ACCESS_KEY_ID=fakeMyKeyId --env AWS_SECRET_ACCESS_KEY=fakeSecretAccessKey

serverless invoke local --function compute-stats --path=testevent_flush.json --env IS_OFFLINE=true --env AWS_ACCESS_KEY_ID=fakeMyKeyId --env AWS_SECRET_ACCESS_KEY=fakeSecretAccessKey
```

## Timeouts

Events - SQS Queues
https://www.serverless.com/framework/docs/providers/aws/events/sqs/

Using AWS Lambda with Amazon SQS
https://docs.aws.amazon.com/lambda/latest/dg/with-sqs.html

- by default, lambda invokes the function as soon as record is available
- lambda will poll up to 10 messages and send the batch to the function
- batch window allows to buffer records for up to five minutes (avoids invoking the function with a small number of records)
- with batch window specified, you can batch up to 10,000 records for the standard queue (and up to 6 MB)
- configure your function timeout to allow enough time to process an entire batch of items
- when lambda reads a batch, the messages stay in the queue but become hidden for the length of the queue's visibility timeout
- if your function successfully processes the batch, lambda deletes the messages from the queue
- if your function is throttled, returns an error, or doesn't respond, the message becomes visible again
- to allow your function time to process each batch of records, set the source queue's visibility timeout to at least 6 times the timeout that you configure on your function, plus the value of MaximumBatchingWindowInSeconds. The extra time allows for Lambda to retry if your function execution is throttled while your function is processing a previous batch
- if your function returns an error, **all items** in the batch return to the queue
- if a message fails to be processed multiple times, Amazon SQS can send it to a dead-letter queue
- to send messages to a second queue after a number of receives, configure a dead-letter queue on your source queue

## TODO:

- Configure the dead letter queue
