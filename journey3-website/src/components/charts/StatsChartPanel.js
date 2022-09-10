import React from 'react';
import StatsChart from './StatsChart';
import ModalFilter from './ModalFilter';
import {from} from 'datashaper-js';

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
    const leaveSpaceForTotal = props.leaveSpaceForTotal;

    const splitByVersionChange = (event) => {
        const allChecked = filterOptions.dimensions.version.all.checked;

        const updates = [];
        updates.push(
            {
                path: ['version', 'all'],
                enabled: !allChecked
            }
        );
        if (allChecked) { // if unchecking all
            from(filterOptions.dimensions.version.selected)
                .toList()
                .map((x) => x.v.id)
                .return()
                .forEach((x) => {
                    updates.push({
                        path: ['version', 'selected', x],
                        enabled: true
                    });
                });
        }

        onFilterUpdate(updates);
    };

    const totalCount = (total) => <div className="row flex">
        <div className="col s12 valign-wrapper">
            <h6>Total: <b>{total}</b></h6>
        </div>
    </div>;

    const spaceForTotal = () => <div className="row flex">
        <div className="col s12 valign-wrapper">
            <h6></h6>
        </div>
    </div>;

    return (
        <div className="panel">
            <div className="row flex">
                <div className="col s7 valign-wrapper">
                    <h5><b>{title}</b></h5>
                </div>
                <div className="col s3 valign-wrapper">
                    <div className="switch">
                        <label>
                            Split by version
                            <input
                                type="checkbox"
                                checked={!filterOptions.dimensions.version.all.checked}
                                onChange={splitByVersionChange}>
                            </input>
                            <span className="lever"></span>
                        </label>
                    </div>
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
            {leaveSpaceForTotal ? spaceForTotal() : ''}
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
