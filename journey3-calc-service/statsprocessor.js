const statsFunctions = require('./statsfunc');

exports.processMessage = async (msg, dynamoConnector) => {
  // TODO: validate/sanitize

  // Check with database
  if (!(await dynamoConnector.appExists(msg.acc, msg.aid))) {
    throw new Error(`Application '${msg.aid}' for account '${msg.acc}' does not exist`);
  }

  // Update stats
  let hourDt = statsFunctions.getHourDt(msg.dts);
  let dayDt = statsFunctions.getDayDt(msg.dts);
  let monthDt = statsFunctions.getMonthDt(msg.dts);
  await dynamoConnector.updateStats(msg, hourDt, dayDt, monthDt);
};
