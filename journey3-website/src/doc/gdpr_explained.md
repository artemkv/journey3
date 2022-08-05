# The absolute minimum that every website/app developer needs to know about GDPR/CCPA

## Who should care about GDPR?

As a simple rule of thumb, you need to comply with GDPR if the following 2 conditions are true:

- You have a website and an app that is publicly accessible;
- You store user input or remember what user did.

### Examples of user input

- Your application asks users to enter their name or the date of birth upon signup;
- Your application allows users sending text messages to other users.

### Examples of remembering what users did

- You log all the REST calls made by the app to your backend, and include user IP in the log;
- You made a music player app and you remember the history of songs that every user played, for the purpose of statistics.

### And what about CCPA?

Since CCPA is less restrictive than GDPR, in general, if you comply with GDPR, you also comply with CCPA. So forget about CCPA.


## So what should you do?

The steps are actually quite simple and straightforward:

- __Write your privacy policy;__

*More on that below*

- __Host your privacy policy on your public website;__

*The goal is to simply make it accessible*

- __Upon sign up, present users with your privacy policy and ask them for an explicit consent;__

*Consent has to be explicit, do not use pre-checked boxes!*

- __Only collect what is truly needed;__

*Do you really need to know the user gender? Zip code?*

- __Only use the customer data for legitimate reasons;__

*It's OK to ask users for email and name upon site registration. It's not OK to use that email to send promotional letters, unless user explicitly agreed to that! It is definitely not OK to sell that data to thrird parties!*

- __Do not store longer than needed;__

*Remove users resume from the database after the interview is conducted and the hiring process is over*

- __Protect the stored data from unauthorized use;__

*Make sure you store the user data safely and transfer it over HTTPS*

- __Allow users to access their data;__

*Users have a legal right to see what data you have on them*

- __Allow users to correct errors;__

*This is another user's legal right*

- __Allow users to delete all their data you store;__

*You should be able to do this upon user request, once you confirm the user identity.*


## So how do I write my privacy policy?

First of all, remember that the policy is not for the lawers! It is for the user.
So don't worry about the language, and aim for clear, simple and short document.

This is what you need to include:

- What data is collected
- The mechanisms by which data is collected
- How the collected data is used
- Who has access to the data
- How the data is protected
- With whom the data may be shared or disclosed
- How long the data is kept
- What control the user has over the collection, usage and persistence of the data
- How users can access and export their data as appropriate
- How users can contact the organization with questions or concerns about their privacy


## Is there any situation when you don't need GDPR?

Yes, there are couple of situations when you can ignore it:

- You are organizing the private event (e.g. wedding) and collecting guest data;
- Your website/app is read-only and you don't track anything about visitors (no logging, no cookies, no analytics etc.);
- The information you collect is fully anonymised.

Example of read-only app could be a weather app, if all you do is to show the weather predictions. However, usually, you would want to customize what users see based on their location, track how often they use your app or even show customized ads. All of this will most probably require storing user personal data.

TODO: anonymous