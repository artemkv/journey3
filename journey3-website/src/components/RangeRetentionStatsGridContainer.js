import * as dateTimeUtil from '../datetimeutil';
const R = require('ramda');

import React, {useEffect, useState} from 'react';

import Spinner from './Spinner';

import {getFilterOptions, getRetentionBuckets, getRetentionBucketLabels, getBucketIdx} from './chartutils';

import RangeRetentionGridPanel from './RangeRetentionGridPanel';

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
    const dt = dateTimeUtil.getDt(period, date);
    const loadDataCallback = props.loadDataCallback;

    const [dataLoadingStatus, setDataLoadingStatus] = useState(DATA_NOT_LOADED);

    const [data, setData] = useState([]);
    const [filterOptions, setFilterOptions] = useState({});

    const [dataset, setDataset] = useState([]);

    function loadData() {
        setDataLoadingStatus(DATA_NOT_LOADED);
        if (!appId) {
            return;
        }

        loadDataCallback(appId, build, period, dt)
            .then((data) => {
                setData(data);
                const fo = getFilterOptions(data); // TODO: merge with saved values
                setFilterOptions(fo);
                calculateDatasets(data, fo);
                setDataLoadingStatus(DATA_LOADED);
            })
            .catch((err) => {
                console.error(err); // TODO: show error in a user-friendly way
                setDataLoadingStatus(DATA_LOADING_FAILED);
            });
    }

    // TODO: apply filter options
    function calculateDatasets(data, filterOptions) {
        const dataset = {};
        const bucketLabels = getRetentionBucketLabels();
        const buckets = getRetentionBuckets();

        bucketLabels.forEach((dayBucket) => {
            buckets.forEach((bucket) => {
                if (!dataset[dayBucket]) {
                    dataset[dayBucket] = {};
                }
                if (!dataset[dayBucket][bucket]) {
                    dataset[dayBucket][bucket] = 0;
                }
            });
        });

        data.forEach((x) => {
            const dayBucket = bucketLabels[getBucketIdx(x.dt)];
            const bucket = x.bucket;

            if (!dataset[dayBucket]) {
                dataset[dayBucket] = {};
            }
            if (!dataset[dayBucket][bucket]) {
                dataset[dayBucket][bucket] = 0;
            }
            dataset[dayBucket][bucket] += x.count;
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
        calculateDatasets(data, newFo);
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
