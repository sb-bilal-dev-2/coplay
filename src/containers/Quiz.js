import React, { useEffect, useState } from 'react'
import StickyHeader from '../components/StickyHeader'
import Footer from '../components/Footer'
import { useParams } from 'react-router'
import api from '../api'
import './Quiz.css'


const Quiz = ({}) => {
    const { title } = useParams()
    const [lemmaData, set_lemmaData] = useState()
    const requestLemma = async () => {
        try {
            await api().get('/words/take')
        } catch (err) {
            console.log('err', err)
        }
    }

    useEffect(() => {
        requestLemma()
    }, [])

    const wordVideos = [] 
    const currentVideoSrc = ''
    const word = 'go'
    return (
        <>
            {/* <StickyHeader /> */}
            <div className='QuizMain flex-grow bg-secondary-2 text-gray text-gray-100'>
                <video className='w-full' src={currentVideoSrc} autoPlay />
                <b className="p-4 text-xs">
                    Practicing List: {title.charAt(0).toUpperCase() + title.slice(1)}
                </b>
                <h1 className='headline-1'>{word}</h1>
                <div className='m-4 p-4 paper'>
                    <p>Other forms: <b>went; going; gone; goes;</b></p>
                    <p>Definition: </p>
                </div>
            </div>
            <Footer />
        </>
    )
}

export default Quiz
