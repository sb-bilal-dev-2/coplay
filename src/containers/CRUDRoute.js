import React, { useRef, useState } from 'react'
import useRequests from '../useRequests';
import { useParams } from 'react-router';

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

    return (
        <div className='p-4'>
            <p className='text-red-500'>{requestError}</p>
            <form className='pb-2'>
                <input onChange={(ev) => setSearch(ev.target.value)} placeholder='Search' />
            </form>
            <form>
                <textarea placeholder='New Item JSON' ref={newItemTextarea} />
                <button onClick={() => putItems(newItemTextarea?.current?.value && JSON.parse(newItemTextarea?.current?.value))} type="submit" disabled={requestLoading}><b>POST</b></button>
            </form>
            {filteredItems?.map((item) => {
                if (item._id === editingItem) {
                    return (
                        <form key={item._id} onSubmit={(ev) => { ev.preventDefault(); putItems(JSON.parse(editingItemRef?.current?.value))}}>
                            <textarea ref={editingItemRef} defaultValue={JSON.stringify(item, undefined, 2)} />
                            <div>
                                <button
                                    onClick={() => {
                                        setEditingItem('');
                                        editingItemRef.current = null;
                                    }}
                                    disabled={requestLoading}
                                ><code>CANCEL</code></button><br />
                                <button onClick={() => deleteItem(item._id)} disabled={requestLoading}><code>DELETE</code></button><br />
                                <button type='submit' disabled={requestLoading}><b>SUBMIT</b></button><br />
                            </div>
                        </form>
                    )
                }
                return (
                    <><div key={item._id} onClick={() => setEditingItem(item._id)}>{JSON.stringify(item, undefined, 2)}</div><hr /></>
                )
            })}
        </div>
    )
}

export default CRUDRoute;

