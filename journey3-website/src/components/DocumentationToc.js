import * as routing from '../routing';

import React from 'react';
import {Link} from 'react-router-dom';

export default (props) => {
    return <div>
        <div>
            <div className="row doc-toc-link-container">
                <Link to={routing.docGdprExplainedPath} className="doc-toc-link">
                        GDPR Explaned
                </Link>
            </div>
            <div className="row">
                <Link to={routing.docGdprExamplePath} className="doc-toc-link">
                        GDPR Example
                </Link>
            </div>
        </div>
    </div>;
};
