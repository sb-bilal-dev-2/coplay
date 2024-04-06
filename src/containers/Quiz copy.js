import React, { useEffect, useRef, useState } from 'react'
import StickyHeader from '../components/StickyHeader'
import Footer from '../components/Footer'
import { useParams } from 'react-router'
import api from '../api'
import './Quiz.css'
import { BASE_SERVER_URL } from '../useRequests'
import classNames from 'classnames'


const Quiz = ({ }) => {
    const { title } = useParams()
    const [isShowingTranslation, set_isShowingTranslation] = useState();
    const [practicingWords, set_practicingWords] = useState()
    const [currentLemma, set_currentLemma] = useState()
    const [lemmaData, set_lemmaData] = useState()
    const [lemmaVideos, set_lemmaVideos] = useState([])
    const requestLemmaOccurances = async (lemma) => {
        try {
            const wordData = (await api().get(`/occurances?lemma=${lemma}`)).data.results
            console.log('wordData', wordData)
            if (wordData.length) {
                set_lemmaVideos(wordData)
                const firstOccurance = wordData[0]
                const firstOccuranceSrc = BASE_SERVER_URL + '/' + firstOccurance.mediaType
                set_currentVideoSrc()
            }
        } catch (err) {
            console.log('err', err)
        }
    }

    const [error, set_error] = useState()
    const [currentVideoSrc, set_currentVideoSrc] = useState('')
    const [playingSrcIndex, set_playingSrcIndex] = useState(0);
    const word = 'go'
    const videoRef = useRef()
    const wordTranslation = 'vuy, shkalat'

    const waitAndPlayNext = () => {

    }

    const requestListAndGetCurrentLemma = async () => {
        let list = []
        // if (title === 'learning') {
        //     console.log('requesting initials')
        //     try {
        //         const userWords = (await api().get('/get-user?allProps=1'))?.data?.words
        //         list = userWords.filter((item) => !item.learned);
        //     } catch (err) {
        //         set_error(err)
        //         console.log('err: ', err)
        //     }
        // } else {
        //     // try {
        //     //     list = (await api().get('/get-list'))?.data?.[0]
        //     // } catch (err) {
        //     //     set_error(err)
        //     //     console.log("err: ", err)
        //     // }
        // }
        console.log('list', list)
        const newCurrentLemma = list[0]?.lemma;
        let newCurrentLemmaInfo;
        try {
            const response = await api().get(`/wordInfos?lemma=${'time'}`)
            console.log('response', response)

            newCurrentLemmaInfo = response?.data?.results[0]

            console.log('newCurrentLemmaInfo', newCurrentLemmaInfo)
        } catch (err) {
            set_error(err)
            console.log('err: ', err)
        }
        set_currentLemma(newCurrentLemmaInfo)
        set_practicingWords(list)
    }

    useEffect(() => {
        requestLemmaOccurances('time')
        requestListAndGetCurrentLemma()
    }, [])

    useEffect(() => {
        if (lemmaVideos.length) {
            console.log('currentVideoSrc', currentVideoSrc)
            videoRef.current.load()
            videoRef.current.play()
        }
    }, [currentVideoSrc, lemmaVideos.length])

    return (
        <>
            {/* <StickyHeader /> */}
            <div className='QuizMain flex-grow bg-secondary-2 text-gray text-gray-100'>
                {lemmaVideos.length && 
                    <video
                        className={classNames('w-full')}
                        // src={currentVideoSrc}
                        ref={videoRef}
                        // autoPlay
                        onLoadedMetadata={() => {
                            videoRef.current.currentTime = lemmaVideos[playingSrcIndex].startTime
                        }}
                        onTimeUpdate={() => {
                            console.log('videoRef.current.currentTime', videoRef.current.currentTime)
                            if (videoRef.current.currentTime >= lemmaVideos[playingSrcIndex].endTime) {
                                videoRef.current.pause();
                                waitAndPlayNext();
                                // videoRef.current.currentTime = startOfScene
                            }
                        }}
                    >
                        <source src={currentVideoSrc} />
                    </video>
                }

                {/* {lemmaVideos.map((item, index) => {
                    // if (index < playingSrcIndex + 2) {
                    return (<video
                        key={item.src}
                        className={classNames('w-full absolute', { invisible: playingSrcIndex !== index })}
                        src={BASE_SERVER_URL + item.src}
                        ref={el => videoRef.current[index] = el}
                        autoPlay={playingSrcIndex === 0}
                        onLoadedMetadata={() => {
                            videoRef.current[index].currentTime = item.startTime
                            if (playingSrcIndex !== index) {
                                videoRef.current[index].pause()
                            }
                        }}
                        onTimeUpdate={() => {
                            console.log('videoRef.current.currentTime', videoRef.current[index])
                            if (videoRef.current[index].currentTime >= item.endTime) {
                                videoRef.current[index].pause();
                                waitAndPlayNext();
                                // videoRef.current.currentTime = startOfScene
                            }
                        }}
                    />)
                    // }
                })} */}
                <button
                    className='float-right pr-4'
                    onClick={() => {
                        videoRef.current.currentTime = lemmaVideos[playingSrcIndex].startTime
                        videoRef.current.play()
                    }}
                ><b>Replay</b></button>
                <button
                    className='float-right pr-4'
                    onClick={() => {
                        videoRef.current.currentTime = lemmaVideos[playingSrcIndex].startTime
                        videoRef.current.play()
                    }}
                ><b>Next Word</b></button>
                {playingSrcIndex + 1 !== lemmaVideos.length &&
                    <button
                        className='float-right pr-4'
                        onClick={async () => {
                            if (!videoRef.current.paused) {
                                // videoRef.current.pause();
                            }
                            const next_playingSrcIndex = playingSrcIndex + 1;
                            set_currentVideoSrc(BASE_SERVER_URL + lemmaVideos[next_playingSrcIndex].src)
                            videoRef.current.currentTime = lemmaVideos[next_playingSrcIndex].startTime
                            set_playingSrcIndex(next_playingSrcIndex)
                        }}
                    ><b>Next</b></button>
                }
                <b className="p-4 text-xs">
                    Practicing List: {title.charAt(0).toUpperCase() + title.slice(1)}
                </b>
                <h1
                    className='headline-1 cursor-default'
                    onClick={() => set_isShowingTranslation(!isShowingTranslation)}
                >{isShowingTranslation ? wordTranslation : currentLemma?.lemma}</h1>
                <div className='m-4 p-4 paper'>
                    <p>Other forms (en): {(["went", " going", " gone", " goes"]).map((item) => (
                        <button className='cursor-pointer px-1 mx-1 border-2 border-orange-200'>{item}</button>
                    ))}</p>
                    {/* <p>Definition: Change location</p> */}
                    {/* <p>Other forms (uz): </p> */}
                    {/* <button className='text-xs'>See all definitions ...</button> */}
                </div>
            </div>
            <Footer />
        </>
    )
}

export default Quiz
