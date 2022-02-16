var AWS = require('aws-sdk');

const JOURNEY3_APP_TABLE = 'journey3app';
const JOURNEY3_STATS_TABLE = 'journey3stats';

const appExists = async (acc, aid, client) => {
  return await keyExists(client, JOURNEY3_APP_TABLE, `APP#${acc}`, aid);
}

const updateStats = async (msg, hourDt, dayDt, monthDt, client) => {
  let appLaunchCounterByHourKey = `APP_LAUNCH_CNT_BY_HOUR#${msg.aid}`;
  let appLaunchCounterByDayKey = `APP_LAUNCH_CNT_BY_DAY#${msg.aid}`;
  let appLaunchCounterByMonthKey = `APP_LAUNCH_CNT_BY_MONTH#${msg.aid}`;

  await incrementCounter(client, JOURNEY3_STATS_TABLE, appLaunchCounterByHourKey, hourDt);
  await incrementCounter(client, JOURNEY3_STATS_TABLE, appLaunchCounterByDayKey, dayDt);
  await incrementCounter(client, JOURNEY3_STATS_TABLE, appLaunchCounterByMonthKey, monthDt);
};

exports.getConnector = () => {
  let options = {};
  if (process.env.IS_OFFLINE) {
    options.region = 'localhost';
    options.endpoint = 'http://localhost:8000';
  }
  var client = new AWS.DynamoDB.DocumentClient(options);

  return {
    appExists: async (acc, aid) => {
      return await appExists(acc, aid, client);
    },
    updateStats: async (action, hourDt, dayDt, monthDt) => {
      return await updateStats(action, hourDt, dayDt, monthDt, client);
    },
  };
};

// Atomically increments the value of the attribute "Cnt"
// and returns the new value
async function incrementCounter(client, tableName, key, sortKey) {
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
}

// Checks whether the specified key can be found in the stats table
async function keyExists(client, tableName, key, sortKey) {
  var params = {
    TableName: tableName,
    Key: {
      Key: key,
      SortKey: sortKey,
    },
    AttributesToGet: ['Key'],
  };

  return new Promise((resolve, reject) => {
    client.get(params, function (err, data) {
      if (err) {
        reject(
          `Unable to check existence of the key in '${tableName}' table, key '${key}'. Error JSON: ${JSON.stringify(
            err
          )}`
        );
      } else {
        let exists = false;
        if (data.Item !== undefined && data.Item !== null) {
          exists = true;
        }
        resolve(exists);
      }
    });
  });
}
