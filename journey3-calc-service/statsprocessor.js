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
  // TODO: check format
  if (!session.start) {
    throw new Error(`Missing required session property: start`);
  }

  // Extract common data
  const hourDt = statsFunctions.getHourDt(session.start);
  const dayDt = statsFunctions.getDayDt(session.start);
  const monthDt = statsFunctions.getMonthDt(session.start);
  const build = session.is_release ? 'Release' : 'Debug';
  const version = session.version ? session.version : 'unknown';
  const ids = session.ids;

  // Save session
  const sessionToSave = getSessionForSaving(session);
  await dynamoConnector.saveSession(session.aid, build, version, hourDt, ids, sessionToSave);

  // Update stats
  await dynamoConnector.updateStats(build, version, session, hourDt, dayDt, monthDt);
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