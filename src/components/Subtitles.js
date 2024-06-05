import React, { createElement, useCallback, useEffect, useState } from 'react';
import { fromVtt } from 'subtitles-parser-vtt';
import './Subtitles.css'
import Tooltip from "./Tooltip";
import { mapForTags } from '../mapForTags';
import { createDebouncedFunction } from '../debounce';
import classNames from 'classnames';
import api from '../api';


const Subtitles = ({
    subtitleId,
    currentTime,
    title,
    hideSubtitles,
    tag,
    locale = '',
    tooltip,
    positionY,
    subtitleScale = 1,
    isEditable,
    addKeyDownListener,
    removeKeyDownListener,
    className,
}) => {
    const [subtitles, setSubtitles] = useState([]);
    const [currentSubtitle, setCurrentSubtitle] = useState({});
    const [selectionText, setSelectionText] = useState("")
    const [editingValue, setEditingValue] = useState();

    const fetchSubtitles = async () => {
        const subtitleFromLocalStorage = localStorage.getItem(['updatedSubtitle', title, locale].join('.'))
        if (subtitleFromLocalStorage) {
            setSubtitles(JSON.parse(subtitleFromLocalStorage));
            return;
        }

        try {
            let response
            if (subtitleId) {
                response = await api().get(`/subtitles_v2/${subtitleId}`)
            } else {
                response = await api().get(`/subtitles?name=${title}${locale ? '&locale=' + locale : ""}`); // Replace with the actual URL of your subtitle file
            }
            console.log("RESPONSE SUBB", response.data)
            let subtitleText = response.data;
            // const newSubtitles = fromVtt(subtitleText, "ms")
            if (locale !== 'en') {
                subtitleText = subtitleText.map((item) => {
                    return {
                        ...item,
                        text: item.translation
                    }
                })
            }
            const withTagsMapped = subtitleText.map(mapForTags);
            console.log("RESPONSE withTagsMapped", withTagsMapped)

            setSubtitles(withTagsMapped)
        } catch (error) {
            console.error('Error fetching subtitles:', error);
        }
    };

    useEffect(() => {
        fetchSubtitles();
    }, [])

    const handleTimeUpdate = useCallback(() => {
        //Find the subtitle that matches the current time
        const subtitle = subtitles.find((cue) => {
            return currentTime >= cue.startTime / 1000 && currentTime <= cue.endTime / 1000;
        });
        console.log('subtitle ' + locale, subtitle)
        if (subtitle) {
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

    const handleStartEditing = (newSelectionText) => {
        if (isEditable && newSelectionText) {
            removeKeyDownListener()
            setEditingValue(currentSubtitle.subtitleLines.join('\n'));
        }
    }

    const handleEndEditing = () => {
        addKeyDownListener()
        setEditingValue("")
    }

    const handleMouseUp = () => {
        const newSelectionText = window.getSelection().toString();
        console.log(`Selected text: ${newSelectionText}`);
        setSelectionText(newSelectionText)
        handleStartEditing(newSelectionText)
    }

    const handleEditareaChange = createDebouncedFunction((event) => {
        if (event.target.value.trim() === '') return;

        setEditingValue(event.target.value)
    }, 500)

    const handleUpdateSubtitle = (event) => {
        event.preventDefault();
        const newSubtitleLines = editingValue.split('\n');
        const newSubtitles = subtitles.map((subtitle) => {
            if (subtitle.id === currentSubtitle.id) {
                return {
                    ...subtitle,
                    subtitleLines: newSubtitleLines,
                }
            } else {
                return subtitle
            }
        });
        localStorage.setItem(['updatedSubtitle', title, locale].join('.'), JSON.stringify(newSubtitles, undefined, 2))
        setSubtitles(newSubtitles);
        handleEndEditing();
    }

    const handleUpdateSubtitleOnServer = () => {
        handleEndEditing();
    }

    return (
        <div className="subtitle-container" style={{ top: positionY * 100 + '%', fontSize: (subtitleScale * 16) + "px" }}>
            <div className={classNames(["subtitle", className])} onPointerUp={handleMouseUp}>
                {currentSubtitle?.subtitleLines?.map((subtitleLine) => {
                    if (tooltip) {
                        return <>{createElement(currentSubtitle.tag || 'span', {},
                            subtitleLine.split(' ').map((sbtWord) => <Tooltip text={sbtWord} className={className} selectionText={selectionText} />)
                        )}<br /></>
                    }
                    return <>{createElement(currentSubtitle.tag || 'span', { className: "subtitleLine" }, subtitleLine)}<br /></>
                })}
            </div>

            {isEditable && editingValue && selectionText && (
                <form>
                    <textarea
                        className='editingText'
                        defaultValue={editingValue}
                        onChange={handleEditareaChange}j
                    />
                    <br />
                    <button onClick={handleEndEditing}>Cancel</button>
                    <button onClick={handleUpdateSubtitle}>Save</button>
                    <button onClick={handleUpdateSubtitleOnServer}>Save to Server</button>
                </form>
            )}
        </div>
    );
};

export default Subtitles;
