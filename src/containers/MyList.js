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


const MyList = () => {
    const { learningList, learnedList } = useRequestUserWordLists()

    return (
        <>
            <StickyHeader />
            <div className='section MyListMain bg-secondary text-gray-100'>
                <div className="p-4">
                    <RenderTagList list={learningList} name="Learning" />
                    <RenderTagList list={learnedList} name="Learned" />
                </div>
            </div>
            <Footer />
        </>
    )
}

function RenderTagList({ list = ['', '', '', '', '', '', ''], name }) {
    const dispatch = useDispatch()
    const [isEditing, setEditing] = useState(false)
    const [selectedItems, setSelectecItems] = useState([])
    const [postUserWords, postUserWordsError, postUserWordsLoading] = usePost((data) => dispatch(updateGivenUserValues(data)))
    const handleTagClick = (item) => {
        if (selectedItems.includes(item)) {
            setSelectecItems(selectedItems.filter((crt) => item !== crt))
        } else {
            setSelectecItems([...selectedItems, item])
        }
    }

    const learnFullList = () => {
        const words = list.map(item => ({ lemma: item.lemma, learned: false }))
        postUserWords('/self_words', words)
    }

    const learnSelected = () => {
        const words = selectedItems.map(item => ({ lemma: item, learned: false }))
        postUserWords('/self_words', words)
    }

    const learnedSelected = () => {
        const words = selectedItems.map(item => ({ lemma: item, learned: true }))
        postUserWords('/self_words', words)
    }

    return (
        <div className="TagList">
            <div className='flex justify-between py-4'>
                <h2 className=''>{name}</h2>
                <div className='TagListButtons'>
                    {isEditing ? <>
                        <span className='pl-2 text-xs'>Selected: <code>{selectedItems.length}</code></span>  
                        <button onClick={() => (setEditing(!isEditing), setSelectecItems([]))}><i className="fas fa-times pl-1"></i></button>
                        {name === 'Learned' ?
                            <button onClick={learnSelected}><i className="fas fa-circle-left pl-1"></i></button>
                        :
                            <button onClick={learnedSelected}><i className="fa fa-check pl-1"></i></button>
                        }
                    </> :
                    <>
                        <button onClick={() => setEditing(!isEditing)}><i className="fas fa-pen pl-1"></i></button>
                        <button onClick={() => {}}><i className="fa fa-layer-group pl-1"></i></button>
                        {name !== 'Learned' &&
                            <Link to={"/quiz/" + name.toLowerCase()}><i className="fa fa-hat-wizard pl-1"></i></Link>
                        }
                    </>
                    }
                </div>
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
            </ul>
        </div>
    )
}

function usePost(handlePostResponse = () => {}) {
    const [data, set_data] = useState()
    const [error, set_error] = useState()
    const [isLoading, set_isLoading] = useState()

    async function post(...args) {
        set_isLoading(true)
        try {
            const new_data = (await api().post(...args)).data
            handlePostResponse(new_data)
            set_data(new_data)
            return new_data
        } catch(error) {
            set_error(error)
        }
        set_isLoading(false)
    }

    return [
        post,
        error,
        isLoading,
        data,
    ]
}

export function useRequestUserWordLists(cancelRequest) {
    const dispatch = useDispatch();
    const learningList = useSelector((state) => state.user.user?.words?.filter(item => !item.learned))
    const learnedList = useSelector((state) => state.user.user?.words?.filter(item => item.learned))

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

    return { learnedList, learningList }
}


export default MyList;
