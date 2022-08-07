## Using Android Native SDK

### Getting started

- Sign in to get the account and the application key;
- Add the dependency to the SDK to your ```build.gradle```:

```
implementation group: 'net.artemkv', name: 'journey3', version: '1.0'
```

- Add INTERNET permission to your ```AndroidManifest.xml```:

```
<uses-permission android:name="android.permission.INTERNET" />
```

### Initializing and using the plugin

```
public final class JourneyConnectorProvider {
    private static Journey journey;

    private JourneyConnectorProvider() {
    }

    public static Journey getInstance() {
        return journey;
    }

    public static synchronized void initialize(Context context) {
        // avoid re-initializing the plugin every time your activity is created
        // as this will create a new session every time
        if (journey == null) {
            journey = new Journey(
                    "<YourAccountID>",
                    "<YourAppID>",
                    BuildConfig.VERSION_NAME,
                    !BuildConfig.DEBUG);
            journey.startSession(context);
        }
    }
}

public class MainActivity extends AppCompatActivity {
    private Button featureAButton;
    private Button featureBButton;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        featureAButton = (Button) findViewById(R.id.feature_a);
        featureBButton = (Button) findViewById(R.id.feature_b);

        featureAButton.setOnClickListener(view -> {
            Journey journey = JourneyConnectorProvider.getInstance();
            if (journey != null) {
                journey.reportEvent("feature_a", this);
            }
        });
        featureBButton.setOnClickListener(view -> {
            Journey journey = JourneyConnectorProvider.getInstance();
            if (journey != null) {
                journey.reportEvent("feature_b", this);
            }
        });

        JourneyConnectorProvider.initialize(this);
    }
```

### Report an event

Events are used to track feature usage:

```
journey.reportEvent("click_play", context);
journey.reportEvent("click_pause", context);
```

### Report an error

Errors are special types of events:

```
journey.reportError("err_loading_catalog", context);
```

### Report a crash

Crashes are yet another types of events:

```
journey.reportCrash("crash", context);
```

### Report a stage transition

Stage transitions are used to build user conversion funnels:

```
journey.reportStageTransition(2, "explore", context);
```

It's up to you what stages you would like to use, we recommend to start with the following stages:

| stage | name | comment |
| ------| ---- | ------- |
| 1 | "new user" | Is used as an initial stage by default for all sessions. You don't need to report this stage |
| 2 | "explore" | The user has used some basic features of the app. For example: the user has browsed through the catalog of music albums |
| 3 | "engage" | The user has used one of the main features of the app. For example: the user has started playing the album |
| 4 | "commit" | The user has bought the subscription service for your app |

You don't need to remember which stage you already reported. The plugin will remember the highest stage that you reported.

Maximum 10 stages are supported.