import React from "react";
import "./PricePage.scss";
import StickyHeader from "../components/StickyHeader";

export default function PricePage() {
  return (
    <div className="price_page">
      <StickyHeader />

      <section class="pricing-table">
        <div class="price_card">
          <h6 class="type">basic</h6>
          <div class="price">
            <span>$</span>2
          </div>
          <h5 class="plan">plan</h5>
          <ul class="details">
            <li>FREE Stickers</li>
            <li>FREE Delivery</li>
            <li>24/7 support</li>
          </ul>
          <div class="buy-button">
            <h3 class="btn">subscribe</h3>
          </div>
        </div>

        <div class="price_card">
          <h6 class="type">Awesome</h6>
          <div class="price">
            <span>$</span>5
          </div>
          <h5 class="plan">plan</h5>
          <ul class="details">
            <li>FREE Stickers</li>
            <li>FREE Delivery</li>
            <li>24/7 support</li>
          </ul>
          <div class="buy-button">
            <h3 class="btn">subscribe</h3>
          </div>
        </div>

        <div class="price_card">
          <h6 class="type">premium</h6>
          <div class="price">
            <span>$</span>100
          </div>
          <h5 class="plan">plan</h5>
          <ul class="details">
            <li>FREE Stickers</li>
            <li>FREE Delivery</li>
            <li>24/7 support</li>
          </ul>
          <div class="buy-button">
            <h3 class="btn">subscribe</h3>
          </div>
        </div>
      </section>
    </div>
  );
}
