import {range} from 'ramda';
import * as dateTimeUtil from '../../datetimeutil';
import {charRange} from '../../util';
import {from, id, konst} from 'datashaper-js';
import dayjs from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';
dayjs.extend(isoWeek);

const sum = (x) => x.reduce((total, num) => total + num, 0);

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

export const getHigherPeriodTotal = (stats, filterOptions, period, dateTime) => {
    const dt = dateTimeUtil.getDt(period, dateTime);
    const filterFunc = getDimFilterFunc(filterOptions);
    const dateFilterFunc = (rec) => filterFunc(rec) && rec.dt === dt;

    const visibleData = stats.filter(dateFilterFunc);
    return visibleData.map((x) => x.count).reduce((total, num) => total + num, 0);
};

export const getValues = (stats, filterOptions, period, dateTime) => {
    const keyFunc = getDimKeyFunc(filterOptions);
    const filterFunc = getDimFilterFunc(filterOptions);

    const visibleData = stats.filter(filterFunc);

    const dimKeys = extractDimKeys(visibleData, keyFunc);
    const dts = dateTimeUtil.getPeriodDts(period, dateTime);

    // prepare dimensions
    const values = from(dimKeys)
        .toMap(id, (dim) => ({
            label: dim,
            values: from(dts)
                .toMap(id, konst(0))
                .return()
        }))
        .return();

    // project stats
    visibleData
        .forEach((x) => {
            values[keyFunc(x)].values[x.dt] += x.count;
        });

    // convert to final format
    return from(values)
        .listValues()
        .map((x) => ({
            label: x.label,
            values: dts.map((dt) => x.values[dt])
        }))
        .return();
};

export const getFilterOptions = (stats, useEvents) => {
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
    const versions = extractDimKeys(stats, (x) => x.version);
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

        const events = extractDimKeys(stats, (x) => x.evt);
        events.forEach((x) => filterOptions.dimensions.event.selected[x] = ({
            id: x,
            label: x,
            checked: false
        }));
    }

    return filterOptions;
};

const extractDimKeys = (stats, keyFunc) => {
    return from(stats)
        .map((x) => keyFunc(x))
        .distinct()
        .return();
};

const getDimKeyFunc = (filterOptions) => {
    const splitByVersion = !filterOptions.dimensions.version.all.checked;
    const splitByEvent = filterOptions.dimensions.event &&
        !filterOptions.dimensions.event.all.checked;

    if (splitByVersion && !splitByEvent) {
        return (rec) => `Version ${rec.version}`;
    } else if (!splitByVersion && splitByEvent) {
        return (rec) => `Event '${rec.evt}'`;
    } else if (splitByVersion && splitByEvent) {
        return (rec) => `Version ${rec.version}, event '${rec.evt}'`;
    } else {
        return (_) => 'All versions';
    }
};

const getDimKeyFuncOnlySplitByVersion = (filterOptions) => {
    const splitByVersion = !filterOptions.dimensions.version.all.checked;

    if (splitByVersion) {
        return (rec) => rec.version;
    } else {
        return (_) => 'All versions';
    }
};

const getDimFilterFunc = (filterOptions) => {
    const splitByVersion = !filterOptions.dimensions.version.all.checked;
    const splitByEvent = filterOptions.dimensions.event &&
        !filterOptions.dimensions.event.all.checked;

    let versionsToInclude = {};
    if (splitByVersion) {
        versionsToInclude = from(filterOptions.dimensions.version.selected)
            .filter((x) => x.checked)
            .return();
    }

    let eventsToInclude = {};
    if (splitByEvent) {
        eventsToInclude = from(filterOptions.dimensions.event.selected)
            .filter((x) => x.checked)
            .return();
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
    return ['0', '1', '2', '5', '8', '12', '18', '27', '40', '60', '90', '1000000'];
};

export const getRetentionBucketLabels = () => {
    return ['0 days', '1 day', '2 days', '3-5 days', '6-8 days',
        '9-12 days', '13-18 days', '19-27 days', '28-40 days', '41-60 days', '60-90 days', '>90 days'];
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
    return 11;
};

export const getRetentionValues = (stats, filterOptions) => {
    const keyFunc = getDimKeyFunc(filterOptions);
    const filterFunc = getDimFilterFunc(filterOptions);

    const visibleData = stats.filter(filterFunc);

    const dimKeys = extractDimKeys(visibleData, keyFunc);
    const buckets = getRetentionBuckets();

    // prepare dimensions
    const values = from(dimKeys)
        .toMap(id, (dim) => ({
            label: dim,
            values: from(buckets)
                .toMap(id, konst(0))
                .return()
        }))
        .return();

    // project stats
    visibleData
        .forEach((x) => {
            values[keyFunc(x)].values[x.bucket] += x.count;
        });

    // convert to final format
    return from(values)
        .listValues()
        .map((x) => ({
            label: x.label,
            values: buckets.map((b) => x.values[b])
        }))
        .return();
};

export const getConversionStages = (stats) => {
    return range(1, Math.max(...stats.map((x) => +x.stage), 5) + 1);
};

export const getConversionValues = (stats, filterOptions) => {
    const keyFunc = getDimKeyFunc(filterOptions);
    const filterFunc = getDimFilterFunc(filterOptions);

    const visibleData = stats.filter(filterFunc);

    const dimKeys = extractDimKeys(visibleData, keyFunc);
    const stages = getConversionStages(stats);

    // prepare dimensions
    const values = from(dimKeys)
        .toMap(id, (dim) => ({
            label: dim,
            values: from(stages)
                .toMap(id, konst(0))
                .return()
        }))
        .return();

    // project stats
    visibleData
        .forEach((x) => {
            values[keyFunc(x)].values[x.stage] += x.count;
        });

    // convert to final format
    return from(values)
        .listValues()
        .map((x) => ({
            label: x.label,
            values: stages.map((s) => x.values[s])
        }))
        .return();
};

export const getTopEventsValuesAndEvents = (stats, filterOptions) => {
    const keyFunc = getDimKeyFuncOnlySplitByVersion(filterOptions);
    const filterFunc = getDimFilterFunc(filterOptions);

    const visibleData = stats.filter(filterFunc);

    const dimKeys = extractDimKeys(visibleData, keyFunc);

    const events = from(visibleData)
        .toLookup((x) => x.evt, (x) => x.count)
        .map(sum)
        .toList()
        .sorted((a, b) => b.v - a.v)
        .take(5)
        .map((x) => x.k)
        .return();

    // prepare dimensions
    const values = from(dimKeys)
        .toMap(id, (dim) => ({
            label: dim,
            values: from(events)
                .toMap(id, konst(0))
                .return()
        }))
        .return();

    // project stats
    visibleData
        .forEach((x) => {
            values[keyFunc(x)].values[x.evt] += x.count;
        });

    // convert to final format
    const finalValues = from(values)
        .listValues()
        .map((x) => ({
            label: x.label,
            values: events.map((e) => x.values[e])
        }))
        .return();

    return [finalValues, events];
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

export const getWeekLabel = (dt) => {
    const start = dayjs(dt).startOf('isoWeek').format('MMM DD');
    const end = dayjs(dt).endOf('isoWeek').format('MMM DD');
    return `${start} - ${end}`;
};

export const getRetentionSegments = (dt) => {
    const day = dayjs(dt).subtract(7 * 9, 'day');
    return from(range(0, 10))
        .map((x) => day.add(7 * x, 'day'))
        .map((x) => getWeekLabel(x))
        .return()
        .reverse();
};
