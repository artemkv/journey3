import React, {useEffect, useState} from 'react';
import MarkdownView from 'react-showdown';
import {useParams} from 'react-router-dom';

import DocumentationToc from './DocumentationToc';

import index from '../doc/index.md';
import analytics from '../doc/analytics.md';
import anonymization from '../doc/anonymization.md';
import performance from '../doc/performance.md';
import gdprExplained from '../doc/gdpr_explained.md';
import gdprExample from '../doc/gdpr_example.md';
import androidNative from '../doc/android_native.md';
import flutter from '../doc/flutter.md';
import reactNative from '../doc/react_native.md';
import xamarin from '../doc/xamarin.md';

export default function App() {
    const {page} = useParams();

    const [markdown, setMarkdown] = useState(index);

    useEffect(() => {
        switch (page) {
        case 'gdpr_explained':
            setMarkdown(gdprExplained);
            break;
        case 'gdpr_example':
            setMarkdown(gdprExample);
            break;
        case 'android_native':
            setMarkdown(androidNative);
            break;
        case 'flutter':
            setMarkdown(flutter);
            break;
        case 'react_native':
            setMarkdown(reactNative);
            break;
        case 'xamarin':
            setMarkdown(xamarin);
            break;
        case 'analytics':
            setMarkdown(analytics);
            break;
        case 'anonymization':
            setMarkdown(anonymization);
            break;
        case 'performance':
            setMarkdown(performance);
            break;
        default:
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
