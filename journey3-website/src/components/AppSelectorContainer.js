import React, {useEffect, useState} from 'react';

import AppSelector from './AppSelector';
import {Link} from 'react-router-dom';
import {appsPath} from '../routing';
import {getApps} from '../sessionapi';
import {getAppId} from '../preferences';

const DATA_NOT_LOADED = 0;
const DATA_LOADED = 1;
const DATA_LOADING_FAILED = 2;

export default (props) => {
    const [data, setData] = useState([]);
    const [dataLoadingStatus, setDataLoadingStatus] = useState(DATA_NOT_LOADED);

    const selectedApp = props.selectedApp;

    function loadData() {
        setDataLoadingStatus(DATA_NOT_LOADED);
        getApps()
            .then((data) => {
                setData(data);
                // TODO: use ramda to access inner property in a safe way?
                if (data.length > 0) {
                    const lastUsedAppId = getAppId();
                    let isFound = false;
                    if (lastUsedAppId) {
                        for (let i = 0; i < data.length; i++) {
                            if (data[i].aid === lastUsedAppId) {
                                isFound = true;
                                break;
                            }
                        }
                    }
                    props.onAppChanged(isFound ? lastUsedAppId : data[0].aid);
                }
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

    const onAppChanged = (appId) => {
        props.onAppChanged(appId);
    };

    // TODO: maybe indicate somehow the loading/error status
    switch (dataLoadingStatus) {
    case DATA_NOT_LOADED:
        return <AppSelector apps={data} />;
    case DATA_LOADED:
        return <div className="valign-wrapper">
            <AppSelector apps={data} selectedApp={selectedApp} onAppChanged={onAppChanged} />
            <Link className="valign-wrapper distance" to={appsPath}>
                <i className="material-icons">settings</i>
            </Link>
        </div>;
    case DATA_LOADING_FAILED:
        // TODO: show error in a user-friendly way
        return <div>ERROR LOADING DATA</div>;
    }
};
