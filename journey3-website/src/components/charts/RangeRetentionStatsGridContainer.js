import * as dateTimeUtil from '../../datetimeutil';
const R = require('ramda');

import React, {useEffect, useState} from 'react';

import Spinner from '../Spinner';
import RangeRetentionGridPanel from './RangeRetentionGridPanel';

import {
    getFilterOptions,
    getRetentionBuckets,
    getRetentionBucketLabels,
    getBucketIdx
} from './chartutils';

const DATA_NOT_LOADED = 0;
const DATA_LOADED = 1;
const DATA_LOADING_FAILED = 2;

export default (props) => {
    const title = props.title;
    const chartId = props.chartId;
    const appId = props.appId;
    const build = props.build;
    const period = props.period;
    const date = props.date;
    const loadDataCallback = props.loadDataCallback;

    const dt = dateTimeUtil.getDt(period, date);

    const [dataLoadingStatus, setDataLoadingStatus] = useState(DATA_NOT_LOADED);

    const [stats, setStats] = useState([]);
    const [filterOptions, setFilterOptions] = useState({});

    const [dataset, setDataset] = useState([]);

    function loadData() {
        setDataLoadingStatus(DATA_NOT_LOADED);
        if (!appId) {
            return;
        }

        loadDataCallback(appId, build, period, dt)
            .then((data) => {
                const stats = data;

                setStats(stats);
                const fo = getFilterOptions(stats); // TODO: merge with saved values
                setFilterOptions(fo);
                calculateDatasets(stats, fo);
                setDataLoadingStatus(DATA_LOADED);
            })
            .catch((err) => {
                console.error(err); // TODO: show error in a user-friendly way
                setDataLoadingStatus(DATA_LOADING_FAILED);
            });
    }

    // TODO: apply filter options
    function calculateDatasets(stats, filterOptions) {
        const dataset = {};
        const bucketLabels = getRetentionBucketLabels().slice(1);
        const buckets = getRetentionBuckets();

        // TODO: black magic, clean it up

        bucketLabels
            .forEach((dayBucket) => {
                buckets.forEach((bucket) => {
                    if (!dataset[dayBucket]) {
                        dataset[dayBucket] = {};
                    }
                    if (!dataset[dayBucket][bucket]) {
                        dataset[dayBucket][bucket] = 0;
                    }
                });
            });

        stats.forEach((x) => {
            const bucketIdx = getBucketIdx(x.dt);
            if (bucketIdx > 0) {
                const dayBucket = bucketLabels[bucketIdx - 1];
                const bucket = x.bucket;

                if (!dataset[dayBucket]) {
                    dataset[dayBucket] = {};
                }
                if (!dataset[dayBucket][bucket]) {
                    dataset[dayBucket][bucket] = 0;
                }
                dataset[dayBucket][bucket] += x.count;
            }
        });
        setDataset(dataset);
    }

    useEffect(() => {
        loadData();
    }, [appId, period, dt]);

    const onFilterUpdate = (updates) => {
        let newFo = filterOptions;
        updates.forEach(({path, enabled}) => {
            newFo = R.set(R.lensPath(['dimensions', ...path, 'checked']), enabled, newFo);
        });
        setFilterOptions(newFo);
        calculateDatasets(stats, newFo);
    };

    // TODO: maybe indicate somehow the loading/error status
    switch (dataLoadingStatus) {
    case DATA_NOT_LOADED:
        return <Spinner />;
    case DATA_LOADED:
        return <RangeRetentionGridPanel
            chartId={chartId}
            title={title}
            filterOptions={filterOptions}
            onFilterUpdate={onFilterUpdate}
            dataset={dataset} />;
    case DATA_LOADING_FAILED:
        // TODO: show error in a user-friendly way
        return <div>ERROR LOADING DATA</div>;
    }
};
