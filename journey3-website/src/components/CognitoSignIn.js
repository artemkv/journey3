import { AmplifyAuthContainer, AmplifyAuthenticator, AmplifySignIn, AmplifySignUp } from '@aws-amplify/ui-react';
import { AuthState, onAuthUIStateChange } from '@aws-amplify/ui-components';
import React, { useEffect } from 'react';

import Amplify from '@aws-amplify/core';
import Auth from '@aws-amplify/auth';

// See https://docs.amplify.aws/ui/auth/authenticator/q/framework/react/

Amplify.configure({
    Auth: {
        region: 'us-east-1',
        userPoolId: 'us-east-1_XoB3wgyZq',
        userPoolWebClientId: '200iu9g037rhouhfsirfphhl5h'
    }
});

export default (props) => {
    useEffect(() => {
        return onAuthUIStateChange((nextAuthState, authData) => {
            // TODO: what if cognito session expires? need to handle that
            if (nextAuthState === AuthState.SignedIn) {
                props.onSignedIn(Auth.currentSession());
            }
        });
    }, []);

    // TODO: apply theme
    return (
        <AmplifyAuthContainer>
            <AmplifyAuthenticator
                usernameAttributes="email">
                <AmplifySignIn
                    slot="sign-in"
                    usernameAlias="email" />
                <AmplifySignUp
                    slot="sign-up"
                    usernameAlias="email"
                    formFields={[
                        { type: 'email' },
                        { type: 'password' }
                    ]}
                />
            </AmplifyAuthenticator>
        </AmplifyAuthContainer>
    );
};
