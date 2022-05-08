import React, {useEffect, useState} from 'react';
import {getLast10Years, getYear} from '../datetimeutil';

import AppSelectorContainer from './AppSelectorContainer';
import M from 'materialize-css/dist/js/materialize.min.js';
import StatsChartContainer from './StatsChartContainer';
import EventStatsChartContainer from './EventStatsChartContainer';
import RetentionStatsChartContainer from './RetentionStatsChartContainer';
import RangeRetentionStatsGridContainer from './RangeRetentionStatsGridContainer';
import ConversionStatsChartContainer from './ConversionStatsChartContainer';
import * as api from '../sessionapi';

const PERIOD_DAY = 'day';
const PERIOD_MONTH = 'month';
const PERIOD_YEAR = 'year';

export default () => {
    const [period, setPeriod] = useState(PERIOD_DAY);
    const [appId, setAppId] = useState('');

    useEffect(() => {
    // eslint-disable-next-line new-cap
        M.AutoInit();
    }, []);

    function onYearChanged(event) {}

    function onPeriodChanged(event) {
        setPeriod(event.target.value);
    }

    const onAppChanged = (appId) => {
        setAppId(appId);
    };

    const now = new Date('2022-05-08T00:00:00'); // TODO:
    const dt = now; // TODO: should come from date picker
    const build = 'Release'; // TODO: should come UI

    return (
        <div>
            <div className="row">
                <select className="browser-default">
                    <option value="202010">October, 2020</option>
                </select>
                <input type="text" className="datepicker" />
                <select
                    className="browser-default"
                    value={getYear(now)}
                    onChange={onYearChanged}
                >
                    {getLast10Years(now).map((year) => (
                        <option key={year} value={year}>
                            {year}
                        </option>
                    ))}
                </select>
            </div>
            <div className="row">
                <div className="col s4">
                    <select
                        className="browser-default"
                        value={period}
                        onChange={onPeriodChanged} >
                        <option value={PERIOD_YEAR}>Year</option>
                        <option value={PERIOD_MONTH}>Month</option>
                        <option value={PERIOD_DAY}>Day</option>
                    </select>
                </div>
                <div className="col s8">
                    <AppSelectorContainer
                        selectedApp={appId}
                        onAppChanged={onAppChanged}
                    />
                </div>
            </div>

            <div className="row">
                <div className="col s6">
                    <ConversionStatsChartContainer
                        title="Stage conversions"
                        chartId="conversions"
                        appId={appId}
                        build={build}
                        period={period}
                        date={dt}
                        loadDataCallback={api.getConversions}
                    />
                </div>
            </div>

            <div className="row">
                <div className="col s6">
                    <StatsChartContainer
                        title="Sessions"
                        chartId="sessionsPerPeriod"
                        appId={appId}
                        build={build}
                        period={period}
                        date={dt}
                        loadDataCallback={api.getSessionsPerPeriod}
                    />
                    <StatsChartContainer
                        title="Unique users"
                        chartId="uniqieUsersPerPeriod"
                        appId={appId}
                        build={build}
                        period={period}
                        date={dt}
                        loadDataCallback={api.getUniqueUsersPerPeriod}
                        useHigherPeriodTotal={true}
                    />
                    <StatsChartContainer
                        title="New users"
                        chartId="newUsersPerPeriod"
                        appId={appId}
                        build={build}
                        period={period}
                        date={dt}
                        loadDataCallback={api.getNewUsersPerPeriod}
                    />
                </div>
                <div className="col s6">
                    <EventStatsChartContainer
                        title="Events"
                        chartId="eventsPerPeriod"
                        appId={appId}
                        build={build}
                        period={period}
                        date={dt}
                        loadDataCallback={api.getEventsPerPeriod}
                    />
                    <EventStatsChartContainer
                        title="Sessions by event"
                        chartId="eventSessionsPerPeriod"
                        appId={appId}
                        build={build}
                        period={period}
                        date={dt}
                        loadDataCallback={api.getEventSessionsPerPeriod}
                    />
                </div>
            </div>

            <div className="row">
                <div className="col s6">
                    <StatsChartContainer
                        title="Sessions with errors"
                        chartId="errorSessionsPerPeriod"
                        appId={appId}
                        build={build}
                        period={period}
                        date={dt}
                        loadDataCallback={api.getErrorSessionsPerPeriod}
                    />
                </div>
                <div className="col s6">
                    <StatsChartContainer
                        title="Sessions with crashes"
                        chartId="crashSessionsPerPeriod"
                        appId={appId}
                        build={build}
                        period={period}
                        date={dt}
                        loadDataCallback={api.getCrashSessionsPerPeriod}
                    />
                </div>
            </div>

            <div className="row">
                <RetentionStatsChartContainer
                    title="Today's user segments"
                    chartId="retention_on_day"
                    appId={appId}
                    build={build}
                    period="day"
                    date={dt}
                    loadDataCallback={api.getRetentionOnDay}
                />
                <RangeRetentionStatsGridContainer
                    title="Retention"
                    chartId="retention_since_day"
                    appId={appId}
                    build={build}
                    period="day"
                    date={new Date()}
                    loadDataCallback={api.getRetentionSinceDay}
                />
            </div>
        </div>
    );
};
