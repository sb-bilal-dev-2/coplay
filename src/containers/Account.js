import React, { useEffect, useState } from "react";
import StickyHeader from "../components/StickyHeader";
import Footer from "../components/Footer";
import useAuthentication from "./Authentication.util";
import axios from "axios";
import "./Account.css";

const Account = () => {
  const { user: userIdAndEmail } = useAuthentication();
  const [userInfo, setUserInfo] = useState(null);

  const requestUserInfo = async () => {
    try {
      const response = await axios(`http://localhost:3001/users/${userId}`);
      const newUserInfo = response.data;
      console.log("newUserInfo", newUserInfo);
      setUserInfo(newUserInfo);
    } catch (err) {
      console.log("ITEM GET ERROR: ", err);
    }
  };

  const userId = userIdAndEmail?.id;

  useEffect(() => {
    if (userId) {
      requestUserInfo();
    }
  }, [userId]);

  return (
    <>
      <StickyHeader />
      <div className="account_page bg-gray-900 h-screen">
        <div className="p-2 w-4/5 m-auto ">
          <h1 className="p-4 text-2xl">Account</h1>
          <div className="w-16 h-16 rounded-full border-2 border-gray-400 border-solid m-auto mb-6">
            <i class="fa-solid fa-user text-gray-400 text-center w-full h-full mt-6" />
          </div>
          <div className="bg-gray-700 m-auto p-2 rounded-md md:w-8/12 ">
            <div className="info m-10 flex">
              <i
                class="fa fa-envelope text-gray-400 p-4 text-2xl"
                aria-hidden="true"
              />
              <div>
                <span className="font-bold">Email</span>
                <p>{userInfo?.email}</p>
              </div>
            </div>
            <div className="info m-10 flex">
              <i class="fa-solid fa-lock text-gray-400 p-4 text-2xl" />
              <div className="flex flex-col">
                <span className="font-bold">Password</span>
                <input type="password" value={userInfo?.password} disabled />
              </div>
            </div>
            <div className="info m-10 flex">
              <i
                class="fa fa-language  text-gray-400 p-4 text-2xl"
                aria-hidden="true"
              />
              <div className="flex flex-col">
                <span className="font-bold">Language</span>
                <p>En</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Account;
