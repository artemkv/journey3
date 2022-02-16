import React, {useEffect, useState} from 'react';

import AppList from './AppList';
import Spinner from './Spinner';
import {getAcc} from '../sessionapi';

export default () => {
    const DATA_NOT_LOADED = 0;
    const DATA_LOADED = 1;
    const DATA_LOADING_FAILED = 2;

    const [data, setData] = useState([]);
    const [dataLoadingStatus, setDataLoadingStatus] = useState(DATA_NOT_LOADED);

    function loadData() {
        setDataLoadingStatus(DATA_NOT_LOADED);
        getAcc()
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
    }, []);

    // TODO: maybe indicate somehow the loading/error status
    switch (dataLoadingStatus) {
    case DATA_NOT_LOADED:
        return <Spinner />;
    case DATA_LOADED:
        return <AppList acc={data.acc} apps={data.apps} />;
    case DATA_LOADING_FAILED:
        // TODO: show error in a user-friendly way
        return <div>ERROR LOADING DATA</div>;
    }
};
