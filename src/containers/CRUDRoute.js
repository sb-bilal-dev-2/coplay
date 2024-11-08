import React, { useRef, useState } from 'react'
import useRequests from '../useRequests';
import { useParams } from 'react-router';
import api from '../api';

const CRUDRoute = () => {
    const { model } = useParams()
    const [search, setSearch] = useState();
    const newItemTextarea = useRef()
    const [editingItem, setEditingItem] = useState('');
    const editingItemRef = useRef()

    const {
        items,
        putItems,
        deleteItem,
        requestLoading,
        requestError,
    } = useRequests(model)

    let filteredItems = items;

    if (search) {
        filteredItems = items?.filter((item) => {
            const valueMatch = Object.entries(item).find(([_, value]) => {
                return JSON.stringify(value).includes(search)
            })
            return valueMatch
        })
    }

    const handleSubmitEdit = (ev) => {
        ev.preventDefault();
        putItems(JSON.parse(editingItemRef?.current?.value), () => setEditingItem(''))
    }

    const handleYoutubeUrl = async (input) => {
        const youtubeVideoId = (input)
        const videoInfo = await api('/youtube_video/' + youtubeVideoId)
        return videoInfo
    }

    const handlePutNewItem = () => {
        const input = newItemTextarea?.current?.value
        const isYoutubeUrl = isValidUrl(input) && input.contains('https://www.youtube.com') || input.contains('https://youtu.be') // https://www.youtube.com/watch?v=2Vv-BfVoq4g
        const newItemJson = isYoutubeUrl ? handleYoutubeUrl(input) : input.length && JSON.parse(newItemTextarea?.current?.value)
        putItems(newItemJson, () => setEditingItem(''))
    }

    return (
        <div className='p-4'>
            <p className='text-red-500'>{requestError}</p>
            <form className='pb-2 float-right'>
                <input className="border-b" onChange={(ev) => setSearch(ev.target.value)} placeholder='Search' />
            </form>
            <form>
                <textarea className="border-b w-80 h-40" placeholder='New Item JSON' ref={newItemTextarea} />
                <button
                    className="p-2"
                    onClick={handlePutNewItem}
                    type="submit"
                    disabled={requestLoading}
                ><b>POST NEW <i className="fa fa-plus"></i></b></button>
            </form>
            {filteredItems?.map((item) => {
                if (item._id === editingItem) {
                    return (
                        <form className="flex" key={item._id} onSubmit={handleSubmitEdit}>
                            <textarea disabled={requestLoading} className="border w-full h-96" ref={editingItemRef} defaultValue={JSON.stringify(item, undefined, 2)} />
                            <div>
                                <button
                                    onClick={() => {
                                        setEditingItem('');
                                        editingItemRef.current = null;
                                    }}
                                    disabled={requestLoading}
                                ><code>CANCEL</code></button><br />
                                <button className="text-red-500" onClick={() => deleteItem(item._id)} disabled={requestLoading}><code>DELETE</code></button><br />
                                <button className="text-green-500" type='submit' disabled={requestLoading}><b>SUBMIT</b></button><br />
                            </div>
                        </form>
                    )
                }
                return (
                    <><div className="border p-2 m-2" key={item._id} onClick={() => setEditingItem(item._id)}>{JSON.stringify(item, undefined, 2)}</div><hr /></>
                )
            })}
        </div>
    )
}

export function isValidUrl(string) {
    let url;

    try {
        url = new URL(string);
    } catch (_) {
        return false;
    }

    return url.protocol === "http:" || url.protocol === "https:";
}

export default CRUDRoute;

