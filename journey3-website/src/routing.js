export const homePath = '/';

export const statsPath = '/';
export const appsPath = '/apps';
export const createAppPath = '/apps/create';
export const editAppPath = '/apps/:appId';

export const docPath = '/doc';
export const docPagePath = '/doc/:page';

export const docGdprExplainedPath = '/doc/gdpr_explained';
export const docGdprExamplePath = '/doc/gdpr_example';

export const getAppPath = (appId) => {
    return `/apps/${appId}`;
};
