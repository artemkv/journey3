import React, {useEffect, useState} from 'react';
import MarkdownView from 'react-showdown';
import {useParams} from 'react-router-dom';

import DocumentationToc from './DocumentationToc';

import gdprExplained from '../doc/gdpr_explained.md';
import gdprExample from '../doc/gdpr_example.md';

export default function App() {
    const {page} = useParams();

    const [markdown, setMarkdown] = useState('');

    useEffect(() => {
        switch (page) {
        case 'gdpr_explained':
            setMarkdown(gdprExplained);
            break;
        case 'gdpr_example':
            setMarkdown(gdprExample);
            break;
        }
    }, [page]);

    return (
        <div>
            <div className="row">
                <div className="col s2">
                    <DocumentationToc />
                </div>
                <div className="col s10">
                    <MarkdownView className='doc-page'
                        markdown={markdown}
                        options={{tables: true, emoji: true}}
                    />
                </div>
            </div>
        </div>
    );
};
