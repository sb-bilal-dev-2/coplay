import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
// import jwt_decode from 'jwt-decode'
/**
 * Console @see https://console.cloud.google.com/apis/credentials
 */

export const GoogleAuth = () => {
  return (
    <div className="google_login">
      <GoogleLogin
        onSuccess={(credentialResponse) => {
          const googleData = jwtDecode(credentialResponse?.credential);
          console.log("googleData", googleData);
        }}
        onError={() => {
          console.log("Login Failed");
        }}
      />
    </div>
  );
};
