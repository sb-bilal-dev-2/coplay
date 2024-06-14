import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
// import jwt_decode from 'jwt-decode'
/**
 * Console @see https://console.cloud.google.com/apis/credentials
 */

export const GoogleAuth = () => {
    return (
        <GoogleLogin
            onSuccess={credentialResponse => {
                const googleData = jwtDecode(credentialResponse?.credential);
                console.log("googleData", googleData);
            }}
            onError={() => {
                console.log('Login Failed');
            }}
        />
    )
}
