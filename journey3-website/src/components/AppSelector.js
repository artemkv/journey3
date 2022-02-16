import React from 'react';

export default (props) => {
    const apps = props.apps;
    const selectedApp = props.selectedApp;

    function onAppChanged(event) {
        props.onAppChanged(event.target.value);
    }

    return (
        <select value={selectedApp} className="browser-default" onChange={onAppChanged}>
            {apps.map((app) => <option key={app.aid} value={app.aid}>{app.name}</option>)}
        </select>
    );
};
