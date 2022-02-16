import React from 'react';

export default (props) => {
    const onSignOutClicked = () => {
        props.onSignOutRequested();
    };

    return <nav className="nav teal darken-2">
        <div className="nav-wrapper">
            <ul className="right">
                <li onClick={onSignOutClicked}>
                    <a>SIGN OUT</a>
                </li>
            </ul>
        </div>
    </nav>;
};
