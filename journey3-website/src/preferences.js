import {isSameDayNonUtc} from './datetimeutil';

export const savePeriod = (period) => {
    window.localStorage.setItem('filter.global.period', JSON.stringify(period));
};

export const getPeriod = () => {
    try {
        return JSON.parse(window.localStorage.getItem('filter.global.period'));
    } catch {
        return null;
    }
};

export const saveDt = (dt) => {
    const val = isSameDayNonUtc(dt, new Date()) ? '"today"' : JSON.stringify(dt);
    window.localStorage.setItem('filter.global.dt', val);
};

export const getDt = () => {
    try {
        const dateString = JSON.parse(window.localStorage.getItem('filter.global.dt'));
        const date = !dateString || dateString === 'today' ? new Date() : new Date(dateString);
        return date;
    } catch {
        return new Date();
    }
};

export const saveAppId = (appId) => {
    window.localStorage.setItem('filter.global.appid', JSON.stringify(appId));
};

export const getAppId = () => {
    try {
        return JSON.parse(window.localStorage.getItem('filter.global.appid'));
    } catch {
        return null;
    }
};

export const saveBuild = (build) => {
    window.localStorage.setItem('filter.global.build', JSON.stringify(build));
};

export const getBuild = () => {
    try {
        return JSON.parse(window.localStorage.getItem('filter.global.build'));
    } catch {
        return null;
    }
};

export const saveStatsSection = (section) => {
    window.localStorage.setItem('filter.global.stats_section', JSON.stringify(section));
};

export const getStatsSection = () => {
    try {
        return JSON.parse(window.localStorage.getItem('filter.global.stats_section'));
    } catch {
        return null;
    }
};
