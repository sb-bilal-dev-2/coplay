import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { useDispatch, useSelector } from 'react-redux';

import api from './api';
import { useEffect } from 'react';

const createDynamicSlice = (uri) => {
  const initialState = {
    loading: false,
    items: [],
    error: null,
  };

  const getItems = createAsyncThunk(
    `${uri}/getItems`,
    async (query) => {
      console.log('Get items', uri)
      let params = ''
      if (query) {
        console.log('Get query', query)
        // params = '?' + new URLSearchParams(query)
      }
      const response = await api().get(`/${uri}` + params);
      return response.data;
    }
  );

  const putItems = createAsyncThunk(
    `${uri}/putItems`,
    async (data) => {
      const response = await api().put(`/${uri}`, Array.isArray(data) ? data : [data]);
      return response.data;
    }
  );

  const deleteItem = createAsyncThunk(
    `${uri}/deleteItem`,
    async (id) => {
      const response = await api().delete(`/${uri}/${id}`);
      return response.data;
    }
  );

  const slice = createSlice({
    name: uri,
    initialState,
    reducers: {},
    extraReducers: (builder) => {
      builder
        .addCase(getItems.pending, (state) => {
          state.loading = true;
          state.error = null;
        })
        .addCase(getItems.fulfilled, (state, action) => {
          state.loading = false;
          state.items = action.payload.results;
        })
        .addCase(getItems.rejected, (state, action) => {
          state.loading = false;
          state.error = action.error.message;
        })
        .addCase(putItems.pending, (state) => {
          state.loading = true;
          state.error = null;
        })
        .addCase(putItems.fulfilled, (state, action) => {
          state.loading = false;
          const newItems = Array.isArray(action.payload) ? action.payload : [action.payload];
          state.items = newItems.concat(state.items.filter(item => !newItems.find(newItem => newItem._id === item._id)));
        })
        .addCase(putItems.rejected, (state, action) => {
          state.loading = false;
          state.error = action.error.message;
        })
        .addCase(deleteItem.pending, (state) => {
          state.loading = true;
          state.error = null;
        })
        .addCase(deleteItem.fulfilled, (state, action) => {
          state.loading = false;
          state.items = state.items.filter(item => item._id !== action.payload._id);
        })
        .addCase(deleteItem.rejected, (state, action) => {
          state.loading = false;
          state.error = action.error.message;
        });
    },
  });

  return {
    reducer: slice.reducer,
    actions: {
      getItems,
      putItems,
      deleteItem,
    },
  };
};

export const dynamicReducers = {};
export const dynamicReducerActions = {}

export function initDynamicSlice(uri) {
  const { reducer, actions } = createDynamicSlice(uri);
  dynamicReducers[uri] = reducer;
  dynamicReducerActions[uri] = actions;
}

// Initialize slices
initDynamicSlice('wordCollections');
initDynamicSlice('movies');

export const useDynamicReducer = (uri) => {
  const dispatch = useDispatch();
  const { items, loading, error } = useSelector(state => state[uri]);
  const { getItems, putItems, deleteItem } = dynamicReducerActions[uri];

  useEffect(() => {
    if (!items.length) {
      dispatch(getItems());
    }
  }, [dispatch]);

  return {
    items,
    loading,
    error,
    getItems: (query) => dispatch(getItems(query)),
    putItems: (data) => dispatch(putItems(data)),
    deleteItem: (id) => dispatch(deleteItem(id))
  }
}