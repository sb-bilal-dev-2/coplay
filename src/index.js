import React from "react";
import ReactDOM from "react-dom/client";
import { GoogleOAuthProvider } from "@react-oauth/google";
import "./index.css";
// import MoviePage from "./containers/MoviePage";
import MoviePage from "./containers/MoviePage/MoviePage";
import reportWebVitals from "./reportWebVitals";
import {
  createHashRouter,
  createRoutesFromElements,
  Route,
  redirect,
  RouterProvider,
} from "react-router-dom";
import { store } from "./store";
import { Provider } from "react-redux";
import { I18nextProvider } from "react-i18next";
import i18n from "./i18n";

import WordsPage from "./containers/WordsPage";
import HomePage from "./HomePage";
import Authentication from "./containers/Authentication";
import CRUDRoute from "./containers/CRUDRoute";
import Account from "./containers/Account";
import MyList from "./containers/MyList";
import Quiz from "./containers/Quiz";
import ErrorBoundary from "./containers/ErrorBoundary";
import NotFound from "./containers/NotFound";
import PricePage from "./containers/PricePage";
import useAuthentication from "./containers/Authentication.util";
import api from "./api";
import { ShortVideo } from "./containers/ShortVideo";

const root = ReactDOM.createRoot(document.getElementById("root"));

const router = createHashRouter(
  createRoutesFromElements(
    <>
      <Route exact path="/" element={<HomePage />} />
      <Route
        exact
        path="/account"
        element={<Account />}
        loader={authenticatedRoute}
      />
      <Route
        exact
        path="/single"
        element={<div style={{ width: '100vw', height: 400 }}>
          <ShortVideo isActive mediaTitle="frozen_2" forcedCurrentTimeChange={1500} hideSubtitles />
          <video width={300} autoPlay controls height={200}><source src="https://api.coplay.live/api/movieFiles/frozen.480.mp4" type="video/mp4" /></video>
        </div>}
      />
      <Route
        exact
        path="my_list"
        element={<MyList />}
        loader={authenticatedRoute}
      />
      <Route
        path="words/:list"
        element={<WordsPage />}
        loader={authenticatedRoute}
      />
      <Route
        path="wordCollection/:list"
        element={<WordsPage />}
        loader={authenticatedRoute}
      />
      <Route path="movie/:title" element={<MoviePage />} />
      <Route path="auth/:screen" element={<Authentication />} />
      <Route path="crud/:model" element={<CRUDRoute />} loader={authenticatedRoute_moderator} />
      <Route
        path="quiz/:list/:word"
        element={<Quiz />}
        loader={authenticatedRoute}
      />
      <Route path="quiz/:list" element={<Quiz />} loader={authenticatedRoute} />
      {/* TODO: Return if project have payment system */}
      {/* <Route
        path="price_page"
        element={<PricePage />}
        loader={authenticatedRoute}
      /> */}
      <Route path="*" element={<NotFound />} />
    </>
  )
);

root.render(
  <ErrorBoundary>
    <I18nextProvider i18n={i18n}>
      <GoogleOAuthProvider clientId="198137546875-ivuds0gm94nojrpdrbcsiqbmm3j0co6i.apps.googleusercontent.com">
        <Provider store={store}>
          <RouterProvider router={router} />
        </Provider>
      </GoogleOAuthProvider>
    </I18nextProvider>
  </ErrorBoundary>
);

function authenticatedRoute() {
  const token = localStorage.getItem("token");

  if (!token) {
    return redirect("/auth/login");
  }

  return null;
}

async function authenticatedRoute_moderator() {
  const MODERATOR_EMAIL_LIST = { "saidbilol18@gmail.com": true, "nilufar4703@gmail.com": true, "00bilal.io@gmail.com": true }
  const token = localStorage.getItem("token");
  
  if (token) {
    const response = await api().get(`/get-user`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!MODERATOR_EMAIL_LIST[response?.email]) {
      return redirect("/")
    }
  } else {
    return redirect("/");
  }

  return null;
}

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
