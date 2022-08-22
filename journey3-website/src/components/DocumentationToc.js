import * as routing from '../routing';

import React from 'react';
import {Link} from 'react-router-dom';

export default (props) => {
    return <div>
        <div>
            <div className="row doc-toc-link-container">
                <Link to={routing.docPath} className="doc-toc-link">
                    Journey3
                </Link>
            </div>
            <div className="row doc-toc-link-container">
                <Link to={routing.docAnalyticsPath} className="doc-toc-link">
                    Our analytics
                </Link>
            </div>
            <div className="row doc-toc-link-container">
                <Link to={routing.docPerformance} className="doc-toc-link">
                    Performance
                </Link>
            </div>
            <div className="row doc-toc-link-container">
                <Link to={routing.docPricing} className="doc-toc-link">
                    Pricing
                </Link>
            </div>
            <div className="row"></div>
            <div className="row doc-toc-link-container">
                <Link to={routing.docGdprExplainedPath} className="doc-toc-link">
                    GDPR explaned
                </Link>
            </div>
            <div className="row">
                <Link to={routing.docGdprExamplePath} className="doc-toc-link">
                    GDPR example
                </Link>
            </div>
            <div className="row doc-toc-link-container">
                <Link to={routing.docAnonymization} className="doc-toc-link">
                    Anonymization
                </Link>
            </div>
            <div className="row"></div>
            <div className="row">
                <Link to={routing.docFlutterPath} className="doc-toc-link">
                    Flutter
                </Link>
            </div>
            <div className="row">
                <Link to={routing.docReactPath} className="doc-toc-link">
                    React Native
                </Link>
            </div>
            <div className="row">
                <Link to={routing.docXamarinPath} className="doc-toc-link">
                    Xamarin
                </Link>
            </div>
            <div className="row">
                <Link to={routing.docIonicPath} className="doc-toc-link">
                    Ionic
                </Link>
            </div>
            <div className="row">
                <Link to={routing.docAndroidPath} className="doc-toc-link">
                    Andoroid Native
                </Link>
            </div>
        </div>
    </div>;
};
