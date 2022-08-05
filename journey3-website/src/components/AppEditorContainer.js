import React, {useEffect, useState} from 'react';
import {getApp, putApp} from '../sessionapi';

import AppEditor from './AppEditor';
import Spinner from './Spinner';
import {appsPath} from '../routing';
import {useNavigate, useParams} from 'react-router-dom';

export default (props) => {
    const DATA_NOT_LOADED = 0;
    const DATA_LOADED = 1;
    const DATA_LOADING_FAILED = 2;
    const UPDATE_IN_PROGRESS = 3;
    const UPDATE_FAILED = 4;

    const {appId} = useParams();

    const [data, setData] = useState({});
    const [dataLoadingStatus, setDataLoadingStatus] = useState(DATA_NOT_LOADED);
    const [unsavedData, setUnsavedData] = useState(null);
    const [savingAttempt, setSavingAttempt] = useState(0);

    const navigate = useNavigate();

    function loadData() {
        setDataLoadingStatus(DATA_NOT_LOADED);
        getApp(appId)
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
    }, [appId]);

    function saveData(app) {
        setDataLoadingStatus(UPDATE_IN_PROGRESS);
        putApp(app)
            .then(() => {
                navigate(appsPath);
            })
            .catch((err) => {
                console.error(err); // TODO: show error in a user-friendly way
                setDataLoadingStatus(UPDATE_FAILED);
            });
    }

    useEffect(() => {
        if (unsavedData) {
            saveData(unsavedData);
        }
    }, [savingAttempt]);

    const onSubmit = (app) => {
        setUnsavedData(app);
        setSavingAttempt(savingAttempt + 1);
    };

    // TODO: maybe indicate somehow the loading/error status
    switch (dataLoadingStatus) {
    case DATA_NOT_LOADED:
        return <Spinner />;
    case DATA_LOADED:
        return <AppEditor app={data} onSubmit={onSubmit} />;
    case DATA_LOADING_FAILED:
        // TODO: show error in a user-friendly way
        return <div>ERROR LOADING DATA</div>;
    case UPDATE_IN_PROGRESS:
        return <Spinner />;
    case UPDATE_FAILED:
        return <AppEditor app={unsavedData} onSubmit={onSubmit} />;
    }
};
