import React from 'react';
import {Link} from 'react-router-dom';
import {docPath, homePath} from '../routing';

export default (props) => {
    return <nav className="nav teal darken-2">
        <div className="row">
            <nav className="nav teal darken-2">
                <div className="nav-wrapper">
                    <ul className="left">
                        <Link to={homePath}>
                            HOME
                        </Link>
                    </ul>
                    <ul className="right">
                        <li onClick={props.onSignInRequested}>
                            <a>SIGN IN</a>
                        </li>
                    </ul>
                    <ul className="right">
                        <Link to={docPath}>
                            DOCS
                        </Link>
                    </ul>
                </div>
            </nav>
        </div>
    </nav>;
};
