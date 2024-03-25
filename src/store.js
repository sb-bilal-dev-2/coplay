import { configureStore } from '@reduxjs/toolkit'
import { createSlice } from '@reduxjs/toolkit'

const initialState = {
    count: 0,
    user: null,
}

export const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        updateUser: (state, action) => {
            state.user = action.payload
        },
        updateGivenUserValues: (state, action) => {
            Object.keys(action.payload).forEach((key) => {
                state.user[key] = action.payload[key]
            })
        }
    },
})

// Action creators are generated for each case reducer function
export const { updateUser, updateGivenUserValues } = userSlice.actions

export const store = configureStore({
    reducer: {
        user: userSlice.reducer,
    },
})

