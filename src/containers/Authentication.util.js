import { useState, useEffect } from 'react';
import api from '../api';

const API_URL = 'http://localhost:3001'; // Replace with your backend API URL

const useAuthentication = () => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({}); // Initialize with an empty object

  const updateFormDataValue = (fieldName, value) => {
    setFormData((prevData) => ({ ...prevData, [fieldName]: value }));
  };

  const resetFormData = () => {
    setFormData({});
    setError(null)
  };

  const signUp = async (callback) => {
    try {
      if (formData.password !== formData.passwordRepeat) {
        console.log('errored')
        const newError = new Error('Passwords didn\'t match')
        newError.name = 'passwordRepeat'
        throw newError
      }
  
      setIsLoading(true);

      const response = await fetch(`${API_URL}/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        if (response.status === 400) {
          const newError = new Error('User Already Exists');
          newError.name = 'email'
          throw newError
        }
        throw new Error('Sign-up failed');
      } else {
        console.log('sign up successful')
        callback()
      }

      setIsLoading(false);
    } catch (error) {
      console.error(error);
      let errorArray = error;
      if (!Array.isArray(error)) {
        errorArray = [error]
      }
      setError(errorArray);
      setIsLoading(false);
    }
  };

  const resendCode = async () => {
    try {
      setIsLoading(true);
      const confirmEmail = (new URLSearchParams(document.location.search)).get('login')
      console.log('confirmEmail', confirmEmail)
      const response = await fetch(`${API_URL}/resend-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: confirmEmail }),
      });
      
      if (!response.ok) {
        throw new Error('Resend code failed with server error');
      } 
      setError('')

      setIsLoading(false);
    } catch (error) {
      console.error(error);
      setError('Confirmation failed. Please check your verification code.');
      setIsLoading(false);
    }
  };

  const confirmSignUp = async (email, code, callback) => {
    try {
      setIsLoading(true);

      const response = await fetch(`${API_URL}/confirm-signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, code }),
      });

      if (!response.ok) {
        throw new Error('Confirmation failed');
      } else {
        const data = await response.json();

        setToken(data.token);
        localStorage.setItem('token', data.token);
        callback()
      }

      setIsLoading(false);
    } catch (error) {
      console.error(error);
      setError('Confirmation failed. Please check your verification code.');
      setIsLoading(false);
    }
  };

  const login = async (callback) => {
    try {
      setIsLoading(true);

      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        let newError = new Error('Login Failed')

        if (response.status === 401) {
          newError.message = "Wrong login or password"

          throw newError
        }
        throw newError;
      }

      const data = await response.json();

      setToken(data.token);
      localStorage.setItem('token', data.token);

      setIsLoading(false);

      callback()
    } catch (error) {
      console.error(error);
      setError(error);
      setIsLoading(false);
    }
  };

  const forgotPassword = async (email) => {
    try {
      setIsLoading(true);

      const response = await fetch(`${API_URL}/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        throw new Error('Forgot password failed');
      }

      setIsLoading(false);
    } catch (error) {
      console.error(error);
      setError('Forgot password failed. Please try again.');
      setIsLoading(false);
    }
  };

  const resetPassword = async (email, code, newPassword) => {
    try {
      setIsLoading(true);

      const response = await fetch(`${API_URL}/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, code, newPassword }),
      });

      if (!response.ok) {
        throw new Error('Reset password failed');
      }

      setIsLoading(false);
    } catch (error) {
      console.error(error);
      setError('Reset password failed. Please check your verification code and try again.');
      setIsLoading(false);
    }
  };

  const logout = () => {
    setToken(null);
    localStorage.removeItem('token');
  };
  const fetchUser = async () => {
    if (token) {
      try {
        console.log('fetchUser...')
        setIsLoading(true);

          const response = await fetch(`${API_URL}/get-user`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
        console.log('user response', response)
        if (!response.ok) {
          // localStorage.removeItem('token')
          throw new Error((await response.json()).message || 'Failed to fetch user');
        }

        const userData = await response.json();
        setUser(userData);

        setIsLoading(false);
      } catch (error) {
        console.error(error);
        setError('Failed to fetch user. Please try again.');
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    console.log("useAuthentication")
    // if (fetchUserOnMount) {
      fetchUser();
    // }
  }, [token]);

  return {
    user,
    token,
    isLoading,
    error,
    formData,
    updateFormDataValue,
    resetFormData,
    signUp,
    resendCode,
    confirmSignUp,
    login,
    forgotPassword,
    resetPassword,
    logout,
  };
};

export default useAuthentication;
