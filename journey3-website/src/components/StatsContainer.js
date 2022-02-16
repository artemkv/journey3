import * as api from '../sessionapi';
import * as dateTimeUtil from '../datetimeutil';

import React, { useEffect, useState } from 'react';

import Spinner from './Spinner';
import AppLaunchStats from './AppLaunchStats';

const DATA_NOT_LOADED = 0;
const DATA_LOADED = 1;
const DATA_LOADING_FAILED = 2;

// TODO: See if this can be extended to handle various charts
export default (props) => {
    const [data, setData] = useState([]);
    const [dataLoadingStatus, setDataLoadingStatus] = useState(DATA_NOT_LOADED);

    const appId = props.appId;
    const period = props.period;
    const date = props.date;
    const dt = dateTimeUtil.getDt(period, date);

    function loadData() {
        setDataLoadingStatus(DATA_NOT_LOADED);
        if (!appId) {
            return;
        }

        // hard-coded to retrieve unique user stats
        // TODO: add intermediate layer that handles session transparently
        api.getAppLaunchStats(appId, period, dt, '')
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

    // TODO: maybe indicate somehow the loading/error status
    switch (dataLoadingStatus) {
        case DATA_NOT_LOADED:
            return <Spinner />;
        case DATA_LOADED:
            return <AppLaunchStats period={period} dateTime={date} data={data} />;
        case DATA_LOADING_FAILED:
            // TODO: show error in a user-friendly way
            return <div>ERROR LOADING DATA</div>;
    }
};
