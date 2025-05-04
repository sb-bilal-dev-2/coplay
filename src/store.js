import { configureStore } from '@reduxjs/toolkit'
import { createSlice } from '@reduxjs/toolkit'
import { dynamicReducers } from './dynamicReducer'

const user_store = {
    count: 0,
    user: null,
}

const wordInfo_store = {
    selected_text: '',
    selectedWordInfo: {},
}

const language_store = {
    reload: null,
    learningLanguage: localStorage.getItem('learningLanguage'),
    mainLanguage: localStorage.getItem('mainLangauge')
}
export const language_slice = createSlice({
    name: 'language',
    initialState: language_store,
    reducers: {
        set_learningLangauge: (state, action) => {
            state.learningLanguage = action.payload
        },
        set_mainLanguage: (state, action) => {
            state.mainLanguage = action.payload
        },
        set_reload: (state, action) => {
            state.reload = action.payload
        }
    },
})
export const { set_learningLangauge, set_mainLanguage, set_reload } = language_slice.actions

export const user_slice = createSlice({
    name: 'user',
    initialState: user_store,
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
export const { updateUser, updateGivenUserValues } = user_slice.actions

export const wordInfo_slice = createSlice({
    name: 'wordInfo',
    initialState: wordInfo_store,
    reducers: {
        selectText: (state, action) => {
            state.selected_text = action.payload
        },
        selectedWordInfo: (state, action) => {
            state.selectedWordInfo = action.payload
        },
    },
})
export const { selectText, selectedWordInfo } = wordInfo_slice.actions

export const store = configureStore({
    reducer: {
        user: user_slice.reducer,
        wordInfo: wordInfo_slice.reducer,
        ...dynamicReducers,
        // ...dynamicReducers
    },
})

