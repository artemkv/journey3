import * as dateTimeUtil from '../../datetimeutil';
const R = require('ramda');

import React, {useEffect, useState} from 'react';

import Spinner from '../Spinner';
import StatsChartPanel from './StatsChartPanel';

import {
    getFilterOptions,
    getDatasets,
    getMaxValue,
    getTopEventsValuesAndEvents
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
    const [labels, setLabels] = useState([]);
    const [filterOptions, setFilterOptions] = useState({});

    const [datasets, setDatasets] = useState([]);
    const [max, setMax] = useState(1.0);

    function loadData() {
        setDataLoadingStatus(DATA_NOT_LOADED);
        if (!appId) {
            return;
        }

        loadDataCallback(appId, build, period, dt)
            .then((stagesAndStats) => {
                const stats = stagesAndStats.stats;

                setStats(stats);

                const fo = getFilterOptions(stats, true); // TODO: merge with saved values
                setFilterOptions(fo);
                calculateDatasets(stats, fo);
                setDataLoadingStatus(DATA_LOADED);
            })
            .catch((err) => {
                console.error(err); // TODO: show error in a user-friendly way
                setDataLoadingStatus(DATA_LOADING_FAILED);
            });
    }

    function calculateDatasets(stats, filterOptions) {
        const [values, events] = getTopEventsValuesAndEvents(stats, filterOptions);
        setLabels(events);

        setDatasets(getDatasets(values));
        setMax(getMaxValue(values));
    }

    useEffect(() => {
        loadData();
    }, [appId, build, period, dt]);

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
        return <StatsChartPanel
            chartId={chartId}
            title={title}
            labels={labels}
            filterOptions={filterOptions}
            onFilterUpdate={onFilterUpdate}
            datasets={datasets}
            max={max}
            type="bar"
            stacked={true} />;
    case DATA_LOADING_FAILED:
        // TODO: show error in a user-friendly way
        return <div>ERROR LOADING DATA</div>;
    }
};
