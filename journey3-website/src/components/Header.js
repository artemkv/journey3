import React from 'react';
import {Link} from 'react-router-dom';
import {docPath, statsPath} from '../routing';

export default (props) => {
    const onSignOutClicked = () => {
        props.onSignOutRequested();
    };

    return <nav className="nav teal darken-2">
        <div className="nav-wrapper">
            <ul className="left">
                <Link to={statsPath}>
                    HOME
                </Link>
            </ul>
            <ul className="right">
                <li onClick={onSignOutClicked}>
                    <a>SIGN OUT</a>
                </li>
            </ul>
            <ul className="right">
                <Link to={docPath}>
                    DOCS
                </Link>
            </ul>
        </div>
    </nav>;
};
