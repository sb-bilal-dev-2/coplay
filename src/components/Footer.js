import { useTranslation } from "react-i18next";

import React from "react";

export default function Footer() {
  const { t } = useTranslation();

  return (
    <div className="border-t border-gray-800 py-6 px-10 bg-gray-900">
      <div className="flex justify-between">
        <div className="flex">
          <a
            href="https://www.instagram.com/cosmo_ingiliz?igsh=eXpyNmJjMmkweXlk"
            className="text-gray-400 hover:text-white transition-colors mr-4"
          >
            <i className="fab fa-instagram"></i>
          </a>
          <a
            href="https://youtube.com/@cosmoingiliz?si=54bWpjT5bxlIcL2v"
            className="text-gray-400 hover:text-white transition-colors"
          >
            <i className="fab fa-youtube"></i>
          </a>
        </div>
        <div className="flex">
          <a
            href="#"
            className="text-sm text-gray-400 hover:text-white transition-colors mr-6"
          >
            {t("audio description")}
          </a>
          <a
            href="#"
            className="text-sm text-gray-400 hover:text-white transition-colors mr-6"
          >
            {t("help center")}
          </a>
          <a
            href="#"
            className="text-sm text-gray-400 hover:text-white transition-colors mr-6"
          >
            {t("gift cards")}
          </a>
        </div>
      </div>
      <div className="text-center text-gray-600 mt-6 text-xs">
        © 2024 Cosmo Ingliz, Inc.
      </div>
    </div>
  );
}
