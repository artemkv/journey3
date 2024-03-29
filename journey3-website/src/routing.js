export const homePath = '/';

export const statsPath = '/';
export const appsPath = '/apps';
export const createAppPath = '/apps/create';
export const editAppPath = '/apps/:appId';

export const docPath = '/doc';
export const docPagePath = '/doc/:page';

export const docAnalyticsPath = '/doc/analytics';
export const docAnonymization = '/doc/anonymization';
export const docPerformance = '/doc/performance';
export const docPricing = '/doc/pricing';
export const docGdprExplainedPath = '/doc/gdpr_explained';
export const docGdprExamplePath = '/doc/gdpr_example';
export const docAndroidPath = '/doc/android_native';
export const docFlutterPath = '/doc/flutter';
export const docReactPath = '/doc/react_native';
export const docXamarinPath = '/doc/xamarin';
export const docIonicPath = '/doc/ionic';

export const getAppPath = (appId) => {
    return `/apps/${appId}`;
};
