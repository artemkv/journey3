# Journey3 Web Service

## Build, run and test

Run unit-tests

```
make test
```

Run integration tests (The app needs to be running!)

```
make integration_test
```

Run the project

```
make run
```

Run project with live updates while developing

```
gowatch
```

## Environment Variables

```
JOURNEY3WEB_PORT=:8700
JOURNEY3WEB_ALLOW_ORIGIN=http://127.0.0.1:8080
JOURNEY3WEB_SESSION_ENCRYPTION_PASSPHRASE=some secret phrase

JOURNEY3WEB_TLS=true
JOURNEY3WEB_CERT_FILE=cert.pem
JOURNEY3WEB_KEY_FILE=key.unencrypted.pem
```

## Auth API

POST /signin

Body:

```
{
    "id_token": "eyJraWQiOiJU..."
}
```

Response:

```
{
    "session": "U2FsdGVkX1+6MJ..."
}
```

## API

### Stats

GET /uniqueuserstats?aid=<APP_ID>&period=day&dt=20210910

Returns

```
{
    "data": [
        {
            "dt": "2021091018",
            "count": 1
        },
        {
            "dt": "2021091020",
            "count": 2
        }
    ]
}
```

### Account info

GET /acc

Returns

```
{
    "data": {
        "acc": "f1a3671f-4740-4092-9e1a-21a97f867b5e",
        "apps": [
            {
                "aid": "754e34f0-8018-4793-887a-7f4fb21d6039",
                "name": "default"
            }
        ]
    }
}
```

### Apps

GET /apps/:id

Returns

```
{
    "data": {
        "aid": "46d92eac-513e-42a1-81e2-58a65593a482",
        "name": "app 1"
    }
}
```

GET /apps

Returns

```
{
    "data": [
        {
            "aid": "754e34f0-8018-4793-887a-7f4fb21d6039",
            "name": "default"
        }
    ]
}
```

POST /apps

```
{
  "name" : "app 1"
}
```

Returns

```
{
    "data": {
        "aid": "46d92eac-513e-42a1-81e2-58a65593a482",
        "name": "app 1"
    }
}
```

PUT /apps/:id

```
{
    "data": {
        "aid": "46d92eac-513e-42a1-81e2-58a65593a482",
        "name": "app 1 upd"
    }
}
```

Returns

```
{
    "data": {
        "aid": "46d92eac-513e-42a1-81e2-58a65593a482",
        "name": "app 1 upd"
    }
}
```

DELETE /apps/:id

Returns 204 No Content
