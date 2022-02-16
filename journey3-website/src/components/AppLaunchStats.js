import React from 'react';
import StatsChart from './StatsChart';

export default (props) => {
    const period = props.period;
    const dateTime = props.dateTime;
    const data = props.data;

    return (
        <div>
            <h4>App Launches</h4>
            <div>
                <StatsChart
                    chartId="appLaunchStats"
                    period={period}
                    dateTime={dateTime}
                    data={data} />
            </div>

        </div >
    );
};
