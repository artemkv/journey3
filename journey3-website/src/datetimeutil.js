import dayjs from 'dayjs';

import {charRange} from './util';

export function getYear(date) {
    return date.getFullYear();
}

export function getMonth(date) {
    let month = date.getMonth() + 1;
    if (month < 10) {
        month = '0' + month.toString();
    } else {
        month = month.toString();
    }
    return month;
}

export function getDay(date) {
    let day = date.getDate();
    if (day < 10) {
        day = '0' + day.toString();
    } else {
        day = day.toString();
    }
    return day;
}

export function getHour(date) {
    let hour = date.getHours();
    if (hour < 10) {
        hour = '0' + hour.toString();
    } else {
        hour = hour.toString();
    }
    return hour;
}

export function getDt(period, date) {
    switch (period) {
    case 'year':
        return `${getYear(date)}`;
    case 'month':
        return `${getYear(date)}${getMonth(date)}`;
    case 'day':
        return `${getYear(date)}${getMonth(date)}${getDay(date)}`;
    case 'hour':
        return `${getYear(date)}${getMonth(date)}${getDay(date)}${getHour(date)}`;
    default:
        throw new Error(`Unknown period ${period}`);
    }
}

export function getPeriodDts(period, date) {
    const startDt = getDt(period, date);
    switch (period) {
    case 'year':
        return charRange(1, 12).map((x) => startDt + x);
    case 'month':
        return charRange(1, 31).map((x) => startDt + x);
    case 'day':
        return charRange(0, 24).map((x) => startDt + x);
    case 'hour':
        return charRange(1, 60).map((x) => startDt + x);
    default:
        throw new Error(`Unknown period ${period}`);
    }
}

export function daysInMonth(date) {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
}

export function getLast10Years(date) {
    const currentYear = date.getFullYear();
    const years = [];
    for (let year = currentYear - 9; year <= currentYear; year++) {
        years.unshift(year);
    }
    return years;
}

export const getDaysSince = (since, start) => {
    const from = dayjs(since);
    const to = dayjs(start);

    return to.diff(from, 'day');
};

export const getYearMonthInputFormat = (date) => {
    return `${getYear(date)}-${getMonth(date)}`;
};

export const getYearMonthDayInputFormat = (date) => {
    return `${getYear(date)}-${getMonth(date)}-${getDay(date)}`;
};

export const fromYearInputFormat = (text) => {
    const d = dayjs(text, 'YYYY');
    return new Date(d.year(), 1, 1);
};

export const fromYearMonthInputFormat = (text) => {
    const d = dayjs(text, 'YYYY-MM');
    return new Date(d.year(), d.month(), 1);
};

export const fromYearMonthDayInputFormat = (text) => {
    const d = dayjs(text, 'YYYY-MM-DD');
    return new Date(d.year(), d.month(), d.date());
};

export const prevDay = (date) => {
    const d = dayjs(date);
    const d1 = d.subtract(1, 'day');
    return new Date(d1.year(), d1.month(), d1.date());
};

export const nextDay = (date) => {
    const d = dayjs(date);
    const d1 = d.add(1, 'day');
    return new Date(d1.year(), d1.month(), d1.date());
};

export const prevMonth = (date) => {
    const d = dayjs(date);
    const d1 = d.subtract(1, 'month');
    return new Date(d1.year(), d1.month(), 1);
};

export const nextMonth = (date) => {
    const d = dayjs(date);
    const d1 = d.add(1, 'month');
    return new Date(d1.year(), d1.month(), 1);
};

export const prevYear = (date) => {
    const d = dayjs(date);
    const d1 = d.subtract(1, 'year');
    return new Date(d1.year(), d1.month(), 1);
};

export const nextYear = (date) => {
    const d = dayjs(date);
    const d1 = d.add(1, 'year');
    return new Date(d1.year(), d1.month(), 1);
};
