import * as dateTimeUtil from '../datetimeutil';

import React, { useEffect, useState } from 'react';

import Spinner from './Spinner';
import StatsChartContainer from './StatsChartPanel';

import { getLabels, getValues } from './chartutils';

const DATA_NOT_LOADED = 0;
const DATA_LOADED = 1;
const DATA_LOADING_FAILED = 2;

// TODO: See if this can be extended to handle various charts
export default (props) => {
    const [data, setData] = useState([]);
    const [dataLoadingStatus, setDataLoadingStatus] = useState(DATA_NOT_LOADED);

    const appId = props.appId;
    const build = props.build;
    const period = props.period;
    const date = props.date;
    const dt = dateTimeUtil.getDt(period, date);

    function loadData() {
        setDataLoadingStatus(DATA_NOT_LOADED);
        if (!appId) {
            return;
        }

        props.loadDataCallback(appId, build, period, dt)
            .then((data) => {
                setData(data);
                setDataLoadingStatus(DATA_LOADED);
            })
            .catch((err) => {
                console.error(err); // TODO: show error in a user-friendly way
                setDataLoadingStatus(DATA_LOADING_FAILED);
            });
    }

    useEffect(() => {
        loadData();
    }, [appId, period, dt]);

    const labels = getLabels(period, date);
    const values = getValues(data, period, date);
    const datasets = [{
        label: 'Count',
        data: values,
        backgroundColor: '#2d89ef',
        borderColor: '#2d89ef',
        fill: false,
        lineTension: .1
    }];
    const max = Math.max(...values, 1);

    // TODO: maybe indicate somehow the loading/error status
    switch (dataLoadingStatus) {
        case DATA_NOT_LOADED:
            return <Spinner />;
        case DATA_LOADED:
            return <StatsChartContainer
                title={props.title}
                chartId={props.chartId}
                datasets={datasets}
                labels={labels}
                max={max} />;
        case DATA_LOADING_FAILED:
            // TODO: show error in a user-friendly way
            return <div>ERROR LOADING DATA</div>;
    }
};
