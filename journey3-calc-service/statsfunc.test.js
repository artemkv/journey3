'use strict';

const statsfunc = require('./statsfunc');

test('getDaysSince', () => {
  // same day but later
  expect(statsfunc.getDaysSince('2022-03-23T17:30:50.888718Z', '2022-03-23T23:25:28.924017Z')).toBe(0);
  // next day but not before full 24 hours
  expect(statsfunc.getDaysSince('2022-03-23T23:25:28.924017Z', '2022-03-24T17:30:50.888718Z')).toBe(1);
  // next day and more than 24 hours later
  expect(statsfunc.getDaysSince('2022-03-22T17:30:50.888718Z', '2022-03-23T23:25:28.924017Z')).toBe(1);
  // more than 1 day difference
  expect(statsfunc.getDaysSince('2022-03-19T23:25:28.924017Z', '2022-03-23T17:30:50.888718Z')).toBe(4);

  // 1 second before full 24 hours
  expect(statsfunc.getDaysSince('2022-03-23T17:30:50.888718Z', '2022-03-24T17:30:49.888718Z')).toBe(1);
  // just 1 second over 24 hours
  expect(statsfunc.getDaysSince('2022-03-23T17:30:50.888718Z', '2022-03-24T17:30:51.888718Z')).toBe(1);
});

test('getRetentionBucket', () => {
  expect(statsfunc.getRetentionBucket(-1)).toBe(0);
  expect(statsfunc.getRetentionBucket(0)).toBe(0);
  expect(statsfunc.getRetentionBucket(1)).toBe(1);
  expect(statsfunc.getRetentionBucket(2)).toBe(2);
  expect(statsfunc.getRetentionBucket(3)).toBe(5);
  expect(statsfunc.getRetentionBucket(5)).toBe(5);
  expect(statsfunc.getRetentionBucket(25)).toBe(27);
  expect(statsfunc.getRetentionBucket(60)).toBe(60);
  expect(statsfunc.getRetentionBucket(61)).toBe(1000000);
});