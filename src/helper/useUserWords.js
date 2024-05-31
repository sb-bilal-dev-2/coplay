import { useEffect } from "react";
import api from "../api";
import { useDispatch, useSelector } from "react-redux";
import { updateUser } from "../store";
import { redirect } from "react-router";

const HOUR = 1000 * 60 * 60;
const WEEK = HOUR * 24 * 7;

export const REPEAT_COUNT_TO_POSTPONE_TIME_DIFFERENCE = {
  1: HOUR,
  2: HOUR * 2,
  3: HOUR * 3,
  4: HOUR * 4,
  5: HOUR * 24,
  6: WEEK,
  7: WEEK * 2,
};

export const sortByLearningState = (items = []) => {
  const repeatingList = [];
  const learningList = [];
  const learnedList = [];

  items.forEach((item) => {
    const repeatCount = item.repeatCount || 0;
    const REPEAT_POSTPONE_TIME_DIFFERENCE =
      REPEAT_COUNT_TO_POSTPONE_TIME_DIFFERENCE[repeatCount] || Infinity;
    const currentTime = Date.now();
    console.log("currentTime", currentTime, item.repeatTime);
    const repeatTime = item.repeatTime || currentTime;
    const timeDifference = currentTime - repeatTime;
    console.log("timeDifference", timeDifference);
    if (repeatCount < 7) {
      if (
        !item.repeatCount ||
        timeDifference > REPEAT_POSTPONE_TIME_DIFFERENCE
      ) {
        repeatingList.push(item);
      } else {
        learningList.push(item);
      }
    } else {
      learnedList.push(item);
    }
  });

  return {
    repeatingList,
    learningList,
    learnedList,
  };
};

export function useRequestUserWordLists(cancelRequest) {
  const dispatch = useDispatch();
  const { repeatingList, learningList, learnedList } = useSelector((state) =>
    sortByLearningState(state.user.user?.words)
  );

  const getUserWords = async () => {
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
  };

  useEffect(() => {
    if (!cancelRequest) {
      getUserWords();
    }
  }, []);

  return { learnedList, learningList, repeatingList };
}
