import React, {useEffect, useState} from 'react';

import AppEditor from './AppEditor';
import Spinner from './Spinner';
import {appsPath} from '../routing';
import {postApp} from '../sessionapi';
import {useNavigate} from 'react-router-dom';

export default () => {
    const INITIALIZED = 0;
    const UPDATE_IN_PROGRESS = 1;
    const UPDATE_FAILED = 2;

    const emptyApp = {
        name: ''
    };

    const [componentStatus, setComponentStatus] = useState(INITIALIZED);
    const [unsavedData, setUnsavedData] = useState(null);
    const [savingAttempt, setSavingAttempt] = useState(0);

    const navigate = useNavigate();

    function saveData(app) {
        setComponentStatus(UPDATE_IN_PROGRESS);
        postApp(app)
            .then(() => {
                navigate(appsPath);
            })
            .catch((err) => {
                console.error(err); // TODO: show error in a user-friendly way
                setComponentStatus(UPDATE_FAILED);
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
    switch (componentStatus) {
    case INITIALIZED:
        return <AppEditor app={emptyApp} onSubmit={onSubmit} />;
    case UPDATE_IN_PROGRESS:
        return <Spinner />;
    case UPDATE_FAILED:
        return <AppEditor app={unsavedData} onSubmit={onSubmit} />;
    }
};
