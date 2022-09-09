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

test('getMinutesBetween', () => {
  expect(statsfunc.getMinutesBetween('2022-03-23T17:30:50.888718Z', '2022-03-23T17:42:28.924017Z')).toBe(11);
  expect(statsfunc.getMinutesBetween('2022-03-23T17:30:50.888718Z', '2022-03-23T17:42:50.924017Z')).toBe(12);
  expect(statsfunc.getMinutesBetween('2022-03-23T17:30:50.888718Z', '2022-03-23T17:42:51.924017Z')).toBe(12);
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

test('getDurationBucket', () => {
  expect(statsfunc.getDurationBucket(-1)).toBe(0);
  expect(statsfunc.getDurationBucket(0)).toBe(0);
  expect(statsfunc.getDurationBucket(1)).toBe(1);
  expect(statsfunc.getDurationBucket(2)).toBe(2);
  expect(statsfunc.getDurationBucket(3)).toBe(5);
  expect(statsfunc.getDurationBucket(5)).toBe(5);
  expect(statsfunc.getDurationBucket(25)).toBe(27);
  expect(statsfunc.getDurationBucket(60)).toBe(60);
  expect(statsfunc.getDurationBucket(61)).toBe(90);
  expect(statsfunc.getDurationBucket(91)).toBe(1000000);
});

test('getEventNormalized', () => {
  expect(statsfunc.getEventNormalized('abc')).toBe('abc');
  expect(statsfunc.getEventNormalized('(abc)')).toBe('abc');
  expect(statsfunc.getEventNormalized('(abc')).toBe('abc');
  expect(statsfunc.getEventNormalized('abc)')).toBe('abc');
});

test('countFirstNEvents', () => {
  expect(statsfunc.countFirstNEvents(['aa'], 3)).toStrictEqual({ 'aa': 1 });
  expect(statsfunc.countFirstNEvents(['aa', 'bb'], 3)).toStrictEqual({ 'aa': 1, 'bb': 1 });
  expect(statsfunc.countFirstNEvents(['aa', 'bb', 'aa'], 3)).toStrictEqual({ 'aa': 2, 'bb': 1 });
  expect(statsfunc.countFirstNEvents(['aa', 'bb', 'aa', 'bb'], 3)).toStrictEqual({ 'aa': 2, 'bb': 1 });
  expect(statsfunc.countFirstNEvents(['aa', '(bb)', 'aa'], 3)).toStrictEqual({ 'aa': 2, 'bb': 1 });
});

test('countLastNEvents', () => {
  expect(statsfunc.countLastNEvents(['aa'], 3)).toStrictEqual({ 'aa': 1 });
  expect(statsfunc.countLastNEvents(['aa', 'bb'], 3)).toStrictEqual({ 'aa': 1, 'bb': 1 });
  expect(statsfunc.countLastNEvents(['aa', 'bb', 'aa'], 3)).toStrictEqual({ 'aa': 2, 'bb': 1 });
  expect(statsfunc.countLastNEvents(['aa', 'bb', 'aa', 'bb'], 3)).toStrictEqual({ 'aa': 1, 'bb': 2 });
  expect(statsfunc.countLastNEvents(['aa', 'bb', 'cc', 'dd', 'ee'], 3)).toStrictEqual({ 'cc': 1, 'dd': 1, 'ee': 1 });
  expect(statsfunc.countLastNEvents(['aa', '(bb)', 'aa'], 3)).toStrictEqual({ 'aa': 2, 'bb': 1 });
});
