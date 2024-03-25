import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import MoviePage from './containers/MoviePage';
import reportWebVitals from './reportWebVitals';
import {
  createBrowserRouter,
  createRoutesFromElements,
  Routes,
  Route,
  redirect,
  RouterProvider,
} from "react-router-dom";
import { store } from './store'
import { Provider } from 'react-redux'

import WordsPage from './WordsPage';
import HomePage from './HomePage';
import Authentication from './containers/Authentication';
import CRUDRoute from './containers/CRUDRoute';
import Account from './containers/Account';
import MyList from './containers/MyList';
import Quiz from './containers/Quiz';

const root = ReactDOM.createRoot(document.getElementById('root'));

const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route exact path="/" element={<HomePage />} />
      <Route exact path="my_account" element={<Account />} />
      <Route exact path="my_list" element={<MyList />} loader={authenticatedRoute} />
      <Route path="words" element={<WordsPage />} />
      <Route path="movie/:title" element={<MoviePage />}/>
      <Route path='auth/:screen' element={<Authentication />} />
      <Route path='crud/:model' element={<CRUDRoute />} />
      <Route path='quiz/:title' element={<Quiz />} />
    </>
  )
)


root.render(
  // <React.StrictMode>
  <Provider store={store}>
    <RouterProvider router={router} />
  </Provider>
  // </React.StrictMode>
);

function authenticatedRoute() {
  const token = localStorage.getItem('token')
  if (!token) {
    return redirect('/')
  }

  return null;
}

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
