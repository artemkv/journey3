## Xamarin connector

## Getting started

- Sign in to get the account and the application key;
- Add the NuGet dependency to your project:

```
Install-Package Artemkv.Journey3.Connector -Version <version>
```

### Initializing the connector

```csharp
using Artemkv.Journey3.Connector;

// In MainActivity
protected override void OnCreate(Bundle bundle)
{
    base.OnCreate(bundle);

    Journey.GetInstance().InitializeAsync(
        "<accountId>",
        "<appId>",
        VersionTracking.CurrentVersion,
        !IsDebug());

    // ...
}

public static bool IsDebug()
{
#if DEBUG
    return true;
#else
    return false;
#endif
}
```

### Report an event

Events are used to track feature usage:

```csharp
Journey.GetInstance().ReportEvent("click_play");
```

### Report an error

Errors are special types of events:

```csharp
Journey.GetInstance().ReportError("err_loading_catalog");
```

### Report a crash

Crashes are yet another types of events.

Android:

```csharp
using Artemkv.Journey3.Connector;

// In MainActivity
protected override void OnCreate(Bundle bundle)
{
    base.OnCreate(bundle);

    AppDomain.CurrentDomain.UnhandledException += OnUnhandledException;
    TaskScheduler.UnobservedTaskException += OnUnobservedTaskException;    

    // ...
}

private void OnUnhandledException(object sender, UnhandledExceptionEventArgs e)
{
    Journey.GetInstance().ReportCrash("crash");
}

private void OnUnobservedTaskException(object sender, UnobservedTaskExceptionEventArgs e)
{
    Journey.GetInstance().ReportCrash("crash");
}
```

iOS:

```csharp
// In AppDelegate
public override bool FinishedLaunching(UIApplication app, NSDictionary options)
{
    AppDomain.CurrentDomain.UnhandledException += OnUnhandledException;
    TaskScheduler.UnobservedTaskException += OnUnobservedTaskException;    

    // ...
}

private void OnUnhandledException(object sender, UnhandledExceptionEventArgs e)
{
    Journey.GetInstance().ReportCrash("crash");
}

private void OnUnobservedTaskException(object sender, UnobservedTaskExceptionEventArgs e)
{
    Journey.GetInstance().ReportCrash("crash");
}
```

### Report a stage transition

Stage transitions are used to build user conversion funnels:

```csharp
Journey.GetInstance().ReportStageTransition(2, "explore");
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