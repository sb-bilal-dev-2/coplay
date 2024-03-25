import React, { useEffect, useState } from 'react'
import AdvancedSwipe from '../components/AdvancedSwipe'
import api from '../api'

export default function MovieWordCards({ title, userId }) {
    const [lemmas, setLemmas] = useState([])
    console.log('userId', userId)
    const fetchLemmas = async () => {
        const fetchedLemmas = await api().get('/movie_words/kung-fu-panda-3?without_user_words=true');
        setLemmas(fetchedLemmas.data)
    }
    const handleSwipeBottom = () => {

    }
    const handleSwipeTop = () => {

    }
    const handleSwipeLeft = async (lemma) => {
        const newWord = { lemma, learning: true }
        await api().post('/self_words', [newWord])
    }
    const handleSwipeRight = async (lemma) => {
        const newWord = { lemma, learned: true }
        await api().post('/self_words', [newWord])
    }
    useEffect(() => {
        fetchLemmas()
    }, [userId])
    console.log('lemmas', lemmas)
    return (
        <div>{!!lemmas.length && (
            <AdvancedSwipe
                list={lemmas}
                onSwipeBottom={handleSwipeBottom}
                onSwipeTop={handleSwipeTop}
                onSwipeLeft={handleSwipeLeft}
                onSwipeRight={handleSwipeRight}
            />
        )}</div>
    )
}