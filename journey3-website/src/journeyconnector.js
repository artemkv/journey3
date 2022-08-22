import {initializeWeb} from 'journey3-nodejs-sdk';
import {reportEvent, reportStageTransition} from 'journey3-nodejs-sdk';

const exploreStage = 2;
const exploreStageName = 'explore';

const initSignInStage = 3;
const initSignInStageName = 'init_sign_in';

const signInStage = 4;
const signInStageName = 'sign_in';

const createAppStage = 5;
const createAppStageName = 'create_app';

export const initialize = (version, isRelease) => {
    initializeWeb(
        'e04b43c9-69c1-4172-9dfd-a3ef1aa17d5e',
        'ea756c33-2701-499d-ad8c-8a612add0ddc',
        version,
        isRelease
    );
};

export const reportNavigateToDocPage = (eventName) => {
    reportStageTransition(exploreStage, exploreStageName);
    reportEvent(eventName, true);
};

export const reportInitSignIn = () => {
    reportStageTransition(initSignInStage, initSignInStageName);
    reportEvent('init_sign_in');
};

export const reportCompletedSignIn = () => {
    reportStageTransition(signInStage, signInStageName);
    reportEvent('sign_in');
};

export const reportSignOut = () => {
    reportEvent('sign_out');
};

export const reportNavToStats = () => {
    reportEvent('navto_stats', true);
};

export const reportNavToApps = () => {
    reportEvent('navto_apps');
};

export const reportCreateApp = () => {
    reportStageTransition(createAppStage, createAppStageName);
    reportEvent('create_app');
};
