NB: APP records are only for metadata, ownership and read access should be determined using USER and USER_EMAIL records

# Owner Flow

1. initSession(uid: "u001", email: "aaa@gmail.com")

- check if there is already USER record
- if record does not exist, generate new acc and app id and create new USER record

```
USER        |u001               { "acc": "acc001", "email": "aaa@gmail.com", "apps": [ "aid055" ] }
```

- if USER record did not exist, create APP record with default metadata; if this step fails, some empty metadata has to be provided dynamically upon listing apps

```
APP#acc001    |aid055             { "name": "default" }
```

2. addApp(uid: "u001", acc: "acc01", md: { "name": "my app" })

- generate new app id
- update USER record

```
USER        |u001               { "acc": "acc001", "email": "aaa@gmail.com", "apps": [ "aid055", "aid056" ] }
```

- create APP record with passed metadata; if this step fails, app will appear in the list but empty metadata will be shown, forcing owner to do update again

```
APP#acc001    |aid055             { "name": "my app" }
```

3. listApps(uid: "u001", acc: "acc01") - to show in dropdown

- simply return apps from USER record (could be combined with initSession as an optimization)
- retrieve names from APP records, can be found using query for all apps by APP#acc001 key
- for APP records that are not found, return empty metadata ("name": "unknown")

4. canRead(uid: "u001", aid: "aid055")

- check the USER record to see if app is on the list (effectively checking if user in an owner)

5. updateAppMetadata(uid: "u001", aid: "aid055", md: { "name": "new name" })

- check uid: "u001" is owner of aid: "aid055" (using USER record)
- update APP record (or create if not exists)

```
APP#acc001    |aid055             { "name": "new name" }
```

6. getAppsMetadata(uid: "u001", acc: "acc01") - for management page/extra info

- get list of apps from USER record
- retrieve metadata from APP records, can be found using query for all apps by APP#acc001 key
- for APP records that are not found, return empty metadata ("name": "unknown")

7. get app(uid: "u001", acc: "acc01", aid: "aid055")

- check uid: "u001" have a read access to aid: "aid055" (using USER record)
- return metadata from APP record, using APP#acc001, aid055 as keys

8. delete app(uid: "u001", acc: "acc01", aid: "aid055")

- check uid: "u001" is owner of aid: "aid055" (using USER record)
- remove APP record; if this step fails, app will appear in the list but empty metadata will be shown, forcing owner to do delete again
- remove appid from USER record

# Read Access Flow

1. allowReadAccess(uid: "u001", aid: "aid055", email: "bbb@gmail.com")

- check uid: "u001" is owner of aid: "aid055" (using USER record)
- create or update USER_EMAIL record, adding app to read list

```
USER_EMAIL  |bbb@gmail.com      { "read": [ "aid055" ] }
```

- update APP record, this is purely for the owner to know who has an access; if this step fails, the user will gain access, but the owner won't see it, forcing the owner to re-try the request

```
APP#acc001      |aid055      { "name": "default", read: [ "bbb@gmail.com" ] }
```

2. initSession(uid: "u002", email: "bbb@gmail.com")

- create or update USER record

```
USER        |u002               { "acc": "acc002", "email": "bbb@gmail.com", "apps": [ "aid057" ] }
```

- create APP record

```
APP#acc002    |aid057             { "name": "default" }
```

3. listApps(uid: "u002", acc: "acc02") - to show in dropdown

- return apps from user record + user email record (easy if combined with initSession)
- TODO: returning metadata will only be efficient for the apps user owns, unless owner provides the name with which the app is shared to others (probably not a bad idea in any case)

4. canRead(uid: "u002", aid: "aid055")

- check the USER record to see if app is on the list (effectively checking if user in an owner)
- if not on the list, check the USER_EMAIL record to see if app is on the list

TODO: get metadata should probably work for owner and reader, and return whether the app is owned or only read access
TODO: remove read access

# Tests

- get app, app fully created
- get app, not in user list: 401
- get app, only in user list, but no metadata: 404
- add app, fully created
- update app that has been fully created
- add app, only added to user list, then separate update
- delete app, app fully created
- delete app, already deleted metadata, now remove from the list
- get all apps, fully created or only on user list
