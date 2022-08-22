## Ionic connector

## Getting started

- Sign in to get the account and the application key;
- Install the connector:

```
npm i journey3-nodejs-sdk
```

### Initializing the connector

```js
import {initializeMobile} from 'journey3-nodejs-sdk';

const version = '1.0'; // Your app version
const isRelease = production ? true : false; // Separate dev stats from production stats
initializeMobile(
  '<accountId>',
  '<appId>',
  version,
  isRelease,
);
```

### Report an event

Events are used to track feature usage:

```js
import {reportEvent} from 'journey3-nodejs-sdk';

reportEvent('click_play');
```

### Report an error

Errors are special types of events:

```js
import {reportError} from 'journey3-nodejs-sdk';

reportError('err_loading_catalog');
```

### Report a stage transition

Stage transitions are used to build user conversion funnels:

```js
import {reportStageTransition} from 'journey3-nodejs-sdk';

reportStageTransition(2, 'explore');
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