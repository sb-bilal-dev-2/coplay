import { useEffect } from "react";
import api from "../api";
import { useDispatch, useSelector } from "react-redux";
import { updateUser } from "../store";
import { redirect } from "react-router";
import { sortByLearningState } from "./sortByLearningState";

export function useRequestUserWordLists(cancelRequest) {
  const dispatch = useDispatch();
  const { repeatingList, learningList, learnedList } = useSelector((state) =>
    sortByLearningState(state.user.user?.words)
  );

  const getUserWords = async () => {
    if (localStorage.getItem('token')) {
      try {
        const userProps = await api().get("/get-user?allProps=1");
        console.log("userProps", userProps);
        dispatch(updateUser(userProps?.data));
      } catch (err) {
        if (err.message === "Request failed with status code 403") {
          localStorage.removeItem("token");
          redirect("/");
        }
        console.log("err", err);
      }  
    }
  };

  useEffect(() => {
    if (!cancelRequest) {
      getUserWords();
    }
  }, []);

  return { learnedList, learningList, repeatingList, getUserWords };
}
