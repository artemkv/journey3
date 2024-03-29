import React, {useEffect, useState} from 'react';
import {from} from 'datashaper-js';
import {
    getLast10Years,
    getYear,
    getYearMonthInputFormat,
    getYearMonthDayInputFormat,
    fromYearInputFormat,
    fromYearMonthInputFormat,
    fromYearMonthDayInputFormat,
    prevDay,
    nextDay,
    prevMonth,
    nextMonth,
    prevYear,
    nextYear
} from '../datetimeutil';
import {
    savePeriod,
    getPeriod,
    saveDt,
    getDt,
    saveAppId,
    saveBuild,
    getBuild,
    saveStatsSection,
    getStatsSection
} from '../preferences';

import AppSelectorContainer from './AppSelectorContainer';
import M from 'materialize-css/dist/js/materialize.min.js';
import StatsChartContainer from './charts/StatsChartContainer';
import EventStatsChartContainer from './charts/EventStatsChartContainer';
import RetentionStatsChartContainer from './charts/RetentionStatsChartContainer';
import RangeRetentionStatsGridContainer from './charts/RangeRetentionStatsGridContainer';
import ConversionStatsChartContainer from './charts/ConversionStatsChartContainer';
import TopEventsStatsChartContainer from './charts/TopEventsStatsChartContainer';
import SessionsListContainer from './charts/SessionsListContainer';
import DurationStatsChartContainer from './charts/DurationStatsChartContainer';
import * as api from '../sessionapi';
import {reportNavToStats} from '../journeyconnector';

const PERIOD_DAY = 'day';
const PERIOD_MONTH = 'month';
const PERIOD_YEAR = 'year';

const BUILD_DEBUG = 'Debug';
const BUILD_RELEASE = 'Release';

const STATS_SECTION_VITALS = 'vitals';
const STATS_SECTION_EVENTS = 'events';
const STATS_SECTION_RETENTION = 'retention';
const STATS_SECTION_SESSIONS = 'sessions';

export default () => {
    const [period, setPeriod] = useState(PERIOD_DAY);
    const [dt, setDt] = useState(new Date());
    const [appId, setAppId] = useState('');
    const [build, setBuild] = useState(BUILD_RELEASE);
    const [statsSection, setStatsSection] = useState(STATS_SECTION_VITALS);

    useEffect(() => {
        reportNavToStats();

        // eslint-disable-next-line new-cap
        M.AutoInit();
    }, []);

    useEffect(() => {
        const lastUsedPeriod = getPeriod();
        if (lastUsedPeriod) {
            setPeriod(lastUsedPeriod);
        }

        setDt(getDt());

        const lastSavedBuild = getBuild();
        if (lastSavedBuild) {
            setBuild(lastSavedBuild);
        }

        const lastUsedSection = getStatsSection();
        if (lastUsedSection) {
            setStatsSection(lastUsedSection);
        }
    }, []);

    useEffect(() => {
        savePeriod(period);
    }, [period]);

    useEffect(() => {
        saveDt(dt);
    }, [dt]);

    useEffect(() => {
        if (appId) {
            saveAppId(appId);
        }
    }, [appId]);

    useEffect(() => {
        saveBuild(build);
    }, [build]);

    useEffect(() => {
        saveStatsSection(statsSection);
    }, [statsSection]);

    function onYearChanged(event) {
        setDt(fromYearInputFormat(event.target.value));
    }

    function onMonthChanged(event) {
        setDt(fromYearMonthInputFormat(event.target.value));
    }

    function onDayChanged(event) {
        setDt(fromYearMonthDayInputFormat(event.target.value));
    }

    const onPeriodChanged = (event) => {
        setPeriod(event.target.value);
    };

    const onAppChanged = (appId) => {
        setAppId(appId);
    };

    const onBuildChanged = (event) => {
        setBuild(event.target.value);
    };

    const onStatsSectionChanged = (event) => {
        setStatsSection(event.target.value);
    };

    const onPrevDayClicked = (event) => {
        setDt(prevDay(dt));
    };

    const onNextDayClicked = (event) => {
        setDt(nextDay(dt));
    };

    const onPrevMonthClicked = (event) => {
        setDt(prevMonth(dt));
    };

    const onNextMonthClicked = (event) => {
        setDt(nextMonth(dt));
    };

    const onPrevYearClicked = (event) => {
        setDt(prevYear(dt));
    };

    const onNextYearClicked = (event) => {
        setDt(nextYear(dt));
    };

    const Ignore = () => <div></div>;

    const dateSelector = () => <div>
        {period === PERIOD_DAY ?
            <div>
                <div className="valign-wrapper">
                    <i className="small material-icons clickable"
                        onClick={onPrevDayClicked}>navigate_before</i>
                    <input
                        className="browser-default input-date-picker"
                        type="date"
                        value={getYearMonthDayInputFormat(dt)}
                        onChange={onDayChanged} />
                    <i className="small material-icons clickable"
                        onClick={onNextDayClicked}>navigate_next</i>
                </div>
            </div> : ''}
        {period === PERIOD_MONTH ?
            <div className="valign-wrapper">
                <i className="small material-icons clickable"
                    onClick={onPrevMonthClicked}>navigate_before</i>
                <input
                    className="browser-default input-date-picker"
                    type="month"
                    value={getYearMonthInputFormat(dt)}
                    onChange={onMonthChanged} />
                <i className="small material-icons clickable"
                    onClick={onNextMonthClicked}>navigate_next</i>
            </div> : ''}
        {period === PERIOD_YEAR ?
            <div className="valign-wrapper">
                <i className="small material-icons clickable"
                    onClick={onPrevYearClicked}>navigate_before</i>
                <select
                    className="browser-default"
                    value={getYear(dt)}
                    onChange={onYearChanged}
                >
                    {
                        from([...getLast10Years(new Date()), getYear(dt)])
                            .distinct()
                            .sorted((a, b) => b - a)
                            .return()
                            .map((year) => (
                                <option key={year} value={year}>
                                    {year}
                                </option>
                            ))}
                </select>
                <i className="small material-icons clickable"
                    onClick={onNextYearClicked}>navigate_next</i>
            </div> : ''}
    </div>;

    const vitals = (_) => (
        <div>
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
                </div>
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
                        title="Unique users"
                        chartId="uniqieUsersPerPeriod"
                        appId={appId}
                        build={build}
                        period={period}
                        date={dt}
                        loadDataCallback={api.getUniqueUsersPerPeriod}
                        useHigherPeriodTotal={true}
                    />
                </div>
                <div className="col s6">
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
                <DurationStatsChartContainer
                    title="Session duration"
                    chartId="session_duration"
                    appId={appId}
                    build={build}
                    period={period}
                    date={dt}
                    loadDataCallback={api.getSessionDurationPerPeriod}
                />
            </div>
        </div>
    );

    const events = () => (
        <div>
            <div className="row">
                <div className="col s6">
                    <TopEventsStatsChartContainer
                        title="Top events"
                        chartId="top_events"
                        appId={appId}
                        build={build}
                        period={period}
                        date={dt}
                        loadDataCallback={api.getEventsPerPeriod}
                    />
                </div>
            </div>

            <div className="row">
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
                </div>
                <div className="col s6">
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
                    <TopEventsStatsChartContainer
                        title="Top entry events"
                        chartId="top_entry_events"
                        appId={appId}
                        build={build}
                        period={period}
                        date={dt}
                        loadDataCallback={api.getEntryEventsPerPeriod}
                    />
                </div>
                <div className="col s6">
                    <TopEventsStatsChartContainer
                        title="Top exit events"
                        chartId="top_exit_events"
                        appId={appId}
                        build={build}
                        period={period}
                        date={dt}
                        loadDataCallback={api.getExitEventsPerPeriod}
                    />
                </div>
            </div>
        </div>
    );

    const userRetention = () => (
        <div>
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

    const userSessions = () => (
        <div>
            <div className="row">
                <SessionsListContainer
                    title="User sessions (last 50)"
                    id="session_list"
                    appId={appId}
                    build={build}
                    loadDataCallback={api.getUserSessions}
                />
            </div>
        </div>
    );

    const renderStatsSection = () => {
        switch (statsSection) {
        case STATS_SECTION_VITALS:
            return vitals();
        case STATS_SECTION_EVENTS:
            return events();
        case STATS_SECTION_RETENTION:
            return userRetention();
        case STATS_SECTION_SESSIONS:
            return userSessions();
        }
    };

    return (
        <div className="row">
            <div className="container">
                <div>
                    <div className="row">
                        <div className="col s8">
                            <AppSelectorContainer
                                selectedApp={appId}
                                onAppChanged={onAppChanged}
                            />
                        </div>
                        <div className="col s4">
                            <select
                                className="browser-default"
                                value={build}
                                onChange={onBuildChanged} >
                                <option value={BUILD_RELEASE}>Release</option>
                                <option value={BUILD_DEBUG}>Debug</option>
                            </select>
                        </div>
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
                        <div className="col s4">
                            {dateSelector()}
                        </div>
                        <div className="col s4">
                        </div>

                        <div className="col s4">
                            <select
                                className="browser-default"
                                value={statsSection}
                                onChange={onStatsSectionChanged} >
                                <option value={STATS_SECTION_VITALS}>Vitals</option>
                                <option value={STATS_SECTION_EVENTS}>Events</option>
                                <option value={STATS_SECTION_RETENTION}>User retention</option>
                                <option value={STATS_SECTION_SESSIONS}>User sessions</option>
                            </select>
                        </div>
                    </div>

                    {renderStatsSection()}
                </div>
            </div>
        </div>
    );
};
