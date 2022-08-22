import React, {useEffect, useState} from 'react';
import MarkdownView from 'react-showdown';
import {useParams} from 'react-router-dom';

import DocumentationToc from './DocumentationToc';

import index from '../doc/index.md';
import analytics from '../doc/analytics.md';
import anonymization from '../doc/anonymization.md';
import performance from '../doc/performance.md';
import pricing from '../doc/pricing.md';
import gdprExplained from '../doc/gdpr_explained.md';
import gdprExample from '../doc/gdpr_example.md';
import androidNative from '../doc/android_native.md';
import flutter from '../doc/flutter.md';
import reactNative from '../doc/react_native.md';
import xamarin from '../doc/xamarin.md';
import ionic from '../doc/ionic.md';
import {reportNavigateToDocPage} from '../journeyconnector';

export default function App() {
    const {page} = useParams();

    const [markdown, setMarkdown] = useState(index);

    useEffect(() => {
        switch (page) {
        case 'gdpr_explained':
            reportNavigateToDocPage(`navto_doc_${page}`);
            setMarkdown(gdprExplained);
            break;
        case 'gdpr_example':
            reportNavigateToDocPage(`navto_doc_${page}`);
            setMarkdown(gdprExample);
            break;
        case 'android_native':
            reportNavigateToDocPage(`navto_doc_${page}`);
            setMarkdown(androidNative);
            break;
        case 'flutter':
            reportNavigateToDocPage(`navto_doc_${page}`);
            setMarkdown(flutter);
            break;
        case 'react_native':
            reportNavigateToDocPage(`navto_doc_${page}`);
            setMarkdown(reactNative);
            break;
        case 'xamarin':
            reportNavigateToDocPage(`navto_doc_${page}`);
            setMarkdown(xamarin);
            break;
        case 'ionic':
            reportNavigateToDocPage(`navto_doc_${page}`);
            setMarkdown(ionic);
            break;
        case 'analytics':
            reportNavigateToDocPage(`navto_doc_${page}`);
            setMarkdown(analytics);
            break;
        case 'anonymization':
            reportNavigateToDocPage(`navto_doc_${page}`);
            setMarkdown(anonymization);
            break;
        case 'performance':
            reportNavigateToDocPage(`navto_doc_${page}`);
            setMarkdown(performance);
            break;
        case 'pricing':
            reportNavigateToDocPage(`navto_doc_${page}`);
            setMarkdown(pricing);
            break;
        default:
            reportNavigateToDocPage('navto_doc_index');
            setMarkdown(index);
        }
    }, [page]);

    return (
        <div>
            <div className="row">
                <div className="col s3">
                    <DocumentationToc />
                </div>
                <div className="col s9">
                    <MarkdownView className='doc-page'
                        markdown={markdown}
                        options={{tables: true, emoji: true}}
                    />
                </div>
            </div>
        </div>
    );
};
