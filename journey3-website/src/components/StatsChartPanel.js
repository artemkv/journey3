import React from 'react';
import StatsChart from './StatsChart';
import ModalFilter from './ModalFilter';

export default (props) => {
    return (
        <div className="panel">
            <div className="row flex">
                <div className="col s10 valign-wrapper">
                    <h5>{props.title}</h5>
                </div>
                <div className="col s2 valign-wrapper">
                    <ModalFilter
                        chartId={props.chartId}
                        filterOptions={props.filterOptions}
                        onFilterUpdate={props.onFilterUpdate}
                    />
                </div>
            </div>
            <div>
                <StatsChart
                    chartId={props.chartId}
                    datasets={props.datasets}
                    labels={props.labels}
                    max={props.max}
                />
            </div>
        </div >
    );
};
