import React from 'react';
import './WordsPage.css';
import useRequests from './useRequests';

const WordsPage = () => {
    return <UseRequests uri="words" />
}

function UseRequests({ uri }) {
    const {
        storedData,
        requestLoading,
        requestError,
    } = useRequests(uri)

    return <div>
        {JSON.stringify(storedData, undefined, 2)}, {JSON.stringify(requestLoading)}, {JSON.stringify(requestError)}
    </div>
}

export default WordsPage;
