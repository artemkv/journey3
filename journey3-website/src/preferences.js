import {isSameDayNonUtc} from './datetimeutil';

export const savePeriod = (period) => {
    window.localStorage.setItem('filter.global.period', JSON.stringify(period));
};

export const getPeriod = () => {
    return JSON.parse(window.localStorage.getItem('filter.global.period'));
};

export const saveDt = (dt) => {
    const val = isSameDayNonUtc(dt, new Date()) ? '"today"' : JSON.stringify(dt);
    window.localStorage.setItem('filter.global.dt', val);
};

export const getDt = () => {
    const dateString = JSON.parse(window.localStorage.getItem('filter.global.dt'));
    const date = !dateString || dateString === 'today' ? new Date() : new Date(dateString);
    return date;
};

export const saveAppId = (appId) => {
    window.localStorage.setItem('filter.global.appid', JSON.stringify(appId));
};

export const getAppId = () => {
    return JSON.parse(window.localStorage.getItem('filter.global.appid'));
};

export const saveBuild = (build) => {
    window.localStorage.setItem('filter.global.build', JSON.stringify(build));
};

export const getBuild = () => {
    return JSON.parse(window.localStorage.getItem('filter.global.build'));
};

export const saveStatsSection = (section) => {
    window.localStorage.setItem('filter.global.stats_section', JSON.stringify(section));
};

export const getStatsSection = () => {
    return JSON.parse(window.localStorage.getItem('filter.global.stats_section'));
};
