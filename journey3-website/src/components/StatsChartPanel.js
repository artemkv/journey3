import React from 'react';
import StatsChart from './StatsChart';

export default (props) => {
    return (
        <div>
            <h4>{props.title}</h4>
            <div>
                <StatsChart
                    chartId={props.chartId}
                    datasets={props.datasets}
                    labels={props.labels}
                    max={props.max} />
            </div>
        </div >
    );
};
