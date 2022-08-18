## Data anonymization

Data is considered personal if it relates to an identified or identifiable person. This includes sensitive data, a special category of data that requires enhanced protection (sexual orientation, religious views etc.)

Personal data falls under various data protection laws, such as GDPR.

__Data anonymization__ is a process by which personal data is irreversibly altered in such a way that a person can no longer be identified, directly or indirectly.

Advantages of data anonymization:

- Anonymization preserves privacy of individuals and organizations;
- Once data is truly anonymous and individuals are no longer identifiable, the data will not fall within the scope of the GDPR;
- Therefore, anonymization allows for the sharing of information without obtaining user's explicit consent;
- When data was anonymized, and the data breach happens, no breach notification is needed.

It is important to stress that to be anonymous, it is not enough to simply encrypt the data or remove all the identifiers. In such a case, it may still be possible to re-identify specific records by linking some of the remaining data with similar attributes in another, identifying dataset.

To be anonymous, the data should be altered in such a way that renders de-anonymization truly impossible.

__De-anonymization__ is the reverse process in which anonymous data is cross-referenced with other data sources to re-identify the anonymous data source.

It can be very tricky to provide the guarantee of anonymization. In fact, __anonymization of data is not always possible__. Depending on the context or the nature of the data, there can always be the situation when re-identification risks cannot be sufficiently mitigated, for example, when the total number of possible individuals is too small.

Another thing to remember is that __anonymization is not forever__: there is always a risk that some anonymization processes could be reverted in the future.

Successful anonymization always takes context into account and tries to find the right balance between reducing the re-identification risk and keeping the utility of a dataset.

### What we do:

- We collect and process the least amount of data possible;
- We don't collect or store any direct or indirect identifiers (aka quasi-identifiers);
- We don't collect or store any information about device (such as screen resolution, device model or similar);
- We generalise the values of the attributes (such as session duration) using value ranges (intervals), instead of saving a concrete field value;
- We aggregate data with granularity of 1 hour at max;
- We don't store any fields that would allow linking multiple sessions from the same user together;
- We define time limits for retention of certain types of data (sessions);
- We offer transparency regarding what is collected and stored.







