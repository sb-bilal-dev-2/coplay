
import React, { useRef, useState, useEffect } from 'react'
import { useLocation, useParams } from 'react-router';
import api from '../api';

import StickyHeader from "../components/StickyHeader"
import { Link } from 'react-router-dom';

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
        <div className=''>{dialogs.map((item) => {
            return <Link className='' to={'/video/' + item.id}>
                <h4>{item.title}</h4>
                <p>{item.src}</p>
            </Link>
        })}</div>
    </div>
}

export const Dialog = () => {
    const { dialogId } = useParams()
    const [dialog, set_dialog] = useState([])

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
            return <Link className='' to={'/video/' + item.id}>
                <h4>{item.title}</h4>
                <p>{item.src}</p>
            </Link>
        })}</div>
    </div>
}

export const History = () => {
    const [history, set_history] = useState([])

    async function request_history() {
        try {
            const new_history = (await api().get('/history')).results

            set_history(new_history)
        } catch (err) {

        }
    }

    useEffect(() => {
        request_history()
    }, [])

    return <div className="page-container home-page">
        <StickyHeader />
        <h1 className="text-xl">History</h1>
        <div className=''>{history.map((item) => {
            return <Link className='' to={'/video/' + item.id}>
                <h4>{item.title}</h4>
                <p>{item.src}</p>
            </Link>
        })}</div>
    </div>
}