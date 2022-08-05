import * as routing from '../routing';

import AppCreatorContainer from './AppCreatorContainer';
import AppEditorContainer from './AppEditorContainer';
import AppListContainer from './AppListContainer';
import DocumentationPage from './DocumentationPage';

import React from 'react';
import {Routes, Route} from 'react-router-dom';
import Stats from './Stats';

export default () => {
    return <Routes>
        <Route path={routing.statsPath} element={<Stats />} />
        <Route path={routing.appsPath} element={<AppListContainer />} />
        <Route path={routing.createAppPath} element={<AppCreatorContainer />} />
        <Route path={routing.editAppPath} element={<AppEditorContainer />} />

        <Route path={routing.docPath} element={<DocumentationPage />} />
        <Route path={routing.docPagePath} element={<DocumentationPage />} />
    </Routes>;
};
