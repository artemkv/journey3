import React, {useEffect, useState} from 'react';
import {getLast10Years, getYear} from '../datetimeutil';

import AppSelectorContainer from './AppSelectorContainer';
import M from 'materialize-css/dist/js/materialize.min.js';
import StatsContainer from './StatsContainer';

export default () => {
    const [period, setPeriod] = useState('month');
    const [appId, setAppId] = useState('');

    useEffect(() => {
        // eslint-disable-next-line new-cap
        M.AutoInit();
    }, []);

    function onYearChanged(event) {
    }

    function onPeriodChanged(event) {
        setPeriod(event.target.value);
    }

    const onAppChanged = (appId) => {
        setAppId(appId);
    };

    const now = new Date();
    const dt = now; // TODO: should come from date picker

    return <div>
        <div className="row">
            <select className="browser-default">
                <option value="202010">October, 2020</option>
            </select>
            <input type="text" className="datepicker" />
            <select className="browser-default" value={getYear(now)} onChange={onYearChanged}>
                {getLast10Years(now).map((year) => <option key={year} value={year}>{year}</option>)}
            </select>
        </div>
        <div className="row">
            <div className="col s4">
                <select className="browser-default" value={period} onChange={onPeriodChanged}>
                    <option value="year">Year</option>
                    <option value="month">Month</option>
                    <option value="day">Day</option>
                </select>
            </div>
            <div className="col s8">
                <AppSelectorContainer selectedApp={appId} onAppChanged={onAppChanged} />
            </div>
        </div>
        <div className="row">
            <StatsContainer
                appId={appId}
                period={period}
                date={dt} />
        </div>
    </div>;
};
