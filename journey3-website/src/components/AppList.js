import {createAppPath, getAppPath, statsPath} from '../routing';

import {Link} from 'react-router-dom';
import React from 'react';

export default (props) => {
    return <div>
        <div className="row">
            <div className="container">
                <div className="row">
                    <Link to={statsPath}>
            &lt; Back
                    </Link>
                </div>
                <div className="row">
                    <span>Account id: {props.acc}</span>
                </div>
                <div className="row">
                    <h4 className="header">Applications</h4>
                </div>
                <div className="row">
                    <ul className="collection">
                        {props.apps.map((app) =>
                            <li className="collection-item" key={app.aid}>
                                <p>
                                    <span className="application-list-app-name">{app.name}</span>
                                    <span> </span>
                                    <span>({app.aid})</span>
                                    <Link to={getAppPath(app.aid)} className="secondary-content">
                                        <i className="material-icons">edit</i>
                                    </Link>
                                </p>
                            </li>
                        )}
                    </ul>
                </div>
                <div className="row">
                    <div className="right-align">
                        <div>
                            <Link to={createAppPath}
                                className="btn waves-effect waves-light">
                        ADD NEW
                                <i className="material-icons right">add_circle</i>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>;
};
