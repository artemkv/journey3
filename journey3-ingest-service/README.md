# Journey2 Events Service

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
JOURNEY3_PORT=:8060
JOURNEY3_TOPIC=arn:aws:sns:us-east-1:4739XXXXXXX:journey3-incoming

JOURNEY3_TLS=true
JOURNEY3_CERT_FILE=cert.pem
JOURNEY3_KEY_FILE=key.unencrypted.pem
```

## API

```
POST /session
{
    "id": "5d4def81-1ade-4643-af6e-49ad67a07c37",
    "ts": "2022-03-06T21:30:03.537741Z",
    "acc" : "f1a3671f-4740-4092-9e1a-21a97f867b5e",
    "aid" : "9735965b-e1cb-4d7f-adb9-a4adf457f61a"
    "version": "1.4.6",
    "env": "DEV",
    "fst_launch": false,
    "has_error": false,
    "evts": {},
    "evt_seq": []
}
```
