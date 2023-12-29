import axios from 'axios';
import React, { useCallback, useEffect, useState } from 'react';
import { fromVtt, toVtt } from 'subtitles-parser-vtt';
import './Subtitles.css'

const api = axios.create({
    baseURL: "http://localhost:3001"
});

const mapForTags = (subtitleItem) => {
    const regex = /^<\w+>/;
    const text = subtitleItem.text;
    const match = text.match(regex);
    const newSubtitleItem = {
        ...subtitleItem,
    }
    newSubtitleItem.subtitleLines = newSubtitleItem.text.split('\n');
    if (match) { // tag match e.g. <i>Cool </i> add tag, taglessText
        newSubtitleItem.tag = match[0];
        const tagRemovedFromTheEnd = text.slice(0, text.length - match[0].length - 1);
        newSubtitleItem.taglessText = tagRemovedFromTheEnd.slice(match[0].length);
        newSubtitleItem.subtitleLines = newSubtitleItem.taglessText.split('\n');
    }


    return newSubtitleItem;
}

const Subtitles = ({ currentTime }) => {
    const [subtitles, setSubtitles] = useState([]);
    const [currentSubtitle, setCurrentSubtitle] = useState({});
    const [subtitleLines, setSubtitleLines] = useState([])

    const fetchSubtitles = async () => {
        try {
            const response = await api.get('/subtitles?name=fight-club'); // Replace with the actual URL of your subtitle file
            const subtitleText = await response.data;
            // Parse WebVTT using vtt.js
            const newSubtitles = fromVtt(subtitleText, "ms")
            const withTagsMapped = newSubtitles.map(mapForTags);
            console.log('withTagsMapped', withTagsMapped)
            // const newVtt = toVtt(newSubtitles)
            // console.log("newVtt", newVtt)
            setSubtitles(withTagsMapped)
        } catch (error) {
            console.error('Error fetching subtitles:', error);
        }
    };

    useEffect(() => {
        fetchSubtitles();
    }, [])

    const handleTimeUpdate = useCallback(() => {
        // // Find the subtitle that matches the current time
        const subtitle = subtitles.find((cue) => {
            // console.log('cue', cue)
            return currentTime >= cue.startTime / 1000 && currentTime <= cue.endTime / 1000;
        });

        if (subtitle) {
            // console.log('subtitle', mapForTags(subtitle))
            setCurrentSubtitle(subtitle);
        } else {
            setCurrentSubtitle({});
        }
    }, [currentTime, subtitles]);

    useEffect(() => {
        handleTimeUpdate()
    }, [currentTime, handleTimeUpdate])


    return (
        <div className="subtitle-container">
            <p className="subtitle">
                {/* {currentSubtitle.taglessText} */}
                {(currentSubtitle.subtitleLines || []).map((subtitleLine) => <><i>{subtitleLine}</i><br /></>)}
            </p>
        </div>
    );
};

export default Subtitles;
