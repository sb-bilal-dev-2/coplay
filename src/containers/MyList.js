import React, { useEffect, useState } from 'react'
import StickyHeader from '../components/StickyHeader';
import Footer from '../components/Footer';
import './MyList.css';
import classNames from 'classnames';
import api from '../api';
import { useDispatch, useSelector } from 'react-redux';
import { updateUser, updateGivenUserValues } from '../store'
import { Link } from 'react-router-dom';
import { redirect } from 'react-router';
import { usePost } from './usePost';

const HOUR = 1000 * 60 * 60;
const WEEK = HOUR * 24 * 7;
export const REPEAT_COUNT_TO_POSTPONE_TIME_DIFFERENCE = {
    '1': HOUR,
    '2': HOUR * 2,
    '3': HOUR * 3,
    '4': HOUR * 4,
    '5': HOUR * 24,
    '6': WEEK,
    '7': WEEK * 2,
}

export const sortByLearningState = (items = []) => {
    const repeatingList = []
    const learningList = []
    const learnedList = []

    items.forEach((item) => {
        const repeatCount = item.repeatCount || 0;
        const REPEAT_POSTPONE_TIME_DIFFERENCE = REPEAT_COUNT_TO_POSTPONE_TIME_DIFFERENCE[repeatCount] || Infinity;
        const currentTime = Date.now();
        console.log('currentTime', currentTime, item.repeatTime)
        const repeatTime = item.repeatTime || currentTime;
        const timeDifference = currentTime - repeatTime;
        console.log('timeDifference', timeDifference)
        if (repeatCount < 7) {
            if (!item.repeatCount || timeDifference > REPEAT_POSTPONE_TIME_DIFFERENCE) {
                repeatingList.push(item)
            } else {
                learningList.push(item)
            }
        } else {
            learnedList.push(item)
        }
    })

    return {
        repeatingList,
        learningList,
        learnedList
    }
}

const MyList = () => {
    const { learningList, learnedList, repeatingList } = useRequestUserWordLists()
    console.log('learningList',)
    return (
        <>
            <StickyHeader />
            <div className='section MyListMain bg-secondary text-gray-100'>
                <div className="p-4">
                    <RenderTagList list={repeatingList} name="repeating" />
                    <RenderTagList list={learningList} name="learning" />
                    <RenderTagList list={learnedList} name="learned" />
                </div>
            </div>
            <Footer />
        </>
    )
}

const LEARN_STATE_NAMES = {
    'learning': 'Learning Words List',
    'learned': 'Learned Words List',
    'repeating': 'Repeating Words List',
}

function RenderTagList({ list = [], name }) {
    const dispatch = useDispatch()
    const [isEditing, setEditing] = useState(false)
    const [selectedItems, setSelectecItems] = useState([])
    const [postUserWords] = usePost((data) => dispatch(updateGivenUserValues(data)))
    const handleTagClick = (item) => {
        if (selectedItems.includes(item)) {
            setSelectecItems(selectedItems.filter((crt) => item !== crt))
        } else {
            setSelectecItems([...selectedItems, item])
        }
    }
    console.log('list', list)
    const learnFullList = () => {
        const words = list.map(item => ({ lemma: item.lemma, repeatCount: 7, repeatTime: Date.now() }))
        postUserWords('/self_words', words)
        setEditing(false)
        setSelectecItems([])
    }

    const repeatSelected = () => {
        // const repeatCountByLemma = {}
        // list.forEach(item => {
        //     if (item) {
        //         if (!item?.repeatCount) {
        //             repeatCountByLemma[item?.name] = 0
        //         } else {
        //             repeatCountByLemma[item?.name] = item?.repeatCount
        //         }
        //     }
        // })
        const repeatCountsByLemma = {}
        list.forEach(item => {
            repeatCountsByLemma[item.lemma] = item.repeatCount || 0
        })
        const words = selectedItems.map(lemma => ({ lemma, repeatCount: repeatCountsByLemma[lemma] + 1, repeatTime: Date.now() }))
        postUserWords('/self_words', words)
        setEditing(false)
        setSelectecItems([])
    }

    const learnSelected = () => {
        const words = selectedItems.map(lemma => ({ lemma, repeatCount: 7, repeatTime: Date.now() }))
        postUserWords('/self_words', words)
        setEditing(false)
        setSelectecItems([])
    }

    const unlearnSelected = () => {
        const words = selectedItems.map(lemma => ({ lemma, repeatCount: 0, repeatTime: Date.now() }))
        postUserWords('/self_words', words)
        setEditing(false)
        setSelectecItems([])
    }

    return (
        <div className="TagList">
            <div className='flex justify-between py-4'>
                <h2 className=''>{LEARN_STATE_NAMES[name]}</h2>
                {list && !!list?.length &&
                    <div className='TagListButtons'>
                        {isEditing ? <>
                            <span className='pl-2 text-xs'>Selected: <code>{selectedItems.length}</code></span>
                            <button onClick={() => (setEditing(!isEditing), setSelectecItems([]))}><i className="fas fa-times pl-1"></i></button>
                            {name === 'repeating' &&
                                <button onClick={repeatSelected}><i className="fa fa-check pl-1"></i></button>
                            }
                            {name === 'repeating' &&
                                <button onClick={learnSelected}><i className="fa fa-check-double pl-1"></i></button>
                            }
                            {name === 'learning' &&
                                <button onClick={unlearnSelected}><i className="fas fa-circle-left pl-1"></i></button>
                            }
                            {name === 'learning' &&
                                <button onClick={learnSelected}><i className="fa fa-check pl-1"></i></button>
                            }
                            {name === 'learned' &&
                                <button onClick={unlearnSelected}><i className="fas fa-circle-left pl-1"></i></button>
                            }
                        </> :
                            <>
                                <button onClick={() => setEditing(!isEditing)}><i className="fas fa-pen pl-1"></i></button>
                                <button onClick={() => { }}><i className="fa fa-layer-group pl-1"></i></button>
                                {name === 'learning' &&
                                    <Link to={"/quiz/" + name.toLowerCase()}><i className="fa fa-play pl-1"></i></Link>
                                }
                                {name === 'repeating' &&
                                    <Link to={"/quiz/" + name.toLowerCase()}><i className="fa fa-play pl-1"></i></Link>
                                }
                            </>
                        }
                    </div>
                }
            </div>
            <ul className="TagListItems p-2">
                {list.map(item => {
                    return (
                        <button
                            key={item.lemma}
                            onClick={() => (isEditing && handleTagClick(item.lemma))}
                            className={classNames("TagItem text-gray-50", { "selected": selectedItems.includes(item.lemma) })}
                        >{item.lemma}</button>
                    )
                })}
                {!list.length && <h4 className="py-2">No Item/Words</h4>}
            </ul>
        </div>
    )
}

export function useRequestUserWordLists(cancelRequest) {
    const dispatch = useDispatch();
    const { repeatingList, learningList, learnedList } = useSelector((state) => sortByLearningState(state.user.user?.words))

    const getUserWords = async () => {
        try {
            const userProps = await api().get('/get-user?allProps=1')
            console.log('userProps', userProps)
            dispatch(updateUser(userProps?.data))
        } catch (err) {
            if (err.message === "Request failed with status code 403") {
                localStorage.removeItem('token');
                redirect('/')
            }
            console.log('err', err)
        }
    }

    useEffect(() => {
        if (!cancelRequest) {
            getUserWords()
        }
    }, [])

    return { learnedList, learningList, repeatingList }
}


export default MyList;
