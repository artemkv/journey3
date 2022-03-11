const { DynamoDBClient, GetItemCommand, PutItemCommand } = require("@aws-sdk/client-dynamodb");

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

/*const updateStats = async (msg, hourDt, dayDt, monthDt, client) => {
  let appLaunchCounterByHourKey = `APP_LAUNCH_CNT_BY_HOUR#${msg.aid}`;
  let appLaunchCounterByDayKey = `APP_LAUNCH_CNT_BY_DAY#${msg.aid}`;
  let appLaunchCounterByMonthKey = `APP_LAUNCH_CNT_BY_MONTH#${msg.aid}`;

  await incrementCounter(client, JOURNEY3_STATS_TABLE, appLaunchCounterByHourKey, hourDt);
  await incrementCounter(client, JOURNEY3_STATS_TABLE, appLaunchCounterByDayKey, dayDt);
  await incrementCounter(client, JOURNEY3_STATS_TABLE, appLaunchCounterByMonthKey, monthDt);
};*/

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
    /*updateStats: async (session, hourDt, dayDt, monthDt) => {
      return await updateStats(session, hourDt, dayDt, monthDt, client);
    },*/
  };
};

// Atomically increments the value of the attribute "Cnt"
// and returns the new value
/*async function incrementCounter(client, tableName, key, sortKey) {
  var params = {
    TableName: tableName,
    Key: {
      Key: key,
      SortKey: sortKey,
    },
    UpdateExpression: 'SET #val = if_not_exists(#val, :zero) + :incr',
    ExpressionAttributeNames: {
      '#val': 'Cnt',
    },
    ExpressionAttributeValues: {
      ':incr': 1,
      ':zero': 0,
    },
    ReturnValues: 'UPDATED_NEW',
  };

  return new Promise((resolve, reject) => {
    client.update(params, function (err, data) {
      if (err) {
        reject(
          `Unable to update ${tableName} table, key ${key}. Error JSON: ${JSON.stringify(
            err
          )}`
        );
      } else {
        resolve(data.Attributes.Cnt);
      }
    });
  });
}*/

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