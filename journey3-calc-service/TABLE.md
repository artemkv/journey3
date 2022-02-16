## Create journey3app table

```
aws dynamodb create-table --table-name journey3app --attribute-definitions AttributeName=Key,AttributeType=S AttributeName=SortKey,AttributeType=S --key-schema AttributeName=Key,KeyType=HASH AttributeName=SortKey,KeyType=RANGE --provisioned-throughput ReadCapacityUnits=10,WriteCapacityUnits=5 --endpoint-url http://localhost:8000 --profile=localdynamo
```

## Create journey3stats table

```
aws dynamodb create-table --table-name journey3stats --attribute-definitions AttributeName=Key,AttributeType=S AttributeName=SortKey,AttributeType=S --key-schema AttributeName=Key,KeyType=HASH AttributeName=SortKey,KeyType=RANGE --provisioned-throughput ReadCapacityUnits=10,WriteCapacityUnits=5 --endpoint-url http://localhost:8000 --profile=localdynamo
```

## Table journey3app structure

```
Key         SortKey
APP#aid     APP#aid
```

## Table journey3stats structure

```
Key                                      SortKey                    Cnt
"APP_LAUNCH_CNT_BY_HOUR#aid"               yyyyMMddHH
"APP_LAUNCH_CNT_BY_DAY#aid"                yyyyMMdd
"APP_LAUNCH_CNT_BY_MONTH#aid"              yyyyMM
```
