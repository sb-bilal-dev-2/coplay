import React from "react";
import ReactDOM from "react-dom/client";
import { GoogleOAuthProvider } from "@react-oauth/google";
import "./index.css";
import MoviePage from "./containers/MoviePage";
import reportWebVitals from "./reportWebVitals";
import {
  createHashRouter,
  createBrowserRouter,
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
      <Route path="crud/:model" element={<CRUDRoute />} />
      <Route
        path="quiz/:list/:word"
        element={<Quiz />}
        loader={authenticatedRoute}
      />
      <Route path="quiz/:list" element={<Quiz />} loader={authenticatedRoute} />
      <Route
        path="price_page"
        element={<PricePage />}
        loader={authenticatedRoute}
      />
      <Route path="*" element={<NotFound />} />
    </>
  )
);

root.render(
  <ErrorBoundary>
    <I18nextProvider i18n={i18n}>
      <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}>
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

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
