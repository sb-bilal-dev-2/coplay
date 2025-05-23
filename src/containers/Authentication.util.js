import { useState, useEffect } from 'react';
import { BASE_SERVER_URL } from '../api';

const useAuthentication = (missUserRequest) => {
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

      const response = await fetch(`${BASE_SERVER_URL}/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        if (response?.status === 400) {
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
      const response = await fetch(`${BASE_SERVER_URL}/resend-code`, {
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

      const response = await fetch(`${BASE_SERVER_URL}/confirm-signup`, {
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

      const response = await fetch(`${BASE_SERVER_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        let newError = new Error('Login Failed')

        if (response?.status === 401) {
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

const telegramLogin = async (userId, telegramChatId, callback) => {
  try {
    setIsLoading(true);

    const response = await fetch(`${BASE_SERVER_URL}/telegram-login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userId, telegramChatId }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Telegram login failed");
    }

    if (!data.token) {
      throw new Error("No token received from server");
    }

    setToken(data.token);
    localStorage.setItem("token", data.token);

    setIsLoading(false);

    callback();
  } catch (error) {
    console.error("Telegram login error:", error);
    setError(error.message);
    setIsLoading(false);
  }
};

const telegramAuth = async (username, telegramChatId, callback) => {
  try {
    setIsLoading(true);

    const response = await fetch(`${BASE_SERVER_URL}/telegram-auth`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, telegramChatId }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Telegram login failed");
    }

    if (!data.token) {
      throw new Error("No token received from server");
    }

    setToken(data.token);
    localStorage.setItem("token", data.token);

    setIsLoading(false);

    callback();
  } catch (error) {
    console.error("Telegram login error:", error);
    setError(error.message);
    setIsLoading(false);
  }
};



  const forgotPassword = async (email) => {
    try {
      setIsLoading(true);

      const response = await fetch(`${BASE_SERVER_URL}/forgot-password`, {
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

      const response = await fetch(`${BASE_SERVER_URL}/reset-password`, {
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

          const response = await fetch(`${BASE_SERVER_URL}/get-user`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
        console.log('user response', response)
        if (!response.ok) {
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
    if (!missUserRequest) {
      fetchUser();
    }
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
    telegramLogin,
    telegramAuth,
  };
};

export default useAuthentication;
