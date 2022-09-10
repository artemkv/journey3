import React from 'react';
import {from} from 'datashaper-js';

export default (props) => {
    const dim = props.dim;
    const onFilterUpdate = props.onFilterUpdate;
    const chartId = props.chartId;

    const onSelectedChange = (event, dimId, dimValueId) => {
        const checked = event.target.checked;
        const updates = [];
        if (checked) {
            updates.push( {
                path: [dimId, 'all'],
                enabled: false
            });
        }
        updates.push( {
            path: [dimId, 'selected', dimValueId],
            enabled: checked
        });
        onFilterUpdate(updates);
    };

    const onAllChange = (event, dimId) => {
        const checked = event.target.checked;
        onFilterUpdate([
            {
                path: [dimId, 'all'],
                enabled: checked
            }
        ]);
    };

    const dimValueSelector = (dimId, dimValue) => (
        <span key={`${chartId}_${dimValue.id}`} className="double-distance-right">
            <label>
                <input
                    type="checkbox"
                    className="filled-in"
                    checked={dimValue.checked}
                    onChange={(e) => onSelectedChange(e, dimId, dimValue.id)}
                />
                <span>{dimValue.label}</span>
            </label>
        </span>
    );

    return (
        <div>
            <div className="row">
                <div className="col s12">
                    <h5>{dim.title}</h5>
                </div>
            </div>
            <div className="row">
                <div className="col s12">
                    <p>
                        <label>
                            <input
                                type="checkbox"
                                className="filled-in"
                                checked={dim.all.checked}
                                onChange={(e) => onAllChange(e, dim.id)}
                            />
                            <span>{dim.all.label}</span>
                        </label>
                    </p>
                </div>
            </div>
            <div className="row">
                <div className="col s12">
                    {
                        from(dim.selected)
                            .listValues()
                            .sorted((a, b) => a.label.localeCompare(b.label))
                            .map((dimValue) => dimValueSelector(dim.id, dimValue))
                            .return()
                    }
                </div>
            </div>
        </div>
    );
};
