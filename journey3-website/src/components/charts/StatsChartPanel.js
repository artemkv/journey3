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
    const total = props.total;
    const stacked = props.stacked;

    const totalCount = (total) => <div className="row flex">
        <div className="col s12 valign-wrapper">
            <h6>Total: <b>{total}</b></h6>
        </div>
    </div>;

    return (
        <div className="panel">
            <div className="row flex">
                <div className="col s10 valign-wrapper">
                    <h5><b>{title}</b></h5>
                </div>
                <div className="col s2 valign-wrapper">
                    <ModalFilter
                        chartId={chartId}
                        filterOptions={filterOptions}
                        onFilterUpdate={onFilterUpdate}
                    />
                </div>
            </div>
            {total >= 0 ? totalCount(total) : ''}
            <div>
                <StatsChart
                    chartId={chartId}
                    datasets={datasets}
                    labels={labels}
                    max={max}
                    type={type}
                    stacked={stacked}
                />
            </div>
        </div >
    );
};
