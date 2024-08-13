import React, { useEffect, useState } from 'react'
import AdvancedSwipe from '../../components/AdvancedSwipe'
import api from '../../api'
import { useTranslation } from "react-i18next";


export default function MovieWordCards({ parsedSubtitleId, userId, mediaLang }) {
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
            console.log('fetchedLemmas', fetchedLemmas)
        } catch (err) {
            set_error(err.message)
        }
        setLemmas(fetchedLemmas?.data || [])
    }
      const { t } = useTranslation();

    const handleSwipeBottom = () => {

    }
    const handleSwipeTop = () => {

    }
    const handleSwipeLeft = async (the_word) => {
        const newWord = { the_word, repeatCount: 7, repeatTime: Date.now() }
        await api().post('/self_words', [newWord])

    }
    const handleSwipeRight = async (the_word) => {
        const newWord = { the_word, repeatCount: 0, repeatTime: Date.now() }
        await api().post('/self_words', [newWord])
    }
    useEffect(() => {
        fetchLemmas()
    }, [userId, parsedSubtitleId])

    return (
      <div>
        {!!lemmas.length && mediaLang && (
          <AdvancedSwipe
            list={lemmas.reverse()}
            onSwipeBottom={handleSwipeBottom}
            onSwipeTop={handleSwipeTop}
            onSwipeLeft={handleSwipeLeft}
            onSwipeRight={handleSwipeRight}
            title={t("movie word list")}
            mediaLang={mediaLang}
          />
        )}
        {!!error?.length && error}
      </div>
    );
}