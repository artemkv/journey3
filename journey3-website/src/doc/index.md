# Journey3

Journey3 is a __mobile analytics platform__ that is designed to be __anonymous by default__.

We apply our best knowledge to ensure that __no personally identifiable information is collected or stored__.

We also apply __the data minimization principle__, by collecting the least amount of data necessary.

We do that by applying the following practices:

- We don't send or store any identifiers that can, directly or indirectly, be used to identify a natural person, such as names, zip codes, device identifiers, IP addresses or similar;
- We apply anonymization techniques to the stored data, such as storing data in aggregated form, with the granularity of 1 hour at the highest;
- We correlate sessions from the same user on the device itself.

Therefore we believe that in most cases, information collected and stored in Journey3 __does not fall within the scope of the GDPR/CCPA__.

This assumption might break for the following reasons:

- You misuse the API in the way that breaks the anonymity (for example, by using event or stage names that contain personal identifiers);
- There are some specific circumstances related to your app nature and purpose that we cannot predict.

__This is why we encourage you to review the terms of GDPR regulation and make your own final decision as to whether or not GDPR applies in your case.__

Please understand that Journey3 is __not a backdoor to the GDPR__. We are not trying to exploit any gaps in legislative language to track the personal information about your users.

Instead, we are trying to develop the platform that provides the application developers with the maximum of useful information while fully preserving the rights of their users in regards to their privacy.

__We strongly advocate for making privacy of your users the most important concern.__

## User consent

Journey3 uses local filesystem of a mobile device to store the data from the last session.

In accordance to [EU Directive 2009/136/EC](https://edps.europa.eu/data-protection/our-work/publications/legislation/directive-2009136ec_en), __Article 5(3)__ you are required to obtain user consent to store information or to gain access to information stored in a user's device.

> Member States shall ensure that the storing of information, or the gaining of access to information already stored, in the terminal equipment of a subscriber or user is only allowed on condition that the subscriber or user concerned has given his or her consent.

This applies to any information that is not strictly necessary for performing application functions, even when the information does not fall under the category of personal data.

## What we track

- Sessions, unique users and new users;
- Application feature usage;
- Session duration;
- User journey stage conversions;
- User retention.

## What we store, exactly

### Aggregated counters

- __Number of sessions__ in the given period of time, by version;
- __Number of unique users__ in the given period of time, by version;
- __Number of new users__ in the given period of time, by version;
- __Number of events__ in the given period of time, by event name and version;
- __Number of sessions that triggered an event__ in the given period of time, by event name and version;
- __Number of sessions with errors__ in the given period of time, by version;
- __Number of sessions with crashes__ in the given period of time, by version;
- __Number of stage hits__ in the given period of time, by version;
- __Number of sessions bucketed by duration__, in the given period of time, by version;
- __Number of sessions bucketed by retention__, in the given period of time, by version.

### Sessions

In addition to counters, Journey3 stores __sessions__. A session includes the following data:

- Version;
- Duration;
- Whether the session is from the first time user;
- The sequences of events.

The retention period for the session is __15 days__.

We don't store any device information or anything that can help identifying a user. These is no field that would allow to link sessions from the same user. The session correlation is done on the device itself.

## What we store on the device

Journey3 uses local filesystem of a mobile device to store the data from the last session, including:

- __Session id.__ This id is not used for anything, it is simply helpful for debugging;
- __Account id.__ Your Journey3 account id;
- __Application id.__ The id of the application you created in Journey3;
- __Version.__ Your application version.
- __IsRelease.__ Whether the session was created when running in production.
- __Start date.__ The beginning of the session;
- __End date.__ The end of the session;
- __Date since.__ The time of the very first session;
- __First launch.__ Specifies whether the session is the first session of the current user;
- __Previous stage.__ The stage the session was when it started;
- __New stage.__ The stage the session was when it ended;
- __Has error.__ Specifies whether the session has error;
- __Has crash.__ Specifies whether the session ended in crash;
- __Event counts.__ Contains counters for each event registered in the session;
- __Event sequence.__ Contains the sequence of events registered in the session.

This data is stored in the the directory for application support files.

On iOS, this uses the NSApplicationSupportDirectory API.

On Android, this uses the getFilesDir API.

## Preserving anonymity

To preserve the anonymity, use event names that describe the feature used, and avoid adding any identifiable data.

__Example, good:__ `click_play`, `click_pause`, `add_to_favorites`, `search_by_artist`.

__Example, bad:__ `user_12345_bought_item_34556`
