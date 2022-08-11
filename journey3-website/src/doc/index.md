# Journey3

Journey3 is a __mobile analytics platform__ that is designed to be __anonymous by default__.

We apply our best knowledge to ensure that __no personally identifiable information is collected or stored__.

We do that by applying the following practices:

- We don't send or store any identifiers that can, directly or indirectly, be used to identify a natural person, such as names, zip codes, device identifiers, IP addresses or similar;
- We apply anonymization techniques to the stored data, such as storing data in aggregated form, with the granularity of 1 hour at the highest;
- We correlate sessions from the same user on the device itself.

Therefore we believe that in most cases, information collected and stored in Journey3 __does not fall within the scope of the GDPR/CCPA__. This means you don't need to ask for the user opt-in or mention the data collected in your privacy policy.

This assumption might break for the following reasons:

- You misuse the API in the way that breaks the anonymity (for example, by using event or stage names that contain personal identifiers);
- There are some specific circumstances related to your app nature and purpose that we cannot predict.

__This is why we encourage you to review the terms of GDPR regulation and make your own final decision as to whether ot not you shoud enable the collection of analytic data with or without opt-in, and whether or not you should mention the data collected in your privacy policy.__

Please understand that Journey3 is __not a backdoor to the GDPR__. We are not trying to exploit any gaps in legislative language to track the personal information about your users.

Instead, we are trying to develop the platform that provides the application developers with the maximum useful information while fully preserving the rights of their users in regards to their privacy.

__We strongly advocate for making privacy of your users the most important concern.__

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

## Preserving anonymity

To preserve the anonymity, use event names that describe the feature used, and avoid adding any identifiable data.

__Example, good:__ `click_play`, `click_pause`, `add_to_favorites`, `search_by_artist`.

__Example, bad:__ `user_12345_bought_item_34556`
