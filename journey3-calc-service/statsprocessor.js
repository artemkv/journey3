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
  // TODO: validate stage!!!

  // Extract common data
  const yearDt = statsFunctions.getYearDt(session.start);
  const hourDt = statsFunctions.getHourDt(session.start);
  const dayDt = statsFunctions.getDayDt(session.start);
  const monthDt = statsFunctions.getMonthDt(session.start);
  const build = session.is_release ? 'Release' : 'Debug';
  const version = session.version ? session.version : 'unknown';
  const ids = session.ids;

  // Save session
  if (session.t === "stail" || !session.t) {
    const sessionToSave = getSessionForSaving(session);
    await dynamoConnector.saveSession(session.aid, build, version, hourDt, ids, sessionToSave);
  }

  // Update stats
  if (!session.t) {
    await dynamoConnector.updateStats(session, build, version, hourDt, dayDt, monthDt, yearDt);
  } else if (session.t === "shead") {
    await dynamoConnector.updateStatsFromSessionHead(session, build, version, hourDt, dayDt, monthDt, yearDt);
  } else if (session.t === "stail") {
    await dynamoConnector.updateStatsFromSessionTail(session, build, version, hourDt, dayDt, monthDt, yearDt);
  }
};

function getSessionForSaving(session) {
  return {
    id: session.ids,
    start: session.start,
    end: session.end,
    version: session.version,
    fst_launch: session.fst_launch,
    has_error: session.has_error,
    evt_seq: session.evt_seq
  };
}