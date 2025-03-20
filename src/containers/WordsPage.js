import React, { useState, useEffect } from "react";
import { useRequestUserWordLists } from "../helper/useUserWords";
import { useParams,  useLocation } from "react-router-dom";
import StickyHeader from "../components/StickyHeader";
import api from "../api";
import AdvancedSwipe from "../components/AdvancedSwipe";

const useRequestWordCollectionWordList = (listName) => {
  const location = useLocation();
  const [wordCollection, set_wordCollection] = useState();
  const requestWordCollection = async () => {
    const response = await api().get(`/wordCollections?title=${listName}`);

    set_wordCollection(response?.results[0]?.keywords?.map(item => item.the_word));
  };

  useEffect(() => {
    requestWordCollection();
  }, [location.pathname]);
  console.log('wordCollection', wordCollection)
  return wordCollection;
};

const WordsPage = () => {
  const listsMap = useRequestUserWordLists();
  const { list: listName } = useParams();
  console.log("listName", listName)
  const location = useLocation();
  const isWordCollectionPage =
    location.pathname.split("/")[1] === "wordCollection";
  const wordCollectionWordList = useRequestWordCollectionWordList(listName);
  console.log("wordCollectionWordList", wordCollectionWordList);

  const handleSwipeBottom = () => {};
  const handleSwipeTop = () => {};
  const handleSwipeLeft = async (the_word) => {
    const newWord = { the_word, repeatCount: 7, repeatTime: Date.now() };
    await api().post("/self_words", [newWord]);
  };
  const handleSwipeRight = async (the_word) => {
    const newWord = { the_word, repeatCount: 0, repeatTime: Date.now() };
    await api().post("/self_words", [newWord]);
  };
  const reversedList = (isWordCollectionPage
    ? wordCollectionWordList?.reverse() || []
    : listsMap[listName + "List"]?.reverse())
    console.log('reversedList', reversedList)
  return (
    <div className="flex items-center justify-center flex-col bg-gray-900 h-screen">
      <StickyHeader />
      <AdvancedSwipe
        list={reversedList}
        header
        title={isWordCollectionPage ? listName : "My words"}
        onSwipeBottom={handleSwipeBottom}
        onSwipeTop={handleSwipeTop}
        onSwipeLeft={handleSwipeLeft}
        onSwipeRight={handleSwipeRight}
      />
    </div>
  );

};

export default WordsPage;
