const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
// const TelegramBot = require('node-telegram-bot-api');
const User = require("./schemas/users.js").users_model; // Update the path accordingly
const axios = require("axios");

const SECRET = "BILALS_COSMO_SECRET_KEY";
// Function to generate JWT
const generateToken = (user) => {
  return jwt.sign({ userId: user._id, username: user.username }, SECRET, {
    expiresIn: "1y",
  });
};
const MAILER_MAIL = "cosmoingiliz@gmail.com";
// Configure nodemailer for email sending
const transporter = nodemailer.createTransport({
  service: "gmail",
  secure: true,
  auth: {
    user: MAILER_MAIL,
    pass: process.env.GMAIL_PASSWORD,
  },
});

// Configure Telegram bot
let app;

const initAuth = (ownApp) => {
  if (!app) {
    app = ownApp;
  }

  app.post("/auth/google", async (req, res) => {
    const { token } = req.body;

    try {
      console.log("Attempting to verify token with Google");
      const googleResponse = await axios.get(
        `https://www.googleapis.com/oauth2/v3/userinfo?access_token=${token}`
      );
      console.log("Google response:", googleResponse.data);
      const { email, name, picture, sub: googleId } = googleResponse.data;

      // Check if user exists in your database
      let user = await User.findOne({ email });

      if (!user) {
        // Create a new user if they don't exist
        user = new User({
          email,
          name,
          picture,
          googleId,
        });
        await user.save();
      }

      // Create a JWT token for the user
      const jwtToken = jwt.sign({ userId: user._id }, SECRET, {
        expiresIn: "1h",
      });

      res.json({
        message: "Authentication successful",
        token: jwtToken,
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          picture: user.picture,
        },
      });
    } catch (error) {
      console.error("Full error object:", error);
      console.error(
        "Error response:",
        error.response ? error.response.data : "No response data"
      );
      res
        .status(401)
        .json({ message: "Authentication failed", error: error.message });
    }
  });

  app.post("/signup", async (req, res) => {
    const { username, email, password } = req.body;

    try {
      // Check if the email already exists
      const existingUser = await User.findOne({ email });
      if (existingUser && existingUser.verifiedEmail) {
        console.log("VERIFIED_EMAIL_ERROR");
        return res.status(400).json({
          message: "User with this email already exists",
          name: "email",
        });
      } else if (existingUser && !existingUser.verifiedEmail) {
        await User.findOneAndDelete({ email });
      }

      // Generate a verification code and set the timestamp
      const verificationCode = Math.floor(100000 + Math.random() * 900000);
      const verificationCodeTimestamp = Date.now();
      const mailOptions = {
        from: MAILER_MAIL,
        to: email,
        subject: "Account Verification Code",
        text: `Your verification code: ${verificationCode}`,
      };
      try {
        console.log("Sent verification code to email: ", email);
        await transporter.sendMail(mailOptions);
      } catch (err) {
        console.log("SEND_VERIFICATION_ERROR: ", err);
      }

      // Create a new user (without saving to the database for now)
      const newUser = new User({
        username,
        email,
        password: await bcrypt.hash(password, 10),
        verificationCode,
        verificationCodeTimestamp,
      });
      newUser.save();
      res.json({
        message: "Verification code sent successfully. Check your email.",
      });
    } catch (error) {
      console.error("SIGNUP_ERROR: ", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  });

  app.post("/resend-code", async (req, res) => {
    const { email } = req.body;
    console.log("email", req.body);
    try {
      // Check if the email already exists
      const existingUser = await User.findOne({ email });
      if (!existingUser) {
        await res
          .status(400)
          .json({ message: "No user with given email", name: "email" });
      } else if (existingUser && existingUser.verifiedEmail) {
        console.log("EMAIL ALREADY VERIFIED");
        return res.status(400).json({
          message: "User with this email already exists",
          name: "email",
        });
      }

      // Generate a verification code and set the timestamp
      const verificationCode = Math.floor(100000 + Math.random() * 900000);
      const verificationCodeTimestamp = Date.now();
      const mailOptions = {
        from: MAILER_MAIL,
        to: email,
        subject: "Account Verification Code",
        text: `Your verification code: ${verificationCode}`,
      };
      try {
        console.log("Sent verification code to email: ", email);
        await transporter.sendMail(mailOptions);
      } catch (err) {
        console.log("SEND_VERIFICATION_ERROR: ", err);
      }

      // Create a new user (without saving to the database for now)

      await User.findOneAndUpdate(
        { email },
        { verificationCode, verificationCodeTimestamp }
      );
      res.json({
        message: "Verification code sent successfully. Check your email.",
      });
    } catch (error) {
      console.error("RESEND CODE ERROR: ", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  });

  // Confirm Verification Code and Save User
  app.post("/confirm-signup", async (req, res) => {
    const { email, code } = req.body;

    try {
      // Find the user by email and verification code
      const user = await User.findOne({ email });
      if (user) {
        if (user.verificationCode !== Number(code)) {
          console.log("user.email", user.email);
          console.log("user.verificationCode", user.verificationCode);
          console.log("code", code);

          return res
            .status(401)
            .json({ message: "Invalid verification code", name: "code" });
        }
      } else {
        res.status(401).json({ message: "User not found", name: "email" });
      }

      // Check if the verification code is still valid (e.g., within 15 minutes)
      const validDurationInMinutes = 15;
      const currentTime = Date.now();
      const codeTimestamp = user.verificationCodeTimestamp;
      const timeDifferenceInMinutes =
        (currentTime - codeTimestamp) / (1000 * 60);

      if (timeDifferenceInMinutes > validDurationInMinutes) {
        return res
          .status(401)
          .json({ message: "Verification code has expired" });
      }

      // Set verifiedEmail to true and clear the verification code
      user.verifiedEmail = true;
      user.verificationCode = undefined;
      user.verificationCodeTimestamp = undefined;

      // Save the user to the database
      await user.save();
      const token = generateToken(user);
      res.json({
        token,
        message: "User created and email verified successfully.",
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  });

  // Login endpoint
  app.post("/login", async (req, res) => {
    const { email, password, code, telegramChatId } = req.body;

    if (code) {
      try {
        // Find the user by code
        const user = await User.findOne({
          telegram: {
            code,
          },
        });

        const update = {
          isConnected: true,
          chatId: telegramChatId,
        };

        const updateTelegram = await User.findByIdAndUpdate(user._id, update);
        console.log("user logined: ", updateTelegram);

        if (!user) {
          return res.status(401).json({ message: "Invalid code" });
        }

        // Generate JWT and send it in the response
        const token = generateToken(user);
        console.log("Token generated: ", token);
        res.json({ token });
      } catch (error) {
         console.error("Error details:", error);

         if (error.name === "ValidationError") {
           return res
             .status(400)
             .json({ message: "Validation error", details: error.message });
         }

         if (error.name === "CastError") {
           return res.status(400).json({ message: "Invalid ID format" });
         }

         if (error.code === 11000) {
           return res.status(409).json({ message: "Duplicate key error" });
         }

         if (error.name === "JsonWebTokenError") {
           return res.status(401).json({ message: "Invalid token" });
         }

         if (error.name === "TokenExpiredError") {
           return res.status(401).json({ message: "Token expired" });
         }
         res
           .status(500)
           .json({ message: "Internal Server Error", error: error.message });
      }
    } else {
      try {
        // Find the user by email
        const user = await User.findOne({ email });
        console.log("user logined: ", user);
        if (!user) {
          return res.status(401).json({ message: "Invalid email or password" });
        }

        // Verify the password
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
          return res.status(401).json({ message: "Invalid email or password" });
        }

        // Verify if the email is already verified
        if (!user.verifiedEmail) {
          return res.status(401).json({ message: "Email not verified" });
        }

        // Generate JWT and send it in the response
        const token = generateToken(user);
        console.log("token generated: ", token);
        res.json({ token });
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
      }
    }
  });

  app.get("/get-user", requireAuth, async (req, res) => {
    try {
      console.log("REQUEST With User: ", req.userId);
      // Here, req.user will contain the user information extracted from the token.
      // You can use this information to retrieve the user from your database.
      const user = await User.findOne({ _id: req.userId });
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Return user information (you can customize what data you want to send back)
      let userData;
      if (req.query.allProps === "1") {
        userData = user;
      } else {
        userData = {
          id: user.id,
          email: user.email,
          // Add other user properties you want to include
        };
      }

      console.log("get-user userData", userData);
      res.status(200).json(userData);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  });

  // Forgot Password endpoint
  app.post("/forgot-password", async (req, res) => {
    const { email } = req.body;

    try {
      // Find the user by email
      const user = await User.findOne({ email });
      if (!user) {
        return res
          .status(404)
          .json({ message: "User not found", name: "email" });
      }

      // Generate a verification code and send it via email
      const verificationCode = Math.floor(100000 + Math.random() * 900000);
      const mailOptions = {
        from: MAILER_MAIL,
        to: email,
        subject: "Password Reset Verification Code",
        text: `Your verification code: ${verificationCode}`,
      };
      await transporter.sendMail(mailOptions);

      // Update the user's verification code and timestamp
      user.verificationCode = verificationCode;
      user.verificationCodeTimestamp = new Date();
      await user.save();

      res.json({
        message: "Verification code sent successfully. Check your email.",
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  });

  // Handle password reset with the verification code
  app.post("/reset-password", async (req, res) => {
    const { email, code, newPassword } = req.body;

    try {
      // Find the user by email
      const user = await User.findOne({ email });
      if (!user) {
        return res
          .status(404)
          .json({ message: "User not found", name: "email" });
      }

      // Verify the received code (You should compare it with the stored code in the database)
      if (user.verificationCode !== code) {
        return res
          .status(401)
          .json({ message: "Invalid verification code", name: "code" });
      }

      // Check if the verification code is still valid (e.g., within 15 minutes)
      const validDurationInMinutes = 15;
      const currentTime = new Date();
      const codeTimestamp = user.verificationCodeTimestamp;
      const timeDifferenceInMinutes =
        (currentTime - codeTimestamp) / (1000 * 60);

      if (timeDifferenceInMinutes > validDurationInMinutes) {
        return res
          .status(401)
          .json({ message: "Verification code has expired" });
      }

      // Hash the new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // Update the user's password and clear the verification code
      user.password = hashedPassword;
      user.verificationCode = undefined;
      user.verificationCodeTimestamp = undefined;
      await user.save();

      res.json({ message: "Password reset successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  });

  return {
    requireAuth,
  };
};

async function requireAuth(req, res, next) {
  // Get the token from the request header

  let token = req.header("Authorization");
  // Check if token exists
  if (!token || token === "Bearer undefined") {
    return res
      .status(401)
      .json({ message: "Access denied. Token is missing." });
  }
  token = token?.split("Bearer ")[1];

  jwt.verify(token, SECRET, (err, user) => {
    if (err) {
      console.log("TOKEN VERIFICATION ERROR: ", err);
      return res.status(403).json({ message: err });
    }
    // console.log('user from token', user)
    req.userId = user.userId;
    next();
  });
}

const getUserIdByRequestToken = (req) => {
  const token = req.header("Authorization");
  // Check if token exists
  if (!token) {
    return null;
  } else {
    return new Promise((resolve) => {
      jwt.verify(token.split("Bearer ")[1], SECRET, (err, user) => {
        if (err) {
          resolve(null);
        }

        resolve(user.userId);
      });
    });
  }
};

module.exports = {
  initAuth,
  getUserIdByRequestToken,
  UserModel: User,
};
