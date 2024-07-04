import React from "react";
import "./PricePage.scss";
import StickyHeader from "../components/StickyHeader";
import { useTranslation } from "react-i18next";

export default function PricePage() {
  const { t } = useTranslation();

  const PLANS = {
    BASE: "4.99",
    AWESOME: "9.99",
    LIVE: "100"
  };

  return (
    <div className="price_page">
      <StickyHeader />

      <section class="pricing-table">
        <div class="price_card">
          <h6 class="type">{t("basic")}</h6>
          <div class="price">
            <span>$</span>{PLANS.BASE}
          </div>
          <h5 class="plan">{t("month", { item: "1" })}</h5>
          <ul class="details">
            <li></li>
            <li>
              <b className="font-bold">
                <i class="fa-solid fa-infinity pr-2"></i>Unlimited movies
              </b>{" "}
              <br />
              <p className="pl-8">Learn from all</p>
            </li>
            <li>
              <b>
                <i class="fa-solid fa-road-barrier pr-2"></i>No ads
              </b>{" "}
              <br />
              <p className="pl-8">Learn with no interruptions</p>
            </li>
            <li>
              <b>
                <i class="fa-solid fa-lines-leaning pr-2"></i>Personalized
                Practice
              </b>{" "}
              <br />
              <p className="pl-8">A daily practice plan to target your areas</p>
            </li>
          </ul>
          <div class="buy-button">
            <h3 class="btn">{t("buy")}</h3>
          </div>
        </div>

        <div class="price_card">
          <h6 class="type">{t("awesome")}</h6>
          <div class="price">
            <span>$</span>{PLANS.AWESOME}
          </div>
          <h5 class="plan">{t("month", { item: "3" })}</h5>
          <ul class="details">
            <li>
              <b className="font-bold">
                <i class="fa-solid fa-infinity pr-2"></i>Unlimited movies
              </b>{" "}
              <br />
              <p className="pl-8">Learn from all</p>
            </li>
            <li>
              <b>
                <i class="fa-solid fa-road-barrier pr-2"></i>No ads
              </b>{" "}
              <br />
              <p className="pl-8">Learn with no interruptions</p>
            </li>
            <li>
              <b>
                <i class="fa-solid fa-lines-leaning pr-2"></i>Personalized
                Practice
              </b>{" "}
              <br />
              <p className="pl-8">A daily practice plan to target your areas</p>
            </li>
          </ul>
          <div class="buy-button">
            <h3 class="btn">{t("buy")}</h3>
          </div>
        </div>

        <div class="price_card">
          <h6 class="type">premium</h6>
          <div class="price">
            <span>$</span>{PLANS.LIVE}
          </div>
          <h5 class="plan">Forever</h5>
          <ul class="details">
            <li>
              <b className="font-bold">
                <i class="fa-solid fa-infinity pr-2"></i>Unlimited movies
              </b>{" "}
              <br />
              <p className="pl-8">Learn from all</p>
            </li>
            <li>
              <b>
                <i class="fa-solid fa-road-barrier pr-2"></i>No ads
              </b>{" "}
              <br />
              <p className="pl-8">Learn with no interruptions</p>
            </li>
            <li>
              <b>
                <i class="fa-solid fa-lines-leaning pr-2"></i>Personalized
                Practice
              </b>{" "}
              <br />
              <p className="pl-8">A daily practice plan to target your areas</p>
            </li>
          </ul>
          <div class="buy-button">
            <h3 class="btn">{t("buy")}</h3>
          </div>
        </div>
      </section>
      <div className="absolute bottom-10 right-10">Support us btn</div>
    </div>
  );
}
