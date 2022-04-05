import React from 'react';
import {mapmap} from './chartutils';

export default (props) => {
    const dim = props.dim;
    const onFilterUpdate = props.onFilterUpdate;

    const onChange = (event, path) => {
        onFilterUpdate(path, event.target.checked);
    };

    const dimValue = (dimId, dimValue) => <span key={dimValue.id} className="double-distance-right">
        <label>
            <input
                type="checkbox"
                className="filled-in"
                checked={dimValue.checked}
                onChange={(e) => onChange(e, [dimId, 'selected', dimValue.id])}
            />
            <span>{dimValue.label}</span>
        </label>
    </span>;

    return (
        <div key={dim.id}>
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
                                onChange={(e) => onChange(e, [dim.id, 'all'])}
                            />
                            <span>{dim.all.label}</span>
                        </label>
                    </p>
                </div>
            </div>
            <div className="row">
                <div className="col s12">
                    {mapmap(dim.selected, (x) => dimValue(dim.id, x))}
                </div>
            </div>
        </div>
    );
};
