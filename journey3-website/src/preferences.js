import {isSameDayNonUtc} from './datetimeutil';

export const savePeriod = (period) => {
    window.localStorage.setItem('filter.global.period', period);
};

export const getPeriod = () => {
    return window.localStorage.getItem('filter.global.period');
};

export const saveDt = (dt) => {
    const val = isSameDayNonUtc(dt, new Date()) ? '"today"' : JSON.stringify(dt);
    window.localStorage.setItem('filter.global.dt', val);
};

export const getDt = () => {
    const dateString = JSON.parse(window.localStorage.getItem('filter.global.dt'));
    const date = dateString === 'today' ? new Date() : new Date(dateString);
    return date;
};

export const saveAppId = (appId) => {
    window.localStorage.setItem('filter.global.appid', appId);
};

export const getAppId = () => {
    return window.localStorage.getItem('filter.global.appid');
};

export const saveBuild = (build) => {
    window.localStorage.setItem('filter.global.build', build);
};

export const getBuild = () => {
    return window.localStorage.getItem('filter.global.build');
};
