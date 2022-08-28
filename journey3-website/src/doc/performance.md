# Performance considerations

We designed the connector libraries in the way that has __minimal impact__ on your app performance and the data consumed.

The analytics data is sent only upon connector initialization.

First, we send a session header, with the information about the new session that has just started.

Second, we send the previous session with the events and stage transitions that happened the last time the app was used.

This means that when you report an event or a stage transition, we record that on the device, but we don't send this data until user restarts the application.

This decision is a trade-off between data accuracy and the chattiness of the connector. The disadvantage is, the events and stage transitions will not be reported until user re-starts the app. On the other hand, this means you should not be worried about reporting events too often.

We also impose hard limit of __100 events in a single session__, to make sure we don't send too much data, consuming the user's traffic.