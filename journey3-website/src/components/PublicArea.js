import React from 'react';

export default (props) => {
    return <div>
        <div className="row">
            <nav className="nav teal darken-2">
                <div className="nav-wrapper">
                    <ul className="right">
                        <li onClick={props.onSignInRequested}>
                            <a>SIGN IN</a>
                        </li>
                    </ul>
                </div>
            </nav>
            <div className="teal darken-2 hero"></div>
        </div>
        <div className="row">
            <h1 className="center-align">Journey 3</h1>
        </div>
    </div>;
};
