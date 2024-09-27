import React, { useEffect } from "react";
import useAuthentication from "./Authentication.util";
import { redirect, useNavigate, useParams, useLocation } from "react-router";
import "./Authentication.css";
import StickyHeader from "../components/StickyHeader";
import { Link } from "react-router-dom";
import { GoogleAuth } from "../components/GoogleAuth";
import SecondaryButton from "../components/SecondaryButton";
import TelegramAuth from "../components/TelegramAuth";

const Authentication = () => {
  const { screen } = useParams();
  const navigate = useNavigate();
  const {
    signUp,
    confirmSignUp,
    login,
    forgotPassword,
    resetPassword,
    formData,
    updateFormDataValue,
    resetFormData,
    resendCode,
    isLoading,
    error,
    telegramLogin,
    telegramAuth,
  } = useAuthentication();
  const location = useLocation();

  useEffect(() => {
    resetFormData();
  }, [screen]);

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const userId = searchParams.get("userId");
    const telegramChatId = searchParams.get("telegramChatId");
    const username = searchParams.get("username");

    if ((userId || username) && telegramChatId) {
      if (userId) {
        telegramLogin(userId, telegramChatId, () => navigate("/"));
      }

      if (username) {
        telegramAuth(username, telegramChatId, () => navigate("/"));
      }
    }
  }, [location, navigate]);

  const handleInputChange = (e) => {
    updateFormDataValue(e.target.name, e.target.value);
  };

  const handleSignUp = (e) => {
    e.preventDefault();
    signUp(() => navigate(`/auth/confirm?login=${formData.email}`));
  };

  const handleConfirmSignUp = (e) => {
    e.preventDefault();
    const confirmEmail = new URLSearchParams(document.location.search).get(
      "login"
    );
    confirmSignUp(confirmEmail, formData.code, () => navigate("/"));

    localStorage.setItem("resentlySignUp", true);
  };

  const handleLogin = (e) => {
    e.preventDefault();
    login(() => navigate("/"));
  };

  const handleForgotPassword = (e) => {
    e.preventDefault();
    forgotPassword(formData.email, () =>
      redirect(`/auth/reset?login=${formData.email}`)
    );
  };

  const handleResetPassword = (e) => {
    e.preventDefault();
    resetPassword(formData.email, formData.code, formData.newPassword);
  };

  const renderSignUpForm = () => (
    <div className="form-container flex flex-col items-center">
      <form className="flex flex-col items-center m-auto" onSubmit={handleSignUp}>
        {/* <label>
        <input className={`${Array.isArray(error) && !!error.find((err) => err.name === "username") && 'input-error'} input mb-2`} placeholder="Username" type="text" name="username" value={formData.username || ''} onChange={handleInputChange} />
      </label> */}
        <label>
          <input
            className={`${Array.isArray(error) &&
              !!error.find((err) => err.name === "email") &&
              "input-error"
              } input mb-2`}
            placeholder="Email"
            type="email"
            name="email"
            value={formData.email || ""}
            onChange={handleInputChange}
          />
        </label>
        <label>
          <input
            className={`${Array.isArray(error) &&
              !!error.find((err) => err.name === "password") &&
              "input-error"
              } input mb-2`}
            placeholder="Password"
            type="password"
            name="password"
            value={formData.password || ""}
            onChange={handleInputChange}
          />
        </label>
        <label>
          <input
            className={`${Array.isArray(error) &&
              !!error.find((err) => err.name === "passwordRepeat") &&
              "input-error"
              } input mb-2`}
            placeholder="Repeat Password"
            type="password"
            name="passwordRepeat"
            value={formData.passwordRepeat || ""}
            onChange={handleInputChange}
          />
        </label>
        <p className="my-2">
          Already have an account? <Link to="/auth/login">Login</Link>
        </p>
        <SecondaryButton
          title="Sign Up"
          type="submit"
          disabled={isLoading}
          button
        />
      </form>
      <GoogleAuth />
      <TelegramAuth />
    </div>
  );

  const renderConfirmSignUpForm = () => (
    <form className="form-container flex flex-col items-center" onSubmit={handleConfirmSignUp}>
      {/* <label>
        <input className={`${Array.isArray(error) && !!error.find((err) => err.name === "email") && 'input-error'} input mb-2`} placeholder="Email" type="email" name="email" value={formData.email || ''} onChange={handleInputChange} />
      </label> */}
      <label>
        <input
          className={`${Array.isArray(error) &&
            !!error.find((err) => err.name === "code") &&
            "input-error"
            } input mb-2`}
          placeholder="Verification Code"
          type="text"
          name="code"
          value={formData.code || ""}
          onChange={handleInputChange}
        />
      </label>
      <button className="inversed__button" type="submit" disabled={isLoading} onClick={resendCode}>
        Resend code
      </button>
      <SecondaryButton
        title="Confirm Sign Up"
        type="submit"
        disabled={isLoading}
        button
      />
    </form>
  );

  const renderLoginForm = () => (
    <div className="flex flex-col items-center form-container">
      <form className="flex flex-col items-center" onSubmit={handleLogin}>
        <p className="my-2 text-center">
          Don't have an account? <Link to="/auth/signup">Sign up</Link>
        </p>
        <label>
          <input
            className={`${Array.isArray(error) &&
              !!error.find((err) => err.name === "email") &&
              "input-error"
              } input mb-2`}
            placeholder="Username or Email"
            type="text"
            name="email"
            value={formData.email || ""}
            onChange={handleInputChange}
          />
        </label>
        <label>
          <input
            className={`${Array.isArray(error) &&
              !!error.find((err) => err.name === "password") &&
              "input-error"
              } input mb-2`}
            placeholder="Password"
            type="password"
            name="password"
            value={formData.password || ""}
            onChange={handleInputChange}
          />
        </label>
        <p className="my-2 text-center text-white">
          Forgot the password? <Link to="/auth/forgot">Reset</Link>
        </p>
        <SecondaryButton
          title="Login"
          isLoading={isLoading}
          type="submit"
          button
        />
      </form>
      <GoogleAuth />
      <TelegramAuth />
    </div>
  );

  const renderForgotPasswordForm = () => (
    <div className="form-container">
      <form
        className="flex flex-col items-center"
        onSubmit={handleForgotPassword}
      >
        <label>
          <input
            className={`${Array.isArray(error) &&
              !!error.find((err) => err.name === "email") &&
              "input-error"
              } input mb-2`}
            placeholder="Email or Username"
            type="text"
            name="email"
            value={formData.email || ""}
            onChange={handleInputChange}
          />
        </label>
        {/* <div> */}
        <button className="inversed__button" disabled={isLoading}>
          Send a code
        </button>
        <SecondaryButton
          wShrink
          onClick={() => navigate(`/auth/reset?login=${formData.email}`)}
          title="Enter the code"
          type="submit"
          disabled={isLoading}
          button
        />
        <button >

        </button>
        {/* </div> */}
      </form>
    </div>

  );

  const renderResetPasswordForm = () => (
    <form className="flex flex-col items-center form-container" onSubmit={handleResetPassword}>
      <label>
        <input
          className={`${Array.isArray(error) &&
            !!error.find((err) => err.name === "email") &&
            "input-error"
            } input mb-2`}
          placeholder="Email or Username"
          type="text"
          name="email"
          value={formData.email || ""}
          onChange={handleInputChange}
        />
      </label>
      <label>
        <input
          className={`${Array.isArray(error) &&
            !!error.find((err) => err.name === "code") &&
            "input-error"
            } input mb-2`}
          placeholder="Verification Code"
          type="text"
          name="code"
          value={formData.code || ""}
          onChange={handleInputChange}
        />
      </label>
      <label>
        <input
          className={`${Array.isArray(error) &&
            !!error.find((err) => err.name === "password") &&
            "input-error"
            } input mb-2`}
          placeholder="New Password"
          type="password"
          name="password"
          value={formData.password || ""}
          onChange={handleInputChange}
        />
      </label>
      <label>
        <input
          className={`${Array.isArray(error) &&
            !!error.find((err) => err.name === "passwordRepeat") &&
            "input-error"
            } input mb-2`}
          placeholder="New Password"
          type="password"
          name="passwordRepeat"
          value={formData.passwordRepeat || ""}
          onChange={handleInputChange}
        />
      </label>
      <button type="submit" disabled={isLoading}>
        Reset Password
      </button>
    </form>
  );
  const renderMainAuth = () => (
    <div className="Authentication-co color-primary section bg-primary min-h-screen">
      <div className="section-container pt-20">
        {Array.isArray(error) ? (
          error.map((err) => (
            <p key={err.name} className="my-2 text-center text-red-500">
              {err.message}
            </p>
          ))
        ) : (
          <p className="my-2 text-center text-red-500">
            {(error && error.message) || error}
          </p>
        )}
        {screen === "signup" && renderSignUpForm()}
        {screen === "confirm" && renderConfirmSignUpForm()}
        {screen === "login" && renderLoginForm()}
        {screen === "forgot" && renderForgotPasswordForm()}
        {screen === "reset" && renderResetPasswordForm()}
      </div>
    </div>
  );

  return (
    <>
      <StickyHeader type="secondary" authPage />
      {renderMainAuth()}
    </>
  );
};

export default Authentication;
