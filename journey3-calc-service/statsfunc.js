'use strict';

const dt = require('@artemkv/datetimeutil');
const dayjs = require('dayjs');

// Pure function go here

// TODO: Unit-test

/* TODO:
const validateAction = function validateAction(action) {
    if (!action) {
        return { error: "action is empty" };
    }

    if (!action.acc) {
        return { error: "missing or empty attribute 'acc'" };
    }
    if (!action.aid) {
        return { error: "missing or empty attribute 'aid'" };
    }
    if (!action.uid) {
        return { error: "missing or empty attribute 'uid'" };
    }
    if (!action.act) {
        return { error: "missing or empty attribute 'act'" };
    }
    if (!action.dts) {
        return { error: "missing or empty attribute 'dts'" };
    }
    return { ok: true }
}*/

// TODO: rewrite everything in a same stile, probably using lambdas

const getHourDt = function getHourDt(date) {
  let dateUtc = new Date(date);
  return (
    dt.getYearString(dateUtc) +
    dt.getMonthString(dateUtc) +
    dt.getDayString(dateUtc) +
    dt.getHoursString(dateUtc)
  );
};

const getDayDt = function getDayDt(date) {
  let dateUtc = new Date(date);
  return (
    dt.getYearString(dateUtc) +
    dt.getMonthString(dateUtc) +
    dt.getDayString(dateUtc)
  );
};

const getDay = function getDayDt(date) {
  let dateUtc = new Date(date);
  return `${dt.getYearString(dateUtc)}-${dt.getMonthString(dateUtc)}${dt.getDayString(dateUtc)}`;
}

const getMonthDt = function getMonthDt(date) {
  let dateUtc = new Date(date);
  return dt.getYearString(dateUtc) + dt.getMonthString(dateUtc);
};

const getYearDt = function getYearDt(date) {
  let dateUtc = new Date(date);
  return dt.getYearString(dateUtc);
};

const getDaysSince = (since, start) => {
  const from = dayjs(getDay(since));
  const to = dayjs(getDay(start));

  return to.diff(from, 'day');
}

const getMinutesBetween = (start, end) => {
  const from = dayjs(start);
  const to = dayjs(end);

  console.log(from)
  console.log(to)

  return to.diff(from, 'minute');
}

const getRetentionBucket = (daysSince) => {
  if (daysSince <= 0) {
    return 0;
  }

  const buckets = [1, 2, 5, 8, 12, 18, 27, 40, 60, 1000000];
  let idx = 0;
  while (daysSince > buckets[idx]) {
    idx++;
  }
  return buckets[idx];
}

const getDurationBucket = (minutes) => {
  if (minutes <= 0) {
    return 0;
  }

  const buckets = [1, 2, 5, 8, 12, 18, 27, 40, 60, 90, 1000000];
  let idx = 0;
  while (minutes > buckets[idx]) {
    idx++;
  }
  return buckets[idx];
}

const getErrorLevel = (session) => {
  let errLevel= 'n';
  if (session.has_crash) {
    errLevel = 'c';
  } else if (session.has_error) {
    errLevel = 'e';
  }
  return errLevel;
}

exports.getHourDt = getHourDt;
exports.getDayDt = getDayDt;
exports.getMonthDt = getMonthDt;
exports.getYearDt = getYearDt;
exports.getDaysSince = getDaysSince;
exports.getRetentionBucket = getRetentionBucket;
exports.getErrorLevel = getErrorLevel;
exports.getMinutesBetween = getMinutesBetween;
exports.getDurationBucket = getDurationBucket;