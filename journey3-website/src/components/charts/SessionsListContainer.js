import React, {useEffect, useState} from 'react';

import Spinner from '../Spinner';

import SessionList from './SessionList';

const DATA_NOT_LOADED = 0;
const DATA_LOADED = 1;
const DATA_LOADING_FAILED = 2;

export default (props) => {
    const title = props.title;
    const id = props.id;
    const appId = props.appId;
    const build = props.build;
    const loadDataCallback = props.loadDataCallback;

    const [dataLoadingStatus, setDataLoadingStatus] = useState(DATA_NOT_LOADED);
    const [sessions, setSessions] = useState([]);
    const [versions, setVersions] = useState([]);

    // TODO: restore from previous selection
    const [errLevel, setErrLevel] = useState('n');
    const [version, setVersion] = useState('all');

    function loadData() {
        setDataLoadingStatus(DATA_NOT_LOADED);
        if (!appId) {
            return;
        }

        loadDataCallback(appId, build, errLevel, version)
            .then((data) => {
                setVersions(data.versions);
                setSessions(data.sessions);

                setDataLoadingStatus(DATA_LOADED);
            })
            .catch((err) => {
                console.error(err); // TODO: show error in a user-friendly way
                setDataLoadingStatus(DATA_LOADING_FAILED);
            });
    }

    useEffect(() => {
        loadData();
    }, [appId, build, errLevel, version]);

    function onErrLevelChanged(event) {
        setErrLevel(event.target.value);
    }

    function onVersionChanged(event) {
        setVersion(event.target.value);
    }

    // TODO: maybe indicate somehow the loading/error status
    switch (dataLoadingStatus) {
    case DATA_NOT_LOADED:
        return <Spinner />;
    case DATA_LOADED:
        return <div>
            <div>
                <h5><b>{title}</b></h5>
            </div>
            <div className="row">
                <div className="col s6">
                    <label htmlFor="err_levels">Error level:</label>
                    <select
                        id="err_levels"
                        className="browser-default"
                        value={errLevel}
                        onChange={onErrLevelChanged}
                    >
                        <option value='n'>Sessions without errors</option>
                        <option value='e'>Sessions with errors</option>
                        <option value='c'>Sessions with crashes</option>
                    </select>
                </div>
            </div>
            <div className="row">
                <div className="col s6">
                    <label htmlFor="versions">Version:</label>
                    <select
                        id="versions"
                        className="browser-default"
                        value={version}
                        onChange={onVersionChanged}
                    >
                        {versions.map((v) => (
                            <option key={v} value={v}>{v}</option>
                        ))}
                    </select>
                </div>
            </div>

            <SessionList
                sessions={sessions}
            />
        </div>;
    case DATA_LOADING_FAILED:
        // TODO: show error in a user-friendly way
        return <div>ERROR LOADING DATA</div>;
    }
};
