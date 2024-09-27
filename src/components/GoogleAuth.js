import { useGoogleLogin } from "@react-oauth/google";
import api from "../api";
import { updateUser } from "../store"
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router";

/**
 * Console @see https://console.cloud.google.com/apis/credentials
 */

export const GoogleAuth = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const loginAuth = useGoogleLogin({
    onSuccess: async (credentialResponse) => {
      console.log("Login Success:", credentialResponse);
      console.log("Access Token:", credentialResponse.access_token);

      try {
        const response = await api().post("/auth/google", {
          token: credentialResponse.access_token,
        });

        console.log("user google", response);

        dispatch(updateUser(response.data.user));
        localStorage.setItem("token", response.data.token);
        navigate("/")
      } catch (error) {
        console.log("Error get user from google", error);
      }
    },
    onError: () => {
      console.log("Login Failed");
    },
  });

  return (
    <button
      onClick={() => loginAuth()}
      className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-900 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
    >
      <img
        className="w-5 h-5 mr-2"
        src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
        alt="Google logo"
      />
      Google
    </button>
  );
};
