import axios from 'axios';
import React, { createElement, useCallback, useEffect, useState } from 'react';
import { fromVtt, toVtt } from 'subtitles-parser-vtt';
import './Subtitles.css'
import Tooltip from "./Tooltip";
import { mapForTags } from '../mapForTags';

const api = axios.create({
    baseURL: "http://localhost:3001"
});

const Subtitles = ({
    currentTime,
    title,
    hideSubtitles,
    tag,
    locale = '',
    tooltip,
    positionY,
    
}) => {
    const [subtitles, setSubtitles] = useState([]);
    const [currentSubtitle, setCurrentSubtitle] = useState({});
    const [subtitleLines, setSubtitleLines] = useState([])
    const [selectionText, setSelectionText] = useState("")

    const fetchSubtitles = async () => {
        try {
            const response = await api.get(`/subtitles?name=${title}${locale ? '&locale=' + locale : ""}`); // Replace with the actual URL of your subtitle file
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

    if (hideSubtitles) {
        return;
    }

    const handleMouseUp = () => {
        const newSelectionText = window.getSelection().toString();
        console.log(`Selected text: ${selectionText}`);
        setSelectionText(newSelectionText)
    }

    return (
        <div className="subtitle-container" style={{ top: positionY * 100 + '%' }}>
            <div className="subtitle" onPointerUp={handleMouseUp}>
                {(currentSubtitle.subtitleLines || []).map((subtitleLine) => {
                    return <>{createElement(currentSubtitle.tag || 'span', {},
                        tooltip ?
                            subtitleLine.split(' ').map((sbtWord) => <Tooltip text={sbtWord} selectionText={selectionText} />)
                            : subtitleLine
                    )}<br /></>
                })}
            </div>
        </div>
    );
};

export default Subtitles;
