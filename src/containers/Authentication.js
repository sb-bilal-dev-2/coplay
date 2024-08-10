import React, { useEffect } from "react";
import useAuthentication from "./Authentication.util";
import { redirect, useNavigate, useParams } from "react-router";
import "./Authentication.css";
import StickyHeader from "../components/StickyHeader";
import { Link } from "react-router-dom";
import { GoogleAuth } from "../components/GoogleAuth";
import SecondaryButton from "../components/SecondaryButton";

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
  } = useAuthentication();

  useEffect(() => {
    resetFormData();
  }, [screen]);

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
    console.log("login 1");
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
    <div className="flex flex-col items-center">
      <form className="flex flex-col items-center" onSubmit={handleSignUp}>
        {/* <label>
        <input className={`${Array.isArray(error) && !!error.find((err) => err.name === "username") && 'input-error'} input mb-2`} placeholder="Username" type="text" name="username" value={formData.username || ''} onChange={handleInputChange} />
      </label> */}
        <label>
          <input
            className={`${
              Array.isArray(error) &&
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
            className={`${
              Array.isArray(error) &&
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
            className={`${
              Array.isArray(error) &&
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
        <p className="mt-2">
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
    </div>
  );

  const renderConfirmSignUpForm = () => (
    <form className="flex flex-col items-center" onSubmit={handleConfirmSignUp}>
      {/* <label>
        <input className={`${Array.isArray(error) && !!error.find((err) => err.name === "email") && 'input-error'} input mb-2`} placeholder="Email" type="email" name="email" value={formData.email || ''} onChange={handleInputChange} />
      </label> */}
      <label>
        <input
          className={`${
            Array.isArray(error) &&
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
      <button type="submit" disabled={isLoading} onClick={resendCode}>
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
    <div className="flex flex-col items-center">
      <form className="flex flex-col items-center" onSubmit={handleLogin}>
        <p className="mt-2 text-center text-white">
          Don't have an account? <Link to="/auth/signup">Sign up</Link>
        </p>
        <label>
          <input
            className={`${
              Array.isArray(error) &&
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
            className={`${
              Array.isArray(error) &&
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
        <p className="mt-2 text-center text-white">
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
    </div>
  );

  const renderForgotPasswordForm = () => (
    <form
      className="flex flex-col items-center"
      onSubmit={handleForgotPassword}
    >
      <label>
        <input
          className={`${
            Array.isArray(error) &&
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
      <div>
        <button type="submit" disabled={isLoading}>
          Send a code
        </button>
        <button onClick={() => navigate(`/auth/reset?login=${formData.email}`)}>
          Enter the code
        </button>
      </div>
    </form>
  );

  const renderResetPasswordForm = () => (
    <form className="flex flex-col items-center" onSubmit={handleResetPassword}>
      <label>
        <input
          className={`${
            Array.isArray(error) &&
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
          className={`${
            Array.isArray(error) &&
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
          className={`${
            Array.isArray(error) &&
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
          className={`${
            Array.isArray(error) &&
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
  console.log("error", error);
  const renderMainAuth = () => (
    <div className="Authentication-co section bg-secondary min-h-screen">
      <div className="section-container pt-20">
        {Array.isArray(error) ? (
          error.map((err) => (
            <p key={err.name} className="text-center text-red-500">
              <b>{err.message}</b>
            </p>
          ))
        ) : (
          <p className="text-center text-red-500">
            <b>{(error && error.message) || error}</b>
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
