import React from 'react';
import StatsChart from './StatsChart';
import ModalFilter from './ModalFilter';

export default (props) => {
    const title = props.title;
    const chartId = props.chartId;
    const filterOptions = props.filterOptions;
    const onFilterUpdate = props.onFilterUpdate;
    const datasets = props.datasets;
    const labels = props.labels;
    const max = props.max;
    const type = props.type;

    return (
        <div className="panel">
            <div className="row flex">
                <div className="col s10 valign-wrapper">
                    <h5>{title}</h5>
                </div>
                <div className="col s2 valign-wrapper">
                    <ModalFilter
                        chartId={chartId}
                        filterOptions={filterOptions}
                        onFilterUpdate={onFilterUpdate}
                    />
                </div>
            </div>
            <div>
                <StatsChart
                    chartId={chartId}
                    datasets={datasets}
                    labels={labels}
                    max={max}
                    type={type}
                />
            </div>
        </div >
    );
};
