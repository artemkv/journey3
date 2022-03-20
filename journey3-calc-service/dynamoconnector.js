const {
  DynamoDBClient,
  GetItemCommand,
  PutItemCommand,
  UpdateItemCommand,
} = require("@aws-sdk/client-dynamodb");
const R = require('ramda');

// https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/welcome.html#welcome_whats_new_v3
// https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/dynamodb-example-table-read-write.html

const JOURNEY3_APP_TABLE = 'journey3app';
const JOURNEY3_STATS_TABLE = 'journey3stats';
const JOURNEY3_SESSIONS_TABLE = 'journey3sessions';

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
    updateStats: async (session, build, version, hourDt, dayDt, monthDt, yearDt) => {
      return await updateStats(session, build, version, hourDt, dayDt, monthDt, yearDt, client);
    },
  };
};

const appExists = async (acc, aid, client) => {
  return await keyExists(client, JOURNEY3_APP_TABLE, `APP#${acc}`, aid);
}

const saveSession = async (aid, build, version, dts, ids, session, client) => {
  const key = `SESSION#${aid}#${build}`;
  const sortKey = `${dts}#${version}#${ids}`;

  return await saveObject(client, JOURNEY3_SESSIONS_TABLE, key, sortKey, session);
}

const updateStats = async (session, build, version, hourDt, dayDt, monthDt, yearDt, client) => {
  const appId = session.aid;

  if (session.fst_launch) {
    await updateUniqueUsers(appId, build, version, client);
    await updateNewUsersByPeriod(appId, build, version, hourDt, dayDt, monthDt, client);
  }

  if (session.fst_launch_hour) {
    await updateUniqueUsersByHour(appId, build, version, hourDt, client);
  }
  if (session.fst_launch_day) {
    await updateUniqueUsersByDay(appId, build, version, dayDt, client);
  }
  if (session.fst_launch_month) {
    await updateUniqueUsersByMonth(appId, build, version, monthDt, client);
  }
  if (session.fst_launch_year) {
    await updateUniqueUsersByYear(appId, build, version, yearDt, client);
  }
  if (session.fst_launch_version) {
    await updateUniqueUsersByVersion(appId, build, version, client);
  }

  await updateSessionsByPeriod(appId, build, version, hourDt, dayDt, monthDt, client);
  await updateEventsByPeriod(session, appId, build, version, hourDt, dayDt, monthDt, client);
  await updateEventSessionsByPeriod(session, appId, build, version, hourDt, dayDt, monthDt, client);

  if (session.has_error) {
    await updateErrorSessionsByPeriod(appId, build, version, hourDt, dayDt, monthDt, client);
  }

  await updateConversions(session, appId, build, version, dayDt, monthDt, yearDt, client);
};

async function updateSessionsByPeriod(appId, build, version, hourDt, dayDt, monthDt, client) {
  const sessionsByHourKey = `SESSIONS_BY_HOUR#${appId}#${build}`;
  const sessionsByDayKey = `SESSIONS_BY_DAY#${appId}#${build}`;
  const sessionsByMonthKey = `SESSIONS_BY_MONTH#${appId}#${build}`;

  await incrementCounter(client, JOURNEY3_STATS_TABLE, sessionsByHourKey, `${hourDt}#${version}`);
  await incrementCounter(client, JOURNEY3_STATS_TABLE, sessionsByDayKey, `${dayDt}#${version}`);
  await incrementCounter(client, JOURNEY3_STATS_TABLE, sessionsByMonthKey, `${monthDt}#${version}`);
}

async function updateUniqueUsers(appId, build, version, client) {
  const uniqueUsersKey = `UNIQUE_USERS#${appId}#${build}`;
  await incrementCounter(client, JOURNEY3_STATS_TABLE, uniqueUsersKey, version);
}

async function updateNewUsersByPeriod(appId, build, version, hourDt, dayDt, monthDt, client) {
  const newUsersByHourKey = `NEW_USERS_BY_HOUR#${appId}#${build}`;
  const newUsersByDayKey = `NEW_USERS_BY_DAY#${appId}#${build}`;
  const newUsersByMonthKey = `NEW_USERS_BY_MONTH#${appId}#${build}`;

  await incrementCounter(client, JOURNEY3_STATS_TABLE, newUsersByHourKey, `${hourDt}#${version}`);
  await incrementCounter(client, JOURNEY3_STATS_TABLE, newUsersByDayKey, `${dayDt}#${version}`);
  await incrementCounter(client, JOURNEY3_STATS_TABLE, newUsersByMonthKey, `${monthDt}#${version}`);
}

async function updateEventsByPeriod(session, appId, build, version, hourDt, dayDt, monthDt, client) {
  const eventsByHourKey = `EVENTS_BY_HOUR#${appId}#${build}`;
  const eventsByDayKey = `EVENTS_BY_DAY#${appId}#${build}`;
  const eventsByMonthKey = `EVENTS_BY_MONTH#${appId}#${build}`;

  for (const evt in session.evts) {
    await incrementCounter(client, JOURNEY3_STATS_TABLE, eventsByHourKey, `${hourDt}#${evt}#${version}`, session.evts[evt]);
    await incrementCounter(client, JOURNEY3_STATS_TABLE, eventsByDayKey, `${dayDt}#${evt}#${version}`, session.evts[evt]);
    await incrementCounter(client, JOURNEY3_STATS_TABLE, eventsByMonthKey, `${monthDt}#${evt}#${version}`, session.evts[evt]);
  }
}

async function updateEventSessionsByPeriod(session, appId, build, version, hourDt, dayDt, monthDt, client) {
  const eventSessionsByHourKey = `EVENT_SESSIONS_BY_HOUR#${appId}#${build}`;
  const eventSessionsByDayKey = `EVENT_SESSIONS_BY_DAY#${appId}#${build}`;
  const eventSessionsByMonthKey = `EVENT_SESSIONS_BY_MONTH#${appId}#${build}`;

  for (const evt in session.evts) {
    await incrementCounter(client, JOURNEY3_STATS_TABLE, eventSessionsByHourKey, `${hourDt}#${evt}#${version}`);
    await incrementCounter(client, JOURNEY3_STATS_TABLE, eventSessionsByDayKey, `${dayDt}#${evt}#${version}`);
    await incrementCounter(client, JOURNEY3_STATS_TABLE, eventSessionsByMonthKey, `${monthDt}#${evt}#${version}`);
  }
}

async function updateErrorSessionsByPeriod(appId, build, version, hourDt, dayDt, monthDt, client) {
  const errorSessionsByHourKey = `ERROR_SESSIONS_BY_HOUR#${appId}#${build}`;
  const errorSessionsByDayKey = `ERROR_SESSIONS_BY_DAY#${appId}#${build}`;
  const errorSessionsByMonthKey = `ERROR_SESSIONS_BY_MONTH#${appId}#${build}`;

  await incrementCounter(client, JOURNEY3_STATS_TABLE, errorSessionsByHourKey, `${hourDt}#${version}`);
  await incrementCounter(client, JOURNEY3_STATS_TABLE, errorSessionsByDayKey, `${dayDt}#${version}`);
  await incrementCounter(client, JOURNEY3_STATS_TABLE, errorSessionsByMonthKey, `${monthDt}#${version}`);
}

async function updateUniqueUsersByHour(appId, build, version, hourDt, client) {
  const uniqueUsersByHourKey = `UNIQUE_USERS_BY_HOUR#${appId}#${build}`;
  await incrementCounter(client, JOURNEY3_STATS_TABLE, uniqueUsersByHourKey, `${hourDt}#${version}`);
}

async function updateUniqueUsersByDay(appId, build, version, dayDt, client) {
  const uniqueUsersByDayKey = `UNIQUE_USERS_BY_DAY#${appId}#${build}`;
  await incrementCounter(client, JOURNEY3_STATS_TABLE, uniqueUsersByDayKey, `${dayDt}#${version}`);
}

async function updateUniqueUsersByMonth(appId, build, version, monthDt, client) {
  const uniqueUsersByMonthKey = `UNIQUE_USERS_BY_MONTH#${appId}#${build}`;
  await incrementCounter(client, JOURNEY3_STATS_TABLE, uniqueUsersByMonthKey, `${monthDt}#${version}`);
}

async function updateUniqueUsersByYear(appId, build, version, yearDt, client) {
  const uniqueUsersByYearKey = `UNIQUE_USERS_BY_YEAR#${appId}#${build}`;
  await incrementCounter(client, JOURNEY3_STATS_TABLE, uniqueUsersByYearKey, `${yearDt}#${version}`);
}

async function updateUniqueUsersByVersion(appId, build, version, client) {
  const uniqueUsersByVersionKey = `UNIQUE_USERS_BY_VERSION#${appId}#${build}`;
  await incrementCounter(client, JOURNEY3_STATS_TABLE, uniqueUsersByVersionKey, `${version}`);
}

async function updateConversions(session, appId, build, version, dayDt, monthDt, yearDt, client) {
  const prevStage = R.pathOr(1, ['prev_stage', 'stage'], session);
  const newStage = R.pathOr(1, ['new_stage', 'stage'], session);

  const conversionsDayKey = `CONVERSIONS_BY_DAY#${appId}#${build}`;
  const conversionsMonthKey = `CONVERSIONS_BY_MONTH#${appId}#${build}`;
  const conversionsYearKey = `CONVERSIONS_BY_YEAR#${appId}#${build}`;

  if (session.fst_launch_day) {
    for (let s = 1; s <= newStage; s++) {
      await incrementCounter(client, JOURNEY3_STATS_TABLE, conversionsDayKey, `${dayDt}#${s}#${version}`);
    }
  } else {
    if (newStage > prevStage) {
      for (let s = prevStage + 1; s <= newStage; s++) {
        await incrementCounter(client, JOURNEY3_STATS_TABLE, conversionsDayKey, `${dayDt}#${s}#${version}`);
      }
    }
  }

  if (session.fst_launch_month) {
    for (let s = 1; s <= newStage; s++) {
      await incrementCounter(client, JOURNEY3_STATS_TABLE, conversionsMonthKey, `${monthDt}#${s}#${version}`);
    }
  } else {
    if (newStage > prevStage) {
      for (let s = prevStage + 1; s <= newStage; s++) {
        await incrementCounter(client, JOURNEY3_STATS_TABLE, conversionsMonthKey, `${monthDt}#${s}#${version}`);
      }
    }
  }

  if (session.fst_launch_year) {
    for (let s = 1; s <= newStage; s++) {
      await incrementCounter(client, JOURNEY3_STATS_TABLE, conversionsYearKey, `${yearDt}#${s}#${version}`);
    }
  } else {
    if (newStage > prevStage) {
      for (let s = prevStage + 1; s <= newStage; s++) {
        await incrementCounter(client, JOURNEY3_STATS_TABLE, conversionsYearKey, `${yearDt}#${s}#${version}`);
      }
    }
  }
}

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