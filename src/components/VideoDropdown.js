import { useState, useRef, useEffect } from "react";
import { useOutsideAlerter } from "../components/useOutsideAlerter";

const SETTING_LANG = {
  ON: "ON",
  OFF: "OFF",
  ON_REWIND: "ON_REWIND",
};

const TRANSLATE_LANG = {
  UZ: "uz",
  RU: "ru",
};

const findSettingValue = (value) => {
  switch (value) {
    case SETTING_LANG.ON:
      return false; // Subtitle setting should be off

    case SETTING_LANG.OFF:
      return true; // Subtitle setting should be on

    case SETTING_LANG.ON_REWIND:
      return null; // Subtitle setting should be reset or null

    default:
      console.warn(`Unexpected value: ${value}`);
      return undefined; // Return undefined for unexpected values
  }
};

function RenderDropMenu({
  setSubtitleSetting,
  setTransalteSetting,
  setTransalteLangSetting,
  transalteLangSetting,
}) {
  const [isDropOpen, setDropOpen] = useState(false);
  const outsideNavClickWrapperRef = useRef(null);
  //   useOutsideAlerter(outsideNavClickWrapperRef, () => setDropOpen(false));

  const subtitleLocal = localStorage.getItem("subtitle");
  const transalteLocal = localStorage.getItem("translate");

  const [subtitleType, setSubtitleType] = useState(
    subtitleLocal ? subtitleLocal : SETTING_LANG.ON
  );
  const [transalteType, setTransalteType] = useState(
    transalteLocal ? transalteLocal : SETTING_LANG.ON
  );

  useEffect(() => {
    const subtitleValue = findSettingValue(subtitleType);
    setSubtitleSetting(subtitleValue);

    const transalteValue = findSettingValue(transalteType);
    setTransalteSetting(transalteValue);
  });

  const handleSubtitle = (event) => {
    setSubtitleType(event.target.value);

    const subtitleValue = findSettingValue(event.target.value);
    setSubtitleSetting(subtitleValue);
  };

  const handleTransalte = (event) => {
    setTransalteType(event.target.value);

    const transalteValue = findSettingValue(event.target.value);
    setTransalteSetting(transalteValue);
  };

  const handleTranslateLang = (event) => {
    setTransalteLangSetting(event.target.value);
  };

  return (
    <div className="relative px-4">
      <i
        class="fa-regular fa-closed-captioning text-white font-medium cursor-pointer"
        onClick={() => setDropOpen(!isDropOpen)}
      />
      <div
        ref={outsideNavClickWrapperRef}
        className={`${
          isDropOpen ? "block" : "hidden"
        } absolute bg-black bottom-8 p-6 rounded drop-shadow-lg`}
      >
        {isDropOpen && (
          <ul className="w-80 flex justify-center align-middle">
            Dropdown
            <li className="text-white font-bold w-40">
              <p className="pb-2">Subtitle</p>
              <label className="radio-container">
                <input
                  type="radio"
                  name="subtitle"
                  value={SETTING_LANG.ON}
                  className="hidden"
                  onChange={handleSubtitle}
                />
                <p className="cursor-pointer pr-2">On</p>
                <span
                  className={
                    subtitleType === SETTING_LANG.ON ? "" : "checkmark"
                  }
                >
                  &#10003;
                </span>
              </label>
              <label className="radio-container">
                <input
                  type="radio"
                  name="subtitle"
                  value={SETTING_LANG.OFF}
                  className="hidden"
                  onChange={handleSubtitle}
                />
                <p className="cursor-pointer pr-2">Off</p>
                <span
                  className={
                    subtitleType === SETTING_LANG.OFF ? "" : "checkmark"
                  }
                >
                  &#10003;
                </span>
              </label>
              <label class="radio-container">
                <input
                  type="radio"
                  name="subtitle"
                  value={SETTING_LANG.ON_REWIND}
                  className="hidden"
                  onChange={handleSubtitle}
                />
                <p className="cursor-pointer pr-2">On rewind (5s)</p>
                <span
                  className={
                    subtitleType === SETTING_LANG.ON_REWIND ? "" : "checkmark"
                  }
                >
                  &#10003;
                </span>
              </label>
            </li>
            <li className="text-white font-bold pl-6 w-40">
              <p className="pb-2">Translation</p>
              <label className="radio-container">
                <input
                  type="radio"
                  name="translation"
                  value={SETTING_LANG.ON}
                  className="hidden"
                  onChange={handleTransalte}
                />
                <p className="cursor-pointer pr-2">On</p>
                <span
                  className={
                    transalteType === SETTING_LANG.ON ? "" : "checkmark"
                  }
                >
                  &#10003;
                </span>
              </label>
              <label class="radio-container">
                <input
                  type="radio"
                  name="translation"
                  value={SETTING_LANG.OFF}
                  className="hidden"
                  onChange={handleTransalte}
                />
                <p className="cursor-pointer pr-2 ">Off</p>
                <span
                  className={
                    transalteType === SETTING_LANG.OFF ? "" : "checkmark"
                  }
                >
                  &#10003;
                </span>
              </label>
              <label className="radio-container">
                <input
                  type="radio"
                  name="translation"
                  value={SETTING_LANG.ON_REWIND}
                  className="hidden"
                  onChange={handleTransalte}
                />
                <p className="cursor-pointer pr-2 pb-2">On rewind (5s)</p>
                <span
                  className={
                    transalteType === SETTING_LANG.ON_REWIND ? "" : "checkmark"
                  }
                >
                  &#10003;
                </span>
              </label>
              <span className="divide-y divide-solid min-w-80 h-1" />
              <label class="radio-container">
                <input
                  type="radio"
                  name="transaltionSubtitleLang"
                  value={TRANSLATE_LANG.UZ}
                  className="hidden"
                  onChange={handleTranslateLang}
                />
                <p className="cursor-pointer pr-2">Uz</p>
                <span
                  className={
                    transalteLangSetting === TRANSLATE_LANG.UZ
                      ? ""
                      : "checkmark"
                  }
                >
                  &#10003;
                </span>
              </label>
              <label class="radio-container">
                <input
                  type="radio"
                  name="transaltionSubtitleLang"
                  value={TRANSLATE_LANG.RU}
                  className="hidden"
                  onChange={handleTranslateLang}
                />
                <p className="cursor-pointer pr-2">Ru</p>
                <span
                  className={
                    transalteLangSetting === TRANSLATE_LANG.RU
                      ? ""
                      : "checkmark"
                  }
                >
                  &#10003;
                </span>
              </label>
            </li>
          </ul>
        )}
      </div>
    </div>
  );
}

export default RenderDropMenu;
