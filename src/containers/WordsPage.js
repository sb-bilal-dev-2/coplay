import React, { useState, useEffect } from "react";
import { useRequestUserWordLists } from "../helper/useUserWords";
import { useParams,  useLocation } from "react-router-dom";
import StickyHeader from "../components/StickyHeader";
import api from "../api";
import AdvancedSwipe from "../components/AdvancedSwipe";


//TODO: Wordscollection route crashes
const useRequestWordCollectionWordList = (listName) => {
  const location = useLocation();
  const [wordCollection, set_wordCollection] = useState();
  const requestWordCollection = async () => {
    const response = await api().get(`/wordLists?forTitle=${listName}`);

    set_wordCollection(response?.data?.results[0]?.list);
  };

  useEffect(() => {
    requestWordCollection();
  }, [location.pathname]);

  return wordCollection;
};

const WordsPage = () => {
  const listsMap = useRequestUserWordLists();
  const { list: listName } = useParams();
  const location = useLocation();
  const isWordCollectionPage =
    location.pathname.split("/")[1] === "wordCollection";
  const wordCollectionWordList = useRequestWordCollectionWordList(listName);
  console.log("wordCollectionWordList", wordCollectionWordList);

  const handleSwipeBottom = () => {};
  const handleSwipeTop = () => {};
  const handleSwipeLeft = async (lemma) => {
    const newWord = { lemma, repeatCount: 7, repeatTime: Date.now() };
    await api().post("/self_words", [newWord]);
  };
  const handleSwipeRight = async (lemma) => {
    const newWord = { lemma, repeatCount: 0, repeatTime: Date.now() };
    await api().post("/self_words", [newWord]);
  };

  return (
    <div className="flex items-center justify-center flex-col bg-gray-900 h-screen">
      <StickyHeader />
      <AdvancedSwipe
        list={
          isWordCollectionPage
            ? wordCollectionWordList
            : listsMap[listName + "List"]
        }
        header
        title={isWordCollectionPage ? "Word collection" : "My words"}
        onSwipeBottom={handleSwipeBottom}
        onSwipeTop={handleSwipeTop}
        onSwipeLeft={handleSwipeLeft}
        onSwipeRight={handleSwipeRight}
      />
    </div>
  );

};

export default WordsPage;
