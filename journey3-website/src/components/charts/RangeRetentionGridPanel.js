import React from 'react';
import {getRetentionBucketLabels} from './chartutils';

export default (props) => {
    const title = props.title;
    const chartId = props.chartId;
    const dataset = props.dataset;

    const percentFormat = (val, total) => {
        let num = 0;
        if (total) {
            num = val / total * 100;
        }
        const formatted = (Math.round(num * 100) / 100).toFixed(2);
        return formatted;
    };

    const row = (segment, data) => {
        const zeroDayCount = data[0];
        return <div className="row gridrow" key={`segment-${segment}`}>
            <div className="col s1 cell bl br bb">{segment}</div>
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
        <div id={chartId} className="panel">
            <div className="row flex">
                <div className="col s12 valign-wrapper">
                    <h5><b>{title}</b></h5>
                </div>
            </div>
            <div className='small'>
                <div className="row gridrow">
                    <div className="col s1 cell bl bt br bb">Segment</div>
                    {labels.map((hcolumn))}
                </div>
                {Object.keys(dataset)
                    .map((k) => row(k, dataset[k]))}
            </div>
        </div >
    );
};
