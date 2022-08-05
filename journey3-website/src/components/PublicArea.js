import * as routing from '../routing';

import React from 'react';
import {Routes, Route} from 'react-router-dom';
import DocumentationPage from './DocumentationPage';
import PublicHomePage from './PublicHomePage';
import PublicHeader from './PublicHeader';

export default (props) => {
    return <div>
        <PublicHeader onSignInRequested={props.onSignInRequested} />
        <Routes>
            <Route path={routing.homePath} element={<PublicHomePage />} />
            <Route path={routing.docPath} element={<DocumentationPage />} />
            <Route path={routing.docPagePath} element={<DocumentationPage />} />
        </Routes>
    </div>;
};
