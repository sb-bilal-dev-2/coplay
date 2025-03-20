import { useState } from 'react';
import api from '../api';


export function usePost(handlePostResponse = () => { }, onerror) {
    const [data, set_data] = useState();
    const [error, set_error] = useState();
    const [isLoading, set_isLoading] = useState();

    async function post(...args) {
        set_isLoading(true);
        try {
            const new_data = (await api().post(...args));
            handlePostResponse(new_data);
            set_data(new_data);
            return new_data;
        } catch (error) {
            set_error(error);
            if (onerror) onerror(error)
        }
        set_isLoading(false);
    }

    return [
        post,
        error,
        isLoading,
        data,
    ];
}
