import * as dateTimeUtil from '../../datetimeutil';
const R = require('ramda');

import React, {useEffect, useState} from 'react';

import Spinner from '../Spinner';
import RangeRetentionGridPanel from './RangeRetentionGridPanel';

import {
    getFilterOptions,
    getRetentionBuckets,
    getWeekLabel,
    getRetentionSegments
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

    // TODO: apply filter options?
    function calculateDatasets(stats, filterOptions) {
        const dataset = {};
        const buckets = getRetentionBuckets();

        // prepare table by initializing with zero value
        getRetentionSegments(dt)
            .forEach((segment) => {
                buckets.forEach((bucket) => {
                    if (!dataset[segment]) {
                        dataset[segment] = {};
                    }
                    if (!dataset[segment][bucket]) {
                        dataset[segment][bucket] = 0;
                    }
                });
            });

        // project data
        // TODO: before we ignored day 0 segment
        stats.forEach((x) => {
            const segment = getWeekLabel(x.dt);
            const bucket = x.bucket;

            if (!dataset[segment]) {
                dataset[segment] = {};
            }
            if (!dataset[segment][bucket]) {
                dataset[segment][bucket] = 0;
            }
            dataset[segment][bucket] += x.count;
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
