import React from "react";
import { useTranslation } from "react-i18next";

const TelegramAuth = () => {
  const { t } = useTranslation();

   const auth = () => {
     // Replace YOUR_BOT_USERNAME with your actual Telegram bot username
     window.open(`https://t.me/YOUR_BOT_USERNAME?start=auth`, "_blank");
   };

  return (
    <button className="flex" onClick={() => auth()}>
      <img src="/tg-bot-img.png" width={30} height={30} alt="tg-bot-img" />
      <b>{t("connect to telegram")}</b>
    </button>
  );
};

export default TelegramAuth;
