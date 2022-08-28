# Using Flutter plugin

## Getting started

- Sign in to get the account and the application key;
- Install the plugin:

```
flutter pub add journey3_connector
```

## Initializing the plugin

```dart
PackageInfo.fromPlatform().then((PackageInfo packageInfo) {
    Journey.instance().initialize(
        '<accountId>',
        '<appId>',
        packageInfo.version,
        kReleaseMode);
});
```

## Report an event

Events are used to track feature usage:

```dart
await Journey.instance().reportEvent('click_play');
await Journey.instance().reportEvent('click_pause');
```

## Report an error

Errors are special types of events:

```dart
await Journey.instance()
    .reportEvent('err_loading_catalog', isError: true);
```

## Report a crash

Errors are yet another types of events:

```dart
FlutterError.onError = (FlutterErrorDetails details) async {
    await Journey.instance().reportEvent('crash', isCrash: true);

    // Handle error, for example
    // exit(0);
};
```

## Report a stage transition

Stage transitions are used to build user conversion funnels:

```dart
await Journey.instance()
    .reportStageTransition(2, 'explore');
```

It's up to you what stages you would like to use, we recommend to start with the following stages:

| stage | name | comment |
| ------| ---- | ------- |
| 1 | 'new user' | Is used as an initial stage by default for all sessions. You don't need to report this stage |
| 2 | 'explore' | The user has used some basic features of the app. For example: the user has browsed through the catalog of music albums |
| 3 | 'engage' | The user has used one of the main features of the app. For example: the user has started playing the album |
| 4 | 'commit' | The user has bought the subscription service for your app |

You don't need to remember which stage you already reported. The plugin will remember the highest stage that you reported.

Maximum 10 stages are supported.