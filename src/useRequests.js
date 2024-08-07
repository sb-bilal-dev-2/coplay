import { useReducer, useEffect } from 'react';
import api from './api';
import { createSlice } from '@reduxjs/toolkit'

const initialState = {
    loading: false,
    items: null,
    error: null,
};

const dataReducer = (uri) => (state, action) => {
    switch (action?.type) {
        case `${uri}_GET_REQUEST`:
            return { ...state, [uri + 'GET_REQUESTloading']: true, loading: true, [uri + 'GET_REQUESTerror']: null };
        case `${uri}_PUT_REQUEST`:
            return { ...state, [uri + 'PUT_REQUESTloading']: true, loading: true, [uri + 'PUT_REQUESTerror']: null };
        case `${uri}_DELETE_REQUEST`:
            return { ...state, [uri + 'DELETE_REQUESTloading']: true, loading: true, [uri + 'DELETE_REQUESTerror']: null };
        case `${uri}_GET_FAIL`:
            return { ...state, [uri + 'GET_REQUESTloading']: false, loading: false, [uri + 'GET_REQUESTerror']: action.payload };
        case `${uri}_PUT_FAIL`:
            return { ...state, [uri + 'PUT_REQUESTloading']: false, loading: false, [uri + 'PUT_REQUESTerror']: action.payload };
        case `${uri}_DELETE_FAIL`:
            return { ...state, [uri + 'DELETE_REQUESTloading']: false, loading: false, [uri + 'DELETE_REQUESTerror']: action.payload };
        case `${uri}_GET_SUCCESS`:
            return { ...state, [uri + 'GET_REQUESTloading']: false, loading: false, items: action.payload?.data?.results, [uri + 'GET_REQUESTerror']: null };
        case `${uri}_PUT_SUCCESS`:
            const newItems =
               Array.isArray(action.payload.data) ? action.payload.data : [action.payload.data]
            const items = state.items.filter(item => !newItems.find(ii => ii._id === item._id));

            return { ...state, [uri + 'PUT_REQUESTloading']: false, loading: false, items: newItems.concat(items), [uri + 'PUT_REQUESTerror']: null };
        case `${uri}_DELETE_SUCCESS`:
            return { ...state, [uri + 'DELETE_REQUESTloading']: false, loading: false, items: state.items.filter(ii => ii._id !== action.payload.data._id), [uri + 'DELETE_REQUESTerror']: null };
        default:
            return state;
    }
};

/**
 * @returns 
 * {
 *      items,
        putItem,
        getItems,
        deleteItem,
        requestLoading,
        requestError,
    }
 */
// export const dynamicReducers = {

// }
// export const dynamicActions = {}
// init_useRequests_2('wordCollections')
// function init_useRequests_2(uri) {
//     const dynamicSlice = createSlice({
//         name: uri,
//         initialState,
//         reducers: {
//             // 'update' + uri.charAt(0).toUpperCase() + uri.slice(1)
//             ['get_movies']: async (state, action) => {
//                 // const response = await api('/movies').get(url, data)
//                 state.items = action.payload
//             },
            
//         },
//     })

//     dynamicReducers[uri] = dynamicSlice.reducer
// }

// const useRequests_2 = (uri) => {

// }

const reducers = {}

const useRequests = (uri) => {
    const reducer = reducers[uri] = dataReducer(uri);
    const [getItemsState, dispatchGet] = useReducer(reducer, initialState);
    // const itemsState = useSelector((state) => state[uri].items)
    const request = async (method, url, data = null) => {
        try {
            dispatchGet({ type: `${uri}_${method}_REQUEST` });
            const response = await api()[method.toLowerCase()](url, data);
            dispatchGet({ type: `${uri}_${method}_SUCCESS`, payload: response });
        } catch (error) {
            console.log(uri + 'error', error)
            console.log('error?.request?.data', error?.response?.data)
            const errorMessage = error?.response?.data || error.message 
            dispatchGet({ type: `${uri}_${method}_FAIL`, payload: errorMessage });
        }
    };

    const getItems = async () => {
        await request("GET", `/${uri}`);
    };

    const putItems = async (data, callback) => {
        if (!Array.isArray(data)) {
            data = [data]
        }
        console.log('data', data)
        await request("PUT", `/${uri}`, data);
        if (callback) {
            callback()
        }
    };

    const deleteItem = async (id) => { // completely deletes from database
        await request("DELETE", `/${uri}/${id}`);
    };

    useEffect(() => {
        getItems(); // Fetch initial data
    }, [uri]); // Re-fetch data when URI changes

    // useEffect(() => {
    //     const [items, setItems] = useState([])
    // })
    if (uri === 'movies') {
        console.log('getItemsState.items', getItemsState.items)
    }
    return {
        items: getItemsState.items,
        requestLoading: getItemsState.loading,
        getItemsState,
        requestError: [getItemsState.error, getItemsState[uri + 'GET_REQUESTerror'], getItemsState[uri + 'POST_REQUESTerror'], getItemsState[uri + 'PUT_REQUESTerror'], getItemsState[uri + 'DELETE_REQUESTerror']].filter((it) => it).join('///'),
        getItems,
        deleteItem,
        putItems,
    };
};

export default useRequests;
