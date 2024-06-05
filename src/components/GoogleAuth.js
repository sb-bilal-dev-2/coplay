import { GoogleLogin } from '@react-oauth/google';

/**
 * Console @see https://console.cloud.google.com/apis/credentials
 */

export const GoogleAuth = () => {
    return (
        <GoogleLogin
            onSuccess={credentialResponse => {
                console.log("credentialResponse", credentialResponse);
            }}
            onError={() => {
                console.log('Login Failed');
            }}
        />
    )
}
