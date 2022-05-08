import * as dateTimeUtil from '../datetimeutil';
const R = require('ramda');

import React, {useEffect, useState} from 'react';

import Spinner from './Spinner';
import StatsChartPanel from './StatsChartPanel';

import {
    getLabels,
    getValues,
    getFilterOptions,
    getDatasets,
    getMaxValue,
    getTotal,
    getHigherPeriodTotal
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
    const dt = dateTimeUtil.getDt(period, date);
    const loadDataCallback = props.loadDataCallback;
    const labels = getLabels(period, date);
    const useHigherPeriodTotal = props.useHigherPeriodTotal;

    const [dataLoadingStatus, setDataLoadingStatus] = useState(DATA_NOT_LOADED);

    const [stats, setStats] = useState([]);
    const [higherPeriodStats, setHigherPeriodStats] = useState([]);
    const [filterOptions, setFilterOptions] = useState({});

    const [datasets, setDatasets] = useState([]);
    const [max, setMax] = useState(1.0);
    const [total, setTotal] = useState(-1);

    function loadData() {
        setDataLoadingStatus(DATA_NOT_LOADED);
        if (!appId) {
            return;
        }

        loadDataCallback(appId, build, period, dt)
            .then((data) => {
                const stats = data.stats;
                const higherPeriodStats = data.higher_period_stats;

                setStats(stats);
                setHigherPeriodStats(higherPeriodStats);

                const fo = getFilterOptions(stats); // TODO: merge with saved values
                setFilterOptions(fo);
                calculateDatasets(stats, useHigherPeriodTotal, higherPeriodStats, fo, period, date);
                setDataLoadingStatus(DATA_LOADED);
            })
            .catch((err) => {
                console.error(err); // TODO: show error in a user-friendly way
                setDataLoadingStatus(DATA_LOADING_FAILED);
            });
    }

    function calculateDatasets(stats, useHigherPeriodTotal, higherPeriodStats, filterOptions, period, date) {
        const values = getValues(stats, filterOptions, period, date);
        setDatasets(getDatasets(values));
        setMax(getMaxValue(values));
        setTotal(getTotal(values));

        if (useHigherPeriodTotal) {
            setTotal(getHigherPeriodTotal(higherPeriodStats, filterOptions, period, date));
        }
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
        calculateDatasets(stats, useHigherPeriodTotal, higherPeriodStats, newFo, period, date);
    };

    // TODO: maybe indicate somehow the loading/error status
    switch (dataLoadingStatus) {
    case DATA_NOT_LOADED:
        return <Spinner />;
    case DATA_LOADED:
        return <StatsChartPanel
            chartId={chartId}
            title={title}
            labels={labels}
            filterOptions={filterOptions}
            onFilterUpdate={onFilterUpdate}
            datasets={datasets}
            max={max}
            total={total} />;
    case DATA_LOADING_FAILED:
        // TODO: show error in a user-friendly way
        return <div>ERROR LOADING DATA</div>;
    }
};
