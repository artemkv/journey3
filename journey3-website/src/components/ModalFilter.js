import React, {useEffect} from 'react';
import M from 'materialize-css/dist/js/materialize.min.js';
import ModalFilterDimension from './ModalFilterDimension';
import {mapmap} from './chartutils';

export default (props) => {
    const chartId = props.chartId;
    const filterOptions = props.filterOptions;
    const onFilterUpdate = props.onFilterUpdate;

    const id = `modal_filter_${chartId}`;
    const href = `#${id}`;

    useEffect(() => {
    // eslint-disable-next-line new-cap
        M.AutoInit();
    }, []);

    const dimension = (dim, onFilterUpdate) => <ModalFilterDimension
        dim={dim}
        onFilterUpdate={onFilterUpdate}
    />;

    return (
        <div>
            <a className="modal-trigger" href={href}>
                <i className="material-icons">filter_list</i>
            </a>
            <div id={id} className='modal modal-fixed-footer'>
                <div className='modal-content'>
                    <h4>Filter by</h4>
                    {mapmap(filterOptions.dimensions, (dim) => dimension(dim, onFilterUpdate))}
                </div>
                <div className='modal-footer'>
                    <a href='#!' className='modal-close btn-flat'>Cancel</a>
                    <a href='#!' className='modal-close btn-flat'>OK</a>
                </div>
            </div>
        </div>
    );
};
