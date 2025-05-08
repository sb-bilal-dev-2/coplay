const HOUR = 1000 * 60 * 60;
const WEEK = HOUR * 24 * 7;

const REPEAT_COUNT_TO_POSTPONE_TIME_DIFFERENCE = {
  1: HOUR,
  2: HOUR * 2,
  3: HOUR * 3,
  4: HOUR * 4,
  5: HOUR * 24,
  6: WEEK,
  7: WEEK * 2,
  maxRepeat: 7, 
};

const sortByLearningState = (items = [], repeatCountToPostponeTimeDifference = REPEAT_COUNT_TO_POSTPONE_TIME_DIFFERENCE) => {
  const repeatingList = [];
  const learningList = [];
  const learnedList = [];

  items?.forEach((item) => {
    const repeatCount = item.repeatCount || 0;
    const REPEAT_POSTPONE_TIME_DIFFERENCE =
      repeatCountToPostponeTimeDifference[repeatCount] || Infinity;
    const currentTime = Date.now();
    // console.log("currentTime", currentTime, item.repeatTime);
    const repeatTime = item.repeatTime || currentTime;
    const timeDifference = currentTime - repeatTime;
    // console.log("timeDifference", timeDifference);
    if (repeatCount < repeatCountToPostponeTimeDifference.maxRepeat) {
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

module.exports = {
    REPEAT_COUNT_TO_POSTPONE_TIME_DIFFERENCE,
    sortByLearningState,
}
