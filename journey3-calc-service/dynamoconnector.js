const {
  DynamoDBClient,
  GetItemCommand,
  PutItemCommand,
  UpdateItemCommand,
} = require("@aws-sdk/client-dynamodb");

// https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/welcome.html#welcome_whats_new_v3
// https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/dynamodb-example-table-read-write.html

const JOURNEY3_APP_TABLE = 'journey3app';
const JOURNEY3_STATS_TABLE = 'journey3stats';
const JOURNEY3_SESSIONS_TABLE = 'journey3sessions';

const appExists = async (acc, aid, client) => {
  return await keyExists(client, JOURNEY3_APP_TABLE, `APP#${acc}`, aid);
}

const saveSession = async (aid, build, version, dts, ids, session, client) => {
  const key = `SESSION#${aid}#${build}`;
  const sortKey = `${dts}#${version}#${ids}`;

  return await saveObject(client, JOURNEY3_SESSIONS_TABLE, key, sortKey, session);
}

const updateStats = async (build, version, session, hourDt, dayDt, monthDt, client) => {
  const appId = session.aid;

  if (session.fst_launch) {
    const uniqueUsersKey = `UNIQUE_USERS#${appId}#${build}`;

    await incrementCounter(client, JOURNEY3_STATS_TABLE, uniqueUsersKey, version);

    const newUsersByHourKey = `NEW_USERS_BY_HOUR#${appId}#${build}`;
    const newUsersByDayKey = `NEW_USERS_BY_DAY#${appId}#${build}`;
    const newUsersByMonthKey = `NEW_USERS_BY_MONTH#${appId}#${build}`;

    await incrementCounter(client, JOURNEY3_STATS_TABLE, newUsersByHourKey, `${hourDt}#${version}`);
    await incrementCounter(client, JOURNEY3_STATS_TABLE, newUsersByDayKey, `${dayDt}#${version}`);
    await incrementCounter(client, JOURNEY3_STATS_TABLE, newUsersByMonthKey, `${monthDt}#${version}`);
  }

  const sessionsByHourKey = `SESSIONS_BY_HOUR#${appId}#${build}`;
  const sessionsByDayKey = `SESSIONS_BY_DAY#${appId}#${build}`;
  const sessionsByMonthKey = `SESSIONS_BY_MONTH#${appId}#${build}`;

  await incrementCounter(client, JOURNEY3_STATS_TABLE, sessionsByHourKey, `${hourDt}#${version}`);
  await incrementCounter(client, JOURNEY3_STATS_TABLE, sessionsByDayKey, `${dayDt}#${version}`);
  await incrementCounter(client, JOURNEY3_STATS_TABLE, sessionsByMonthKey, `${monthDt}#${version}`);

  const eventsByHourKey = `EVENTS_BY_HOUR#${appId}#${build}`;
  const eventsByDayKey = `EVENTS_BY_DAY#${appId}#${build}`;
  const eventsByMonthKey = `EVENTS_BY_MONTH#${appId}#${build}`;

  const eventSessionsByHourKey = `EVENT_SESSIONS_BY_HOUR#${appId}#${build}`;
  const eventSessionsByDayKey = `EVENT_SESSIONS_BY_DAY#${appId}#${build}`;
  const eventSessionsByMonthKey = `EVENT_SESSIONS_BY_MONTH#${appId}#${build}`;

  for (const evt in session.evts) {
    await incrementCounter(client, JOURNEY3_STATS_TABLE, eventsByHourKey, `${hourDt}#${evt}#${version}`, session.evts[evt]);
    await incrementCounter(client, JOURNEY3_STATS_TABLE, eventsByDayKey, `${dayDt}#${evt}#${version}`, session.evts[evt]);
    await incrementCounter(client, JOURNEY3_STATS_TABLE, eventsByMonthKey, `${monthDt}#${evt}#${version}`, session.evts[evt]);

    await incrementCounter(client, JOURNEY3_STATS_TABLE, eventSessionsByHourKey, `${hourDt}#${evt}#${version}`);
    await incrementCounter(client, JOURNEY3_STATS_TABLE, eventSessionsByDayKey, `${dayDt}#${evt}#${version}`);
    await incrementCounter(client, JOURNEY3_STATS_TABLE, eventSessionsByMonthKey, `${monthDt}#${evt}#${version}`);
  }

  if (session.has_error) {
    const errorSessionsByHourKey = `ERROR_SESSIONS_BY_HOUR#${appId}#${build}`;
    const errorSessionsByDayKey = `ERROR_SESSIONS_BY_DAY#${appId}#${build}`;
    const errorSessionsByMonthKey = `ERROR_SESSIONS_BY_MONTH#${appId}#${build}`;

    await incrementCounter(client, JOURNEY3_STATS_TABLE, errorSessionsByHourKey, `${hourDt}#${version}`);
    await incrementCounter(client, JOURNEY3_STATS_TABLE, errorSessionsByDayKey, `${dayDt}#${version}`);
    await incrementCounter(client, JOURNEY3_STATS_TABLE, errorSessionsByMonthKey, `${monthDt}#${version}`);
  }
};

exports.getConnector = () => {
  let options = {};
  if (process.env.IS_OFFLINE) {
    options.region = 'localhost';
    options.endpoint = 'http://localhost:8000';
  }
  var client = new DynamoDBClient(options);

  return {
    appExists: async (acc, aid) => {
      return await appExists(acc, aid, client);
    },
    saveSession: async (aid, build, version, dts, ids, session) => {
      return await saveSession(aid, build, version, dts, ids, session, client);
    },
    updateStats: async (build, version, session, hourDt, dayDt, monthDt) => {
      return await updateStats(build, version, session, hourDt, dayDt, monthDt, client);
    },
  };
};

// Atomically increments the value of the attribute "Cnt"
// and returns the new value
async function incrementCounter(client, tableName, key, sortKey, amt = 1) {
  var params = {
    TableName: tableName,
    Key: {
      Key: { S: key },
      SortKey: { S: sortKey },
    },
    UpdateExpression: 'SET #val = if_not_exists(#val, :zero) + :incr',
    ExpressionAttributeNames: {
      '#val': 'Cnt',
    },
    ExpressionAttributeValues: {
      ':incr': { N: amt.toString() },
      ':zero': { N: '0' },
    },
    ReturnValues: 'UPDATED_NEW',
  };

  return await client.send(new UpdateItemCommand(params));
}

// Checks whether the specified key can be found in the stats table
async function keyExists(client, tableName, key, sortKey) {
  var params = {
    TableName: tableName,
    Key: {
      Key: { S: key },
      SortKey: { S: sortKey },
    },
    AttributesToGet: ['Key'],
  };

  const cmd = new GetItemCommand(params);

  const data = await client.send(cmd);
  if (!data.Item) {
    return false;
  }
  return true;
}

async function saveObject(client, tableName, key, sortKey, obj) {
  var params = {
    TableName: tableName,
    Item: {
      Key: { S: key },
      SortKey: { S: sortKey },
      Val: { S: JSON.stringify(obj) }
    },
  };

  return await client.send(new PutItemCommand(params));
}