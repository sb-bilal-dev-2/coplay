import React, { useState, useRef, useEffect } from "react";
import { useOutsideAlerter } from "../../components/useOutsideAlerter";

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
  const settingMap = {
    [SETTING_LANG.ON]: false,
    [SETTING_LANG.OFF]: true,
    [SETTING_LANG.ON_REWIND]: null,
  };
  return settingMap[value] ?? (() => {
    console.warn(`Unexpected value: ${value}`);
    return undefined;
  })();
};

const RadioOption = ({ name, value, currentValue, onChange, label }) => (
  <label className="radio-container">
    <input
      type="radio"
      name={name}
      value={value}
      className="hidden"
      onChange={onChange}
    />
    <p className="cursor-pointer pr-2">{label}</p>
    <span className={currentValue === value ? "" : "checkmark"}>&#10003;</span>
  </label>
);

function VideoDropdown({
  setSubtitleSetting,
  setTranslateSetting,
  setTranslateLangSetting,
  translateLangSetting,
}) {
  const [isDropOpen, setDropOpen] = useState(false);
  const dropdownRef = useRef(null);
  useOutsideAlerter(dropdownRef, () => setDropOpen(false));

  const [subtitleType, setSubtitleType] = useState(
    localStorage.getItem("subtitle") || SETTING_LANG.ON
  );
  const [translateType, setTranslateType] = useState(
    localStorage.getItem("translate") || SETTING_LANG.ON
  );

  useEffect(() => {
    setSubtitleSetting(findSettingValue(subtitleType));
    setTranslateSetting(findSettingValue(translateType));
  }, [subtitleType, translateType, setSubtitleSetting, setTranslateSetting]);

  const handleSettingChange = (setter) => (event) => {
    const value = event.target.value;
    setter(value);
    localStorage.setItem(setter === setSubtitleType ? "subtitle" : "translate", value);
  };

  return (
    <div className="relative px-4">
      <i
        className="fa-regular fa-closed-captioning text-white font-medium cursor-pointer"
        onClick={() => setDropOpen(!isDropOpen)}
      />
      {isDropOpen && (
        <div
          ref={dropdownRef}
          className="subtitle-dropdown absolute bg-black bottom-8 p-6 rounded drop-shadow-lg"
        >
          <ul className="w-80 flex justify-center align-middle p-4">
            <li className="text-white font-bold w-40">
              <p className="pb-2">Subtitle</p>
              {Object.values(SETTING_LANG).map((value) => (
                <RadioOption
                  key={value}
                  name="subtitle"
                  value={value}
                  currentValue={subtitleType}
                  onChange={handleSettingChange(setSubtitleType)}
                  label={value === SETTING_LANG.ON_REWIND ? "On rewind (5s)" : value.toLowerCase()}
                />
              ))}
            </li>
            <li className="text-white font-bold pl-6 w-40">
              <p className="pb-2">Translation</p>
              {Object.values(SETTING_LANG).map((value) => (
                <RadioOption
                  key={value}
                  name="translation"
                  value={value}
                  currentValue={translateType}
                  onChange={handleSettingChange(setTranslateType)}
                  label={value === SETTING_LANG.ON_REWIND ? "On rewind (5s)" : value.toLowerCase()}
                />
              ))}
              <span className="divide-y divide-solid min-w-80 h-1" />
              {Object.entries(TRANSLATE_LANG).map(([key, value]) => (
                <RadioOption
                  key={value}
                  name="translationSubtitleLang"
                  value={value}
                  currentValue={translateLangSetting}
                  onChange={(e) => setTranslateLangSetting(e.target.value)}
                  label={key}
                />
              ))}
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}

export default VideoDropdown;