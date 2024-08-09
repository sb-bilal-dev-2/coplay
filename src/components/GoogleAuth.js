import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import { useGoogleLogin } from "@react-oauth/google";

/**
 * Console @see https://console.cloud.google.com/apis/credentials
 */

export const GoogleAuth = () => {
  const login = useGoogleLogin({
    onSuccess: (credentialResponse) => {
      console.log("Login Success:", credentialResponse);
      localStorage.setItem("googleOuth", true);
    },
    onError: () => {
      console.log("Login Failed");
    },
  });
  return (
    <div className="google_login">
      <button
        onClick={() => login()}
        className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        <img
          className="w-5 h-5 mr-2"
          src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
          alt="Google logo"
        />
        Sign in with Google
      </button>{" "}
    </div>
  );
};
