import React from "react";
import { useTranslation } from "react-i18next";

const TelegramAuth = () => {
  const { t } = useTranslation();

   const auth = () => {
    const telegramLink = `https://t.me/copaly_bot?start=auth`;
    window.open(telegramLink, "_blank");
   };

  return (
    <button className="flex telegram-auth-button align-center" onClick={() => auth()}>
      <img src="/tg-bot-img.png" width={30} height={30} alt="tg-bot-img" />
      <b className="text-white px-1">{t("sign in with Telegram")}</b>
    </button>
  );
};

export default TelegramAuth;
