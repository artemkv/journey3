import * as dateTimeUtil from '../datetimeutil';
const R = require('ramda');

import React, {useEffect, useState} from 'react';

import Spinner from './Spinner';
import StatsChartPanel from './StatsChartPanel';

import {
    getConversionStages,
    getConversionValues,
    getFilterOptions,
    getDatasets,
    getMaxValue,
    tomap
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

    const [dataLoadingStatus, setDataLoadingStatus] = useState(DATA_NOT_LOADED);

    const [stages, setStages] = useState([]);
    const [data, setData] = useState([]);
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
                const data = stagesAndStats.stats;
                const stages = stagesAndStats.stages;

                setData(data);
                setStages(stages);

                const fo = getFilterOptions(data); // TODO: merge with saved values
                setFilterOptions(fo);
                calculateDatasets(data, stages, fo);
                setDataLoadingStatus(DATA_LOADED);
            })
            .catch((err) => {
                console.error(err); // TODO: show error in a user-friendly way
                setDataLoadingStatus(DATA_LOADING_FAILED);
            });
    }

    function calculateDatasets(data, stages, filterOptions) {
        setLabels(convertToLabels(getConversionStages(data), stages));
        const values = getConversionValues(data, filterOptions);
        setDatasets(getDatasets(values));
        setMax(getMaxValue(values));
    }

    function convertToLabels(numericVals, stages) {
        const stageMap = tomap(stages, (x) => x.stage, (x) => x.name);
        return numericVals.map((x) => x in stageMap ? stageMap[x] : `stage ${x}`);
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
        calculateDatasets(data, stages, newFo);
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
            type="bar" />;
    case DATA_LOADING_FAILED:
        // TODO: show error in a user-friendly way
        return <div>ERROR LOADING DATA</div>;
    }
};
