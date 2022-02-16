export const statsPath = '/';
export const appsPath = '/apps';
export const createAppPath = '/apps/create';
export const editAppPath = '/apps/:appId';

export const getAppPath = (appId) => {
    return `/apps/${appId}`;
};
