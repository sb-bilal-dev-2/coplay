
import React, { useRef, useState, useEffect } from 'react'
import { useLocation, useParams } from 'react-router';
import api from '../api';
import './Dialogs.css'

import StickyHeader from "../components/StickyHeader"
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';

export const Dialogs = () => {
    const [dialogs, set_dialogs] = useState([])

    async function request_dialogs() {
        try {
            const new_dialogs = (await api().get('/dialogs')).results

            set_dialogs(new_dialogs)
        } catch (err) {

        }
    }

    useEffect(() => {
        request_dialogs()
    }, [])

    return <div className="page-container home-page">
        <StickyHeader />
        <h1 className="text-xl">Dialogs</h1>
        {/* <div className='p-2'>
            <div className='rounded-full bg-gray-200' style={{ width: '60px', height: '60px', background: undefined }}>
            </div>
        </div> */}
        <div className='m-2' to={'/video/'}>
            <h3 className='text-left'>{ }Jhonny</h3>
            <p>{ }I told you I was coming this way.</p>
        </div>
        <div className='m-2 p-2 bg-white rounded-lg'>
            {dialogs.map((item) => {
                return <div className='m-2' to={'/video/' + item.id}>
                    <h3 className='text-left'>{item.title}Jhonny</h3>
                    <p>{item.src}I told you I was coming this way.</p>
                </div>
            })}
        </div>
    </div>
}

export const Story = () => {
    const { dialogId } = useParams()
    const [currentIndex, set_currentIndex] = useState(0)
    const [dialog, set_dialog] = useState([
        { text: 'Hey! How are you', owner: 'anonymous' },
        { text: 'I am good!', owner: 'me' },
        { text: 'How was your day', owner: 'anonymous' },
        { text: 'I am good!', owner: 'me' },
        { text: 'How was your day', owner: 'anonymous' },
    ])

    async function request_dialog() {
        try {
            const new_dialog = (await api().get('/dialog')).results

            set_dialog(new_dialog)
        } catch (err) {

        }
    }

    useEffect(() => {
        request_dialog()
    }, [dialogId])

    return <div className="page-container home-page">
        <StickyHeader />
        <h1 className="text-xl color-primary">Dialog</h1>
        <div
            className=''
            onClick={() => {
                set_currentIndex(currentIndex + 1)
            }}
        >{dialog.map((item, index) => {
            return <p
                style={{}}
                className={`bg-white rounded-xl m-4 p-4 ${index > currentIndex + 2 && 'hidden'}`}>
                <p>{item.text}</p>
            </p>
        })}</div>
    </div>
}

export const Dialog = () => {
    const { dialogId } = useParams()
    const [dialog, set_dialog] = useState([
        { text: 'Hey! How are you', owner: 'anonymous' },
        { text: 'I am good!', owner: 'me' },
        { text: 'How was your day', owner: 'anonymous' },
    ])

    async function request_dialog() {
        try {
            const new_dialog = (await api().get('/dialog')).results

            set_dialog(new_dialog)
        } catch (err) {

        }
    }

    useEffect(() => {
        request_dialog()
    }, [dialogId])

    return <div className="page-container home-page">
        <StickyHeader />
        <h1 className="text-xl">Dialog</h1>
        <div className=''>{dialog.map((item) => {
            return <div className='bg-white rounded-xl m-4 p-4'>
                <p>{item.text}</p>
            </div>
        })}</div>
    </div>
}

export const History = () => {
    const user = useSelector((state) => state.user.user);
    const history = user?.history || []
    console.log('user', user)
    async function request_history() {
    }

    useEffect(() => {
        // request_history()
    }, [])

    return <div className="page-container home-page">
        <StickyHeader />
        <h1 className="text-xl">Watch History</h1>
        <div className=''>{history.map((item) => {
            return <Link className='' to={'/video/' + item.id}>
                <h4>{item.title}</h4>
                <p>{item.src}</p>
            </Link>
        })}</div>
    </div>
}