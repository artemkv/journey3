import {range} from 'ramda';
import * as dateTimeUtil from '../datetimeutil';
import {charRange} from '../util';

export const getLabels = (period, dateTime) => {
    switch (period) {
    case 'year':
        return ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    case 'month':
        return charRange(1, dateTimeUtil.daysInMonth(dateTime));
    case 'day':
        return charRange(0, 24).map((x) => x + ':00');
    default:
        throw new Error(`Unknown period ${period}`);
    }
};

export const getHigherPeriodTotal = (data, filterOptions, period, dateTime) => {
    const dt = dateTimeUtil.getDt(period, dateTime);
    const filterFunc = getDimFilterFunc(filterOptions);
    const dateFilterFunc = (rec) => filterFunc(rec) && rec.dt === dt;

    const visibleData = data.filter(dateFilterFunc);
    return visibleData.map((x) => x.count).reduce((total, num) => total + num, 0);
};

export const getValues = (data, filterOptions, period, dateTime) => {
    const values = {};

    const keyFunc = getDimKeyFunc(filterOptions);
    const filterFunc = getDimFilterFunc(filterOptions);

    const visibleData = data.filter(filterFunc);

    const keys = extractDimKeys(visibleData, keyFunc);
    const dts = dateTimeUtil.getPeriodDts(period, dateTime);

    // prepare dimensions
    keys.forEach((k) => values[k] = {label: k, values: {}});
    // fills dimensions with zero values
    dts.forEach((dt) => {
        itermap(values, (v) => {
            v.values[dt] = 0;
        });
    });
    // project data
    visibleData
        .forEach((x) => {
            values[keyFunc(x)].values[x.dt] += x.count;
        });
    // convert to final format
    return mapmap(values, (v) => {
        return {
            label: v.label,
            values: dts.map((dt) => v.values[dt])
        };
    });
};

export const getFilterOptions = (data, useEvents) => {
    const filterOptions = {
        dimensions: {
            version: {
                id: 'version',
                title: 'Version',
                all: {
                    label: 'All versions',
                    checked: true
                },
                selected: {}
            }
        }
    };
    const versions = extractDimKeys(data, (x) => x.version);
    versions.forEach((x) => filterOptions.dimensions.version.selected[x] = ({
        id: x,
        label: x,
        checked: false
    }));

    if (useEvents) {
        filterOptions.dimensions.event = {
            id: 'event',
            title: 'Event',
            all: {
                label: 'All events',
                checked: true
            },
            selected: {}
        };

        const events = extractDimKeys(data, (x) => x.evt);
        events.forEach((x) => filterOptions.dimensions.event.selected[x] = ({
            id: x,
            label: x,
            checked: false
        }));
    }

    return filterOptions;
};

const extractDimKeys = (data, keyFunc) => {
    const keys = {};
    data.forEach((x) => {
        const key = keyFunc(x);
        keys[key] = key;
    });
    return mapmap(keys, id);
};

const getDimKeyFunc = (filterOptions) => {
    const splitByVersion = !filterOptions.dimensions.version.all.checked;
    const splitByEvent = filterOptions.dimensions.event &&
        !filterOptions.dimensions.event.all.checked;

    if (splitByVersion && !splitByEvent) {
        return (rec) => rec.version;
    } else if (!splitByVersion && splitByEvent) {
        return (rec) => rec.evt;
    } else if (splitByVersion && splitByEvent) {
        return (rec) => `${rec.version}, ${rec.evt}`; // TODO: format
    } else {
        return (_) => 1; // TODO: good label
    }
};

const getDimFilterFunc = (filterOptions) => {
    const splitByVersion = !filterOptions.dimensions.version.all.checked;
    const splitByEvent = filterOptions.dimensions.event &&
        !filterOptions.dimensions.event.all.checked;

    let versionsToInclude = {};
    if (splitByVersion) {
        versionsToInclude = toset(Object.keys(filterOptions.dimensions.version.selected)
            .filter((key, _) => filterOptions.dimensions.version.selected[key].checked));
    }

    let eventsToInclude = {};
    if (splitByEvent) {
        eventsToInclude = toset(Object.keys(filterOptions.dimensions.event.selected)
            .filter((key, _) => filterOptions.dimensions.event.selected[key].checked));
    }

    if (splitByVersion && !splitByEvent) {
        return (rec) => rec.version in versionsToInclude;
    } else if (!splitByVersion && splitByEvent) {
        return (rec) => rec.evt in eventsToInclude;
    } else if (splitByVersion && splitByEvent) {
        return (rec) => rec.version in versionsToInclude && rec.evt in eventsToInclude;
    } else {
        return (_) => true;
    }
};


export const getDatasets = (values) => {
    if (values.length == 0) {
        return [{
            label: 'Count',
            data: [],
            backgroundColor: CHART_COLORS[0],
            borderColor: CHART_COLORS[0],
            fill: false,
            lineTension: .1
        }];
    }

    return values.map((x, idx) => ({
        label: x.label,
        data: x.values,
        backgroundColor: CHART_COLORS[idx],
        borderColor: CHART_COLORS[idx],
        fill: false,
        lineTension: .1
    }));
};

export const getMaxValue = (values) => {
    return Math.max(...values.map((x) => x.values).flat(), 1);
};

export const getTotal = (values) => {
    return values.map((x) => x.values).flat().reduce((total, num) => total + num, 0);
};

export const getRetentionBuckets = () => {
    return ['0', '1', '2', '5', '8', '12', '18', '27', '40', '60', '90'];
};

export const getRetentionBucketLabels = () => {
    return ['0 days', '1 day', '2 days', '3-5 days', '6-8 days',
        '9-12 days', '13-18 days', '19-27 days', '28-40 days', '41-60 days', '>60 days'];
};

export const getBucketIdx = (since, start) => {
    const days = dateTimeUtil.getDaysSince(since, start);

    if (days < 1) {
        return 0;
    }
    if (days == 1) {
        return 1;
    }
    if (days <= 2) {
        return 2;
    }
    if (days <= 5) {
        return 3;
    }
    if (days <= 8) {
        return 4;
    }
    if (days <= 12) {
        return 5;
    }
    if (days <= 18) {
        return 6;
    }
    if (days <= 27) {
        return 7;
    }
    if (days <= 40) {
        return 8;
    }
    if (days <= 60) {
        return 9;
    }
    if (days <= 90) {
        return 10;
    }
    return -1;
};

export const getRetentionValues = (data, filterOptions) => {
    const values = {};

    const keyFunc = getDimKeyFunc(filterOptions);
    const filterFunc = getDimFilterFunc(filterOptions);

    const visibleData = data.filter(filterFunc);

    const keys = extractDimKeys(visibleData, keyFunc);
    const buckets = getRetentionBuckets();

    // prepare dimensions
    keys.forEach((k) => values[k] = {label: k, values: {}});
    // fills dimensions with zero values
    buckets.forEach((bkt) => {
        itermap(values, (v) => {
            v.values[bkt] = 0;
        });
    });
    // project data
    visibleData
        .forEach((x) => {
            values[keyFunc(x)].values[x.bucket] += x.count;
        });
    // convert to final format
    return mapmap(values, (v) => {
        return {
            label: v.label,
            values: buckets.map((dt) => v.values[dt])
        };
    });
};

export const getConversionStages = (data) => {
    return range(1, Math.max(...data.map((x) => +x.stage), 5) + 1);
};

export const getConversionValues = (data, filterOptions) => {
    const values = {};

    const keyFunc = getDimKeyFunc(filterOptions);
    const filterFunc = getDimFilterFunc(filterOptions);

    const visibleData = data.filter(filterFunc);

    const keys = extractDimKeys(visibleData, keyFunc);
    const stages = getConversionStages(data);

    // prepare dimensions
    keys.forEach((k) => values[k] = {label: k, values: {}});
    // fills dimensions with zero values
    stages.forEach((s) => {
        itermap(values, (v) => {
            v.values[s] = 0;
        });
    });
    // project data
    visibleData
        .forEach((x) => {
            values[keyFunc(x)].values[x.stage] += x.count;
        });
    // convert to final format
    return mapmap(values, (v) => {
        return {
            label: v.label,
            values: stages.map((s) => v.values[s])
        };
    });
};


export const CHART_COLORS = [
    'rgb(45, 137, 239)', // blue
    'rgb(255, 87, 34)', // orange
    'rgb(0, 188, 212)', // cyan
    'rgb(171, 71, 188)', // purple
    'rgb(76, 175, 80)', // green
    'rgb(121, 85, 72)', // brown
    'rgb(236, 64, 122)', // pink
    'rgb(38, 166, 154)', // teal
    'rgb(103, 58, 183)', // deep purple
    'rgb(124, 179, 66)' // light green
];

export const toset = (aa) => {
    const m = {};
    aa.forEach((x) => m[x] = x);
    return m;
};

export const mapmap = (obj, f) => {
    return Object.keys(obj).map((key, _) => f(obj[key]));
};

export const itermap = (obj, f) => {
    Object.keys(obj).forEach((x) => f(obj[x]));
};

export const id = (x) => x;

export const tomap = (aa, kfunc, vfunc) => {
    const m = {};
    aa.forEach((x) => m[kfunc(x)] = vfunc(x));
    return m;
};
