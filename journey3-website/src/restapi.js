// TODO: where to configure it?
const baseUrl = 'https://journey3-web.artemkv.net:8070';
// const baseUrl = 'http://127.0.0.1:8070';

class ApiError extends Error {
    constructor(statusCode, statusMessage, ...params) {
        // Pass remaining arguments (including vendor specific ones) to parent constructor
        super(...params);

        // Maintains proper stack trace for where our error was thrown (only available on V8)
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, ApiError);
        }

        this.name = 'ApiError';
        this.statusCode = statusCode;
        this.statusMessage = statusMessage;
    }
}

function handleErrors(response) {
    if (response.status < 400) {
        return response;
    }
    throw new ApiError(
        response.status,
        response.statusText,
        response.statusText);
}

function toJson(response) {
    return response.json();
}

function toData(json) {
    return json.data;
}

function getJson(endpoint, session) {
    const headers = {};
    if (session) {
        headers['x-session'] = session;
    }

    return fetch(
        baseUrl + endpoint,
        {
            mode: 'cors',
            headers
        })
        .then(handleErrors)
        .then(toJson)
        .then(toData);
}

function postJson(endpoint, data, session) {
    const headers = {
        'Content-Type': 'application/json'
    };
    if (session) {
        headers['x-session'] = session;
    }

    return fetch(
        baseUrl + endpoint,
        {
            method: 'POST',
            mode: 'cors',
            cache: 'no-cache',
            headers,
            body: data ? JSON.stringify(data) : null
        })
        .then(handleErrors)
        .then(toJson)
        .then(toData);
}

function putJson(endpoint, data, session) {
    const headers = {
        'Content-Type': 'application/json'
    };
    if (session) {
        headers['x-session'] = session;
    }

    return fetch(
        baseUrl + endpoint,
        {
            method: 'PUT',
            mode: 'cors',
            cache: 'no-cache',
            headers,
            body: data ? JSON.stringify(data) : null
        })
        .then(handleErrors)
        .then(toJson)
        .then(toData);
}

export const signIn = (idToken) => {
    return postJson('/signin', {id_token: idToken});
};

export const getSessionsPerPeriod = (appId, build, period, dt, session) => {
    return getJson(`/sessions_per_period?aid=${appId}&build=${build}&period=${period}&dt=${dt}`, session);
};

export const getErrorSessionsPerPeriod = (appId, build, period, dt, session) => {
    return getJson(`/error_sessions_per_period?aid=${appId}&build=${build}&period=${period}&dt=${dt}`, session);
};

export const getCrashSessionsPerPeriod = (appId, build, period, dt, session) => {
    return getJson(`/crash_sessions_per_period?aid=${appId}&build=${build}&period=${period}&dt=${dt}`, session);
};

export const getEventsPerPeriod = (appId, build, period, dt, session) => {
    return getJson(`/events_per_period?aid=${appId}&build=${build}&period=${period}&dt=${dt}`, session);
};

export const getEntryEventsPerPeriod = (appId, build, period, dt, session) => {
    return getJson(`/entry_events?aid=${appId}&build=${build}&period=${period}&dt=${dt}`, session);
};

export const getExitEventsPerPeriod = (appId, build, period, dt, session) => {
    return getJson(`/exit_events?aid=${appId}&build=${build}&period=${period}&dt=${dt}`, session);
};

export const getEventSessionsPerPeriod = (appId, build, period, dt, session) => {
    return getJson(`/event_sessions_per_period?aid=${appId}&build=${build}&period=${period}&dt=${dt}`, session);
};

export const getSessionDurationPerPeriod = (appId, build, period, dt, session) => {
    return getJson(`/event_sessions_duration?aid=${appId}&build=${build}&period=${period}&dt=${dt}`, session);
};

export const getUniqueUsersPerPeriod = (appId, build, period, dt, session) => {
    return getJson(`/unique_users_per_period?aid=${appId}&build=${build}&period=${period}&dt=${dt}`, session);
};

export const getNewUsersPerPeriod = (appId, build, period, dt, session) => {
    return getJson(`/new_users_per_period?aid=${appId}&build=${build}&period=${period}&dt=${dt}`, session);
};

export const getRetentionOnDay = (appId, build, period, dt, session) => {
    return getJson(`/retention_on_day?aid=${appId}&build=${build}&period=${period}&dt=${dt}`, session);
};

export const getRetentionSinceDay = (appId, build, period, dt, session) => {
    return getJson(`/retention_since_day?aid=${appId}&build=${build}&period=${period}&dt=${dt}`, session);
};

export const getConversions = (appId, build, period, dt, session) => {
    return getJson(`/conversions?aid=${appId}&build=${build}&period=${period}&dt=${dt}`, session);
};

export const getUserSessions = (appId, build, errLevel, version, session) => {
    return getJson(`/user_sessions?aid=${appId}&build=${build}&err_level=${errLevel}&version=${version}`, session);
};

export const getAcc = (session) => {
    return getJson(`/acc`, session);
};

export const getApps = (session) => {
    return getJson(`/apps`, session);
};

export const getApp = (session, appId) => {
    return getJson(`/apps/${appId}`, session);
};

export const putApp = (session, app) => {
    return putJson(`/apps/${app.aid}`, app, session);
};

export const postApp = (session, app) => {
    return postJson(`/apps`, app, session);
};

export const postFeedback = (text) => {
    const headers = {
        'Content-Type': 'application/json'
    };

    return fetch(
        baseUrl + '/feedback',
        {
            method: 'POST',
            mode: 'cors',
            cache: 'no-cache',
            headers,
            body: JSON.stringify({text})
        })
        .then(handleErrors)
        .then(toJson)
        .then(toData);
};
