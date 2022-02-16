import * as routing from '../routing';

import AppCreatorContainer from './AppCreatorContainer';
import AppEditorContainer from './AppEditorContainer';
import AppListContainer from './AppListContainer';
import React from 'react';
import {Router} from '@reach/router';
import Stats from './Stats';

export default () => {
    return <Router>
        <Stats path={routing.statsPath} />
        <AppListContainer path={routing.appsPath} />
        <AppCreatorContainer path={routing.createAppPath} />
        <AppEditorContainer path={routing.editAppPath} />
    </Router>;
};
