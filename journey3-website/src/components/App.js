import React, {useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {cleanIdToken, setIdToken} from '../sessionapi';
import {statsPath} from '../routing';

import Auth from '@aws-amplify/auth';
import CognitoSignIn from './CognitoSignIn';
import Empty from './Empty';
import Header from './Header';
import PublicArea from './PublicArea';
import SignedInArea from './SignedInArea';
import Spinner from './Spinner';

import {reportInitSignIn, reportCompletedSignIn, reportSignOut} from '../journeyconnector';

const APP_LOADED_SIGN_IN_STATUS_UNKNOWN = 0;
const APP_USER_INITIATED_SIGN_IN = 1;
const APP_SIGNED_IN = 2;
const APP_SIGNED_OUT = 3;
const APP_USER_INITIATED_SIGN_OUT = 4;

export default () => {
    const [signInStatus, setSignInStatus] = useState(APP_LOADED_SIGN_IN_STATUS_UNKNOWN);

    const navigate = useNavigate();

    // determine signin status
    const cognitoSession = Auth.currentSession();
    cognitoSession.then((x) => {
        setIdToken(x.idToken.jwtToken);
        // if signed in, land on data page
        setSignInStatus((status) => status === APP_LOADED_SIGN_IN_STATUS_UNKNOWN ? APP_SIGNED_IN : status);
    }).catch((_) => {
        cleanIdToken();
        // if signed out, land on public page
        setSignInStatus((status) => status === APP_LOADED_SIGN_IN_STATUS_UNKNOWN ? APP_SIGNED_OUT : status);
    });

    function onSignInRequested() {
        reportInitSignIn();
        setSignInStatus(APP_USER_INITIATED_SIGN_IN);
    }

    function onSignOutRequested() {
        reportSignOut();
        cleanIdToken();
        setSignInStatus(APP_USER_INITIATED_SIGN_OUT);
        Auth.signOut().then((_) => {
            setSignInStatus(APP_SIGNED_OUT);
        }).catch((err) => {
            console.error(err); // TODO: show error in a user-friendly way
        });
    }

    function onSignedIn(cognitoSession) {
        cognitoSession.then((x) => {
            setIdToken(x.idToken.jwtToken);
            reportCompletedSignIn();
            setSignInStatus(APP_SIGNED_IN);
            navigate(statsPath);
        }).catch((err) => {
            cleanIdToken();
            console.error(err); // TODO: show error in a user-friendly way
        });
    }

    switch (signInStatus) {
    case APP_LOADED_SIGN_IN_STATUS_UNKNOWN:
        return <Empty />;
    case APP_USER_INITIATED_SIGN_IN:
        return <CognitoSignIn onSignedIn={onSignedIn} />;
    case APP_SIGNED_IN:
        return <div>
            <div className="row">
                <Header onSignOutRequested={onSignOutRequested} />
            </div>
            <SignedInArea />
        </div>;
    case APP_SIGNED_OUT:
        return <PublicArea onSignInRequested={onSignInRequested} />;
    case APP_USER_INITIATED_SIGN_OUT:
        return <Spinner />;
    }
};
