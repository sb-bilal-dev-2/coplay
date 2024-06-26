import React, { useEffect, useState } from 'react'
import AdvancedSwipe from '../components/AdvancedSwipe'
import api from '../api'

export default function MovieWordCards({ parsedSubtitleId, userId }) {
    const [lemmas, setLemmas] = useState([])
    const [error, set_error] = useState('')
    console.log('userId', userId)
    const fetchLemmas = async () => {
        set_error('')
        if (!parsedSubtitleId) {
            return;
        }
        let fetchedLemmas
        try {
            fetchedLemmas = await api().get(`/movie_words/${parsedSubtitleId}?without_user_words=true`);
        } catch (err) {
            set_error(err.message)
        }
        setLemmas(fetchedLemmas?.data || [])
    }
    const handleSwipeBottom = () => {

    }
    const handleSwipeTop = () => {

    }
    const handleSwipeLeft = async (lemma) => {
        const newWord = { lemma, repeatCount: 7, repeatTime: Date.now() }
        await api().post('/self_words', [newWord])

    }
    const handleSwipeRight = async (lemma) => {
        const newWord = { lemma, repeatCount: 0, repeatTime: Date.now() }
        await api().post('/self_words', [newWord])
    }
    useEffect(() => {
        fetchLemmas()
    }, [userId, parsedSubtitleId])

    return (
      <div>
        {!!lemmas.length && (
          <AdvancedSwipe
            list={lemmas}
            onSwipeBottom={handleSwipeBottom}
            onSwipeTop={handleSwipeTop}
            onSwipeLeft={handleSwipeLeft}
            onSwipeRight={handleSwipeRight}
          />
        )}
        {!!error?.length && error}
      </div>
    );
}