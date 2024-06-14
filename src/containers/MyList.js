import React, { useState } from "react";
import StickyHeader from "../components/StickyHeader";
import Footer from "../components/Footer";
import "./MyList.css";
import classNames from "classnames";
import { useDispatch } from "react-redux";
import { updateGivenUserValues } from "../store";
import { Link, useNavigate } from "react-router-dom";
import { usePost } from "./usePost";
import { useRequestUserWordLists } from "../helper/useUserWords";

const MyList = () => {
  const { learningList, learnedList, repeatingList } =
    useRequestUserWordLists();

  return (
    <>
      <StickyHeader />
      <div className="section MyListMain bg-secondary text-gray-100">
        <div className="p-4">
          <RenderTagList list={repeatingList} name="repeating" />
          <RenderTagList list={learningList} name="learning" />
          <RenderTagList list={learnedList} name="learned" />
        </div>
      </div>
      <Footer />
    </>
  );
};

const LEARN_STATE_NAMES = {
  learning: "Learning Words List",
  learned: "Learned Words List",
  repeating: "Repeating Words List",
};

function RenderTagList({ list = [], name }) {
  const dispatch = useDispatch();
  const navigate = useNavigate()
  const [isEditing, setEditing] = useState(false);
  const [selectedItems, setSelectecItems] = useState([]);
  const [postUserWords] = usePost((data) =>
    dispatch(updateGivenUserValues(data))
  );
  const handleTagClick = (item) => {
    if (selectedItems.includes(item)) {
      setSelectecItems(selectedItems.filter((crt) => item !== crt));
    } else {
      setSelectecItems([...selectedItems, item]);
    }
  };
  console.log("list", list);
  const learnFullList = () => {
    const words = list.map((item) => ({
      lemma: item.lemma,
      repeatCount: 7,
      repeatTime: Date.now(),
    }));
    postUserWords("/self_words", words);
    setEditing(false);
    setSelectecItems([]);
  };

  const repeatSelected = () => {
    // const repeatCountByLemma = {}
    // list.forEach(item => {
    //     if (item) {
    //         if (!item?.repeatCount) {
    //             repeatCountByLemma[item?.name] = 0
    //         } else {
    //             repeatCountByLemma[item?.name] = item?.repeatCount
    //         }
    //     }
    // })
    const repeatCountsByLemma = {};
    list.forEach((item) => {
      repeatCountsByLemma[item.lemma] = item.repeatCount || 0;
    });
    const words = selectedItems.map((lemma) => ({
      lemma,
      repeatCount: repeatCountsByLemma[lemma] + 1,
      repeatTime: Date.now(),
    }));
    postUserWords("/self_words", words);
    setEditing(false);
    setSelectecItems([]);
  };

  const learnSelected = () => {
    const words = selectedItems.map((lemma) => ({
      lemma,
      repeatCount: 7,
      repeatTime: Date.now(),
    }));
    postUserWords("/self_words", words);
    setEditing(false);
    setSelectecItems([]);
  };

  const unlearnSelected = () => {
    const words = selectedItems.map((lemma) => ({
      lemma,
      repeatCount: 0,
      repeatTime: Date.now(),
    }));
    postUserWords("/self_words", words);
    setEditing(false);
    setSelectecItems([]);
  };

  return (
    <div className="TagList">
      <div className="flex justify-between py-4">
        <h2 className="">{LEARN_STATE_NAMES[name]}</h2>
        {list && !!list?.length && (
          <div className="TagListButtons">
            {isEditing ? (
              <>
                <span className="pl-2 text-xs">
                  Selected: <code>{selectedItems.length}</code>
                </span>
                <button
                  onClick={() => (setEditing(!isEditing), setSelectecItems([]))}
                >
                  <i className="fas fa-times pl-1"></i>
                </button>
                {name === "repeating" && (
                  <button onClick={repeatSelected}>
                    <i className="fa fa-check pl-1"></i>
                  </button>
                )}
                {name === "repeating" && (
                  <button onClick={learnSelected}>
                    <i className="fa fa-check-double pl-1"></i>
                  </button>
                )}
                {name === "learning" && (
                  <button onClick={unlearnSelected}>
                    <i className="fas fa-circle-left pl-1"></i>
                  </button>
                )}
                {name === "learning" && (
                  <button onClick={learnSelected}>
                    <i className="fa fa-check pl-1"></i>
                  </button>
                )}
                {name === "learned" && (
                  <button onClick={unlearnSelected}>
                    <i className="fas fa-circle-left pl-1"></i>
                  </button>
                )}
              </>
            ) : (
              <>
                <button onClick={() => setEditing(!isEditing)}>
                  <i className="fas fa-pen pl-1"></i>
                </button>
                <Link to={"/words/" + name?.toLowerCase()}>
                  <i className="fa fa-layer-group pl-1"></i>
                </Link>
                {name !== "learned" && (
                  <Link to={"/quiz/" + name?.toLowerCase()}>
                    <i className="fa fa-play pl-1"></i>
                  </Link>
                )}
              </>
            )}
          </div>
        )}
      </div>
      <ul className="TagListItems p-2">
        {list.map((item) => {
          return (
            <button
              key={item.lemma}
              onClick={() => isEditing ? handleTagClick(item.lemma) : navigate(`/quiz/${name}/${item.lemma}`) }
              className={classNames(
                `TagItem text-gray-50 repeat${item.repeatCount || 0}`,
                { selected: selectedItems.includes(item.lemma) }
              )}
            >
              {item.lemma}
            </button>
          );
        })}
        {!list.length && <h4 className="py-2">No Item/Words</h4>}
      </ul>
    </div>
  );
}

export default MyList;
