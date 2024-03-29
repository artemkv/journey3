const {
  DynamoDBClient,
  GetItemCommand,
  PutItemCommand,
  UpdateItemCommand,
} = require("@aws-sdk/client-dynamodb");
const R = require('ramda');
const statsfunc = require('./statsfunc');

// https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/welcome.html#welcome_whats_new_v3
// https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/dynamodb-example-table-read-write.html

const JOURNEY3_APP_TABLE = 'journey3app';
const JOURNEY3_STATS_TABLE = 'journey3stats';
const JOURNEY3_SESSIONS_TABLE = 'journey3sessions';
const JOURNEY3_META_TABLE = 'journey3meta';

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
    updateStatsFromSessionHead: async (session, build, version, hourDt, dayDt, monthDt, yearDt) => {
      return await updateStatsFromSessionHead(session, build, version, hourDt, dayDt, monthDt, yearDt, client);
    },
    updateStatsFromSessionTail: async (session, build, version, hourDt, dayDt, monthDt, yearDt) => {
      return await updateStatsFromSessionTail(session, build, version, hourDt, dayDt, monthDt, yearDt, client);
    },
    updateStatsFromSessionFlush: async (session, build, version, hourDt, dayDt, monthDt, yearDt) => {
      return await updateStatsFromSessionFlush(session, build, version, hourDt, dayDt, monthDt, yearDt, client);
    },
  };
};

const appExists = async (acc, aid, client) => {
  return await keyExists(client, JOURNEY3_APP_TABLE, `APP#${acc}`, aid);
}

const saveSession = async (aid, build, version, dts, ids, session, client) => {
  const errLevel = statsfunc.getErrorLevel(session);

  const key = `SESSION#${aid}#${build}`;
  const sortKey = `${errLevel}#${version}#${dts}#${ids}`;

  return await saveObject(client, JOURNEY3_SESSIONS_TABLE, key, sortKey, session, statsfunc.getExpirationTs(15));
}

const updateStatsFromSessionHead = async (session, build, version, hourDt, dayDt, monthDt, yearDt, client) => {
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
    await updateRetention(session, appId, build, version, dayDt, client);
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

  await updateConversionsFromHead(session, appId, build, version, dayDt, monthDt, yearDt, client);
  await updateStageMetadataFromHead(session, appId, build, client);

  await updateVersionMetadata(session, appId, build, client);
}

const updateStatsFromSessionTail = async (session, build, version, hourDt, dayDt, monthDt, yearDt, client) => {
  const appId = session.aid;

  await updateEventsByPeriod(session, appId, build, version, hourDt, dayDt, monthDt, client);
  await updateEntryEventsByPeriod(session, appId, build, version, hourDt, dayDt, monthDt, client);
  await updateExitEventsByPeriod(session, appId, build, version, hourDt, dayDt, monthDt, client);
  await updateEventSessionsByPeriod(session, appId, build, version, hourDt, dayDt, monthDt, client);

  if (session.has_error) {
    await updateErrorSessionsByPeriod(appId, build, version, hourDt, dayDt, monthDt, client);
  }
  if (session.has_crash) {
    await updateCrashSessionsByPeriod(appId, build, version, hourDt, dayDt, monthDt, client);
  }

  await updateConversionsFromTail(session, appId, build, version, dayDt, monthDt, yearDt, client);
  await updateStageMetadataFromTail(session, appId, build, client);

  await updateSessionDurationDistribution(session, appId, build, version, dayDt, monthDt, yearDt, client);
}

const updateStatsFromSessionFlush = async (session, build, version, hourDt, dayDt, monthDt, yearDt, client) => {
  const appId = session.aid;
  await updateEventsByPeriod(session, appId, build, version, hourDt, dayDt, monthDt, client);
  await updateEventSessionsByPeriod(session, appId, build, version, hourDt, dayDt, monthDt, client);
}

async function updateRetention(session, appId, build, version, dayDt, client) {
  const sinceDt = statsfunc.getDayDt(session.since);

  const daysSince = statsfunc.getDaysSince(session.since, session.start);
  const bucket = statsfunc.getRetentionBucket(daysSince);

  // on that day, how many users were from which bucket
  const retentionOnKey = `RETENTION_ON#${appId}#${build}`;
  await incrementCounter(client, JOURNEY3_STATS_TABLE, retentionOnKey, `${dayDt}#${bucket}#${version}`);

  // from that day, how many users returned on each day
  // TODO: currently days are counted as 24 hour intervals, not calendar days
  const retentionSinceKey = `RETENTION_SINCE#${appId}#${build}`;
  await incrementCounter(client, JOURNEY3_STATS_TABLE, retentionSinceKey, `${sinceDt}#${bucket}#${version}`);
}

async function updateSessionDurationDistribution(session, appId, build, version, dayDt, monthDt, yearDt, client) {
  const minutes = statsfunc.getMinutesBetween(session.start, session.end);
  const bucket = statsfunc.getDurationBucket(minutes);

  const sessionDurationByDayKey = `SESSION_DURATION_BY_DAY#${appId}#${build}`;
  const sessionDurationByMonthKey = `SESSION_DURATION_BY_MONTH#${appId}#${build}`;
  const sessionDurationByYearKey = `SESSION_DURATION_BY_YEAR#${appId}#${build}`;

  await incrementCounter(client, JOURNEY3_STATS_TABLE, sessionDurationByDayKey, `${dayDt}#${bucket}#${version}`);
  await incrementCounter(client, JOURNEY3_STATS_TABLE, sessionDurationByMonthKey, `${monthDt}#${bucket}#${version}`);
  await incrementCounter(client, JOURNEY3_STATS_TABLE, sessionDurationByYearKey, `${yearDt}#${bucket}#${version}`);
}

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

  const delta = statsfunc.getCountsDelta(session.evts, session.flushed);
  for (const evt in delta) {
    await incrementCounter(client, JOURNEY3_STATS_TABLE, eventsByHourKey, `${hourDt}#${evt}#${version}`, delta[evt]);
    await incrementCounter(client, JOURNEY3_STATS_TABLE, eventsByDayKey, `${dayDt}#${evt}#${version}`, delta[evt]);
    await incrementCounter(client, JOURNEY3_STATS_TABLE, eventsByMonthKey, `${monthDt}#${evt}#${version}`, delta[evt]);
  }
}

async function updateEntryEventsByPeriod(session, appId, build, version, hourDt, dayDt, monthDt, client) {
  const eventsByHourKey = `ENTRY_EVENTS_BY_HOUR#${appId}#${build}`;
  const eventsByDayKey = `ENTRY_EVENTS_BY_DAY#${appId}#${build}`;
  const eventsByMonthKey = `ENTRY_EVENTS_BY_MONTH#${appId}#${build}`;

  const evts = statsfunc.countFirstNEvents(session.evt_seq, 3);
  for (const evt in evts) {
    await incrementCounter(client, JOURNEY3_STATS_TABLE, eventsByHourKey, `${hourDt}#${evt}#${version}`, evts[evt]);
    await incrementCounter(client, JOURNEY3_STATS_TABLE, eventsByDayKey, `${dayDt}#${evt}#${version}`, evts[evt]);
    await incrementCounter(client, JOURNEY3_STATS_TABLE, eventsByMonthKey, `${monthDt}#${evt}#${version}`, evts[evt]);
  }
}

async function updateExitEventsByPeriod(session, appId, build, version, hourDt, dayDt, monthDt, client) {
  const eventsByHourKey = `EXIT_EVENTS_BY_HOUR#${appId}#${build}`;
  const eventsByDayKey = `EXIT_EVENTS_BY_DAY#${appId}#${build}`;
  const eventsByMonthKey = `EXIT_EVENTS_BY_MONTH#${appId}#${build}`;

  const evts = statsfunc.countLastNEvents(session.evt_seq, 1);
  for (const evt in evts) {
    await incrementCounter(client, JOURNEY3_STATS_TABLE, eventsByHourKey, `${hourDt}#${evt}#${version}`, evts[evt]);
    await incrementCounter(client, JOURNEY3_STATS_TABLE, eventsByDayKey, `${dayDt}#${evt}#${version}`, evts[evt]);
    await incrementCounter(client, JOURNEY3_STATS_TABLE, eventsByMonthKey, `${monthDt}#${evt}#${version}`, evts[evt]);
  }
}

async function updateEventSessionsByPeriod(session, appId, build, version, hourDt, dayDt, monthDt, client) {
  const eventSessionsByHourKey = `EVENT_SESSIONS_BY_HOUR#${appId}#${build}`;
  const eventSessionsByDayKey = `EVENT_SESSIONS_BY_DAY#${appId}#${build}`;
  const eventSessionsByMonthKey = `EVENT_SESSIONS_BY_MONTH#${appId}#${build}`;

  const nonFlushedEvents = statsfunc.getNonFlushedEvents(session.evts, session.flushed);
  for (const evt of nonFlushedEvents) {
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

async function updateCrashSessionsByPeriod(appId, build, version, hourDt, dayDt, monthDt, client) {
  const crashSessionsByHourKey = `CRASH_SESSIONS_BY_HOUR#${appId}#${build}`;
  const crashSessionsByDayKey = `CRASH_SESSIONS_BY_DAY#${appId}#${build}`;
  const crashSessionsByMonthKey = `CRASH_SESSIONS_BY_MONTH#${appId}#${build}`;

  await incrementCounter(client, JOURNEY3_STATS_TABLE, crashSessionsByHourKey, `${hourDt}#${version}`);
  await incrementCounter(client, JOURNEY3_STATS_TABLE, crashSessionsByDayKey, `${dayDt}#${version}`);
  await incrementCounter(client, JOURNEY3_STATS_TABLE, crashSessionsByMonthKey, `${monthDt}#${version}`);
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

async function updateConversionsFromHead(session, appId, build, version, dayDt, monthDt, yearDt, client) {
  const prevStage = R.pathOr(1, ['prev_stage', 'stage'], session);

  const conversionsDayKey = `CONVERSIONS_BY_DAY#${appId}#${build}`;
  const conversionsMonthKey = `CONVERSIONS_BY_MONTH#${appId}#${build}`;
  const conversionsYearKey = `CONVERSIONS_BY_YEAR#${appId}#${build}`;

  if (session.fst_launch_day) {
    for (let s = 1; s <= prevStage; s++) {
      await incrementCounter(client, JOURNEY3_STATS_TABLE, conversionsDayKey, `${dayDt}#${s}#${version}`);
    }
  }
  if (session.fst_launch_month) {
    for (let s = 1; s <= prevStage; s++) {
      await incrementCounter(client, JOURNEY3_STATS_TABLE, conversionsMonthKey, `${monthDt}#${s}#${version}`);
    }
  }
  if (session.fst_launch_year) {
    for (let s = 1; s <= prevStage; s++) {
      await incrementCounter(client, JOURNEY3_STATS_TABLE, conversionsYearKey, `${yearDt}#${s}#${version}`);
    }
  }
}

async function updateConversionsFromTail(session, appId, build, version, dayDt, monthDt, yearDt, client) {
  const prevStage = R.pathOr(1, ['prev_stage', 'stage'], session);
  const newStage = R.pathOr(1, ['new_stage', 'stage'], session);

  const conversionsDayKey = `CONVERSIONS_BY_DAY#${appId}#${build}`;
  const conversionsMonthKey = `CONVERSIONS_BY_MONTH#${appId}#${build}`;
  const conversionsYearKey = `CONVERSIONS_BY_YEAR#${appId}#${build}`;

  if (newStage > prevStage) {
    for (let s = prevStage + 1; s <= newStage; s++) {
      await incrementCounter(client, JOURNEY3_STATS_TABLE, conversionsDayKey, `${dayDt}#${s}#${version}`);
    }
  }

  if (newStage > prevStage) {
    for (let s = prevStage + 1; s <= newStage; s++) {
      await incrementCounter(client, JOURNEY3_STATS_TABLE, conversionsMonthKey, `${monthDt}#${s}#${version}`);
    }
  }

  if (newStage > prevStage) {
    for (let s = prevStage + 1; s <= newStage; s++) {
      await incrementCounter(client, JOURNEY3_STATS_TABLE, conversionsYearKey, `${yearDt}#${s}#${version}`);
    }
  }
}

async function updateStageMetadataFromHead(session, appId, build, client) {
  const prevStage = R.pathOr(1, ['prev_stage', 'stage'], session);

  const prevStageName = R.pathOr('new_user', ['prev_stage', 'name'], session);

  const stagesKey = `STAGES#${appId}#${build}`;
  saveString(client, JOURNEY3_META_TABLE, stagesKey, `${prevStage}`, prevStageName);
}

async function updateStageMetadataFromTail(session, appId, build, client) {
  const prevStage = R.pathOr(1, ['prev_stage', 'stage'], session);
  const newStage = R.pathOr(1, ['new_stage', 'stage'], session);

  const prevStageName = R.pathOr('new_user', ['prev_stage', 'name'], session);
  const newStageName = R.pathOr('new_user', ['new_stage', 'name'], session);

  const stagesKey = `STAGES#${appId}#${build}`;
  saveString(client, JOURNEY3_META_TABLE, stagesKey, `${prevStage}`, prevStageName);
  saveString(client, JOURNEY3_META_TABLE, stagesKey, `${newStage}`, newStageName);
}

async function updateVersionMetadata(session, appId, build, client) {
  const versionsKey = `VERSIONS#${appId}#${build}`;
  saveString(client, JOURNEY3_META_TABLE, versionsKey, `${session.version}`, '');
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

async function saveString(client, tableName, key, sortKey, s) {
  var params = {
    TableName: tableName,
    Item: {
      Key: { S: key },
      SortKey: { S: sortKey },
      Val: { S: s }
    },
  };

  return await client.send(new PutItemCommand(params));
}

async function saveObject(client, tableName, key, sortKey, obj, ttl) {
  var params = {
    TableName: tableName,
    Item: {
      Key: { S: key },
      SortKey: { S: sortKey },
      Val: { S: JSON.stringify(obj) },
      ttl: { N: `${ttl}` },
    },
  };

  return await client.send(new PutItemCommand(params));
}