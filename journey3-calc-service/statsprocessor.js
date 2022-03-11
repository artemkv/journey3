const statsFunctions = require('./statsfunc');

exports.processMessage = async (session, dynamoConnector) => {
  // Check with database
  if (!(await dynamoConnector.appExists(session.acc, session.aid))) {
    throw new Error(`Application '${session.aid}' for account '${session.acc}' does not exist`);
  }

  // TODO: validate/sanitize
  if (!session.dts) {
    throw new Error(`Missing required session property: dts`);
  }
  if (!session.ids) {
    throw new Error(`Missing required session property: ids`);
  }

  // Save session
  const build = session.is_release ? 'Release' : 'Debug';
  const version = session.version ? session.version : 'unknown';
  const hourDt = statsFunctions.getHourDt(session.dts);
  const ids = session.ids;
  const sessionToSave = getSessionForSaving(session);

  await dynamoConnector.saveSession(session.aid, build, version, hourDt, ids, sessionToSave);

  // Update stats
  /*let hourDt = statsFunctions.getHourDt(session.dts);
  let dayDt = statsFunctions.getDayDt(session.dts);
  let monthDt = statsFunctions.getMonthDt(session.dts);
  await dynamoConnector.updateStats(session, hourDt, dayDt, monthDt);*/
};

function getSessionForSaving(session) {
  return {
    id: session.id,
    start: session.start,
    end: session.end,
    version: session.version,
    fst_launch: session.fst_launch,
    has_error: session.has_error,
    evt_seq: session.evt_seq
  };
}