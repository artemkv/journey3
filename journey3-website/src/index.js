import 'materialize-css/dist/css/materialize.min.css';
import './journey.scss';

import App from './components/App';
import React from 'react';
import ReactDOM from 'react-dom';
import {BrowserRouter} from 'react-router-dom';
import {initialize} from './journeyconnector';

export const reactRender = (isRelease) => {
    const version = '1.0';
    initialize(version, isRelease);

    ReactDOM.render(<BrowserRouter>
        <App />
    </BrowserRouter>, document.getElementById('react_app'));
};
