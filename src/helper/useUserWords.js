import { useEffect } from "react";
import api from "../api";
import { useDispatch, useSelector } from "react-redux";
import { updateUser } from "../store";
import { redirect } from "react-router";
import { sortByLearningState } from "./sortByLearningState";

export const fetchUserData = async () => {
  if (localStorage.getItem('token')) {
    try {
      const userResponse = await api().get("/get-user?allProps=1");

      return userResponse
    } catch (err) {
      if (err.message === "Request failed with status code 403") {
        localStorage.removeItem("token");
        redirect("/");
      }
      console.log("err", err);
    }  
  }
};

export function useRequestUserWordLists(cancelRequest) {
  const { repeatingList, learningList, learnedList } = useSelector((state) =>
    sortByLearningState(state.user.user
      && (state.user.user["words_" + localStorage.getItem("learningLanguage")] || state.user.user.words || [])
    )
  );

  const dispatch = useDispatch();
  const updateUserData = async () => {
    if (localStorage.getItem('token')) {
        dispatch(updateUser(fetchUserData()));
    }
  };

  useEffect(() => {
    if (!cancelRequest) {
      updateUserData();
    }
  }, []);

  return { learnedList, learningList, repeatingList, updateUserData };
}
