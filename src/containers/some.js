import React from "react";

const SubscriptionPage = () => {
  return (
    <div className="bg-white p-4 max-w-md mx-auto">
      <h1 className="text-3xl font-bold mb-4">
        Unlock
        <br />
        <span className="text-blue-500">Unlimited</span>
        <br />
        Access
      </h1>

      <div className="flex justify-between mb-6">
        <div className="border rounded p-3 text-center w-1/3">
          <p className="font-bold">Monthly</p>
          <p className="text-lg font-bold">US$4,99</p>
        </div>
        <div className="border rounded p-3 text-center w-1/3 bg-blue-100 border-blue-500">
          <p className="text-blue-500 text-sm">Most Popular</p>
          <p className="font-bold">Yearly</p>
          <p className="text-sm text-blue-500">US$1,83 / month</p>
          <p className="text-lg font-bold">US$22,00</p>
        </div>
        <div className="border rounded p-3 text-center w-1/3">
          <p className="font-bold">Family</p>
          <p className="text-sm">For 6 people</p>
          <p className="text-blue-500">US$3,33 / month</p>
          <p className="text-lg font-bold">US$39,99</p>
        </div>
      </div>

      <div className="mb-4">
        <div className="flex items-center mb-2">
          <svg
            className="w-6 h-6 text-orange-500 mr-2"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z"
              clipRule="evenodd"
            />
          </svg>
          <p>Unlimited experience</p>
          <svg
            className="w-6 h-6 text-green-500 ml-auto"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <div className="flex items-center mb-2">
          <svg
            className="w-6 h-6 text-green-500 mr-2"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM4.332 8.027a6.012 6.012 0 011.912-2.706C6.512 5.73 6.974 6 7.5 6A1.5 1.5 0 019 7.5V8a2 2 0 004 0 2 2 0 011.523-1.943A5.977 5.977 0 0116 10c0 .34-.028.675-.083 1H15a2 2 0 00-2 2v2.197A5.973 5.973 0 0110 16v-2a2 2 0 00-2-2 2 2 0 01-2-2 2 2 0 00-1.668-1.973z"
              clipRule="evenodd"
            />
          </svg>
          <p>Unlimited languages</p>
          <svg
            className="w-6 h-6 text-green-500 ml-auto"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <div className="flex items-center">
          <svg
            className="w-6 h-6 text-red-500 mr-2"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z"
              clipRule="evenodd"
            />
          </svg>
          <p>100% Ad free</p>
          <svg
            className="w-6 h-6 text-green-500 ml-auto"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      </div>

      <button className="text-blue-500 mb-4">SHOW MORE PERKS</button>

      <p className="text-gray-500 text-sm mb-4">Payment provider: App Store</p>

      <button className="bg-blue-500 text-white w-full py-3 rounded-full font-bold">
        SUBSCRIBE
      </button>
    </div>
  );
};

export default SubscriptionPage;
