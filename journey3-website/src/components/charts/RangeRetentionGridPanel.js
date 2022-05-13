import React from 'react';
import ModalFilter from './ModalFilter';
import {getRetentionBucketLabels} from './chartutils';

export default (props) => {
    const title = props.title;
    const chartId = props.chartId;
    const filterOptions = props.filterOptions;
    const onFilterUpdate = props.onFilterUpdate;
    const dataset = props.dataset;

    const percentFormat = (val, total) => {
        let num = 0;
        if (total) {
            num = val / total * 100;
        }
        const formatted = (Math.round(num * 100) / 100).toFixed(2);
        return formatted;
    };

    const row = (segmentBucket, data) => {
        const zeroDayCount = data[0];
        return <div className="row gridrow" key={`segment-${segmentBucket}`}>
            <div className="col s2 cell bl br bb">{segmentBucket}</div>
            {Object.keys(data)
                .filter((k) => k > 0)
                .map((k) => column(k, percentFormat(data[k], zeroDayCount)))}
        </div>;
    };

    const column = (bucket, count) => <div className="col s1 cell br bb" key={bucket}>
        {count > 0 ? bold(count) : count}%
    </div>;

    const hcolumn = (bucket) => <div className="col s1 cell bt br bb" key={`h-${bucket}`}>
        {bucket}
    </div>;

    const bold = (count) => <b>{count}</b>;

    const labels = getRetentionBucketLabels().slice(1);
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
            <div className="row gridrow">
                <div className="col s2 cell bl bt br bb">Segment</div>
                {labels.map((hcolumn))}
            </div>
            {Object.keys(dataset)
                .map((k) => row(k, dataset[k]))}
            <div>
            </div>
        </div >
    );
};
