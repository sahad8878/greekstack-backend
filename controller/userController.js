import asyncHandler from "express-async-handler";
import User from "../model/user.js";
import generateToken from "../config/generateToken.js";

export const registerUser = asyncHandler(async (req, res) => {
  const { email, password, username } = req.body;
  if (!email || !password || !username) {
    res.status(400);
    throw new Error("Please enter all the fields");
  }

  const existUser = await User.findOne({ email });
  if (existUser) {
    res.status(400);
    throw new Error("User already exists");
  }
  const existUsername = await User.findOne({ username });
  if (existUsername) {
    res.status(400);
    throw new Error("This username already taken");
  }
  const user = await User.create({
    email: email,
    password: password,
    username: username,
  });
  if (user) {
    res.status(201).json({
      _id: user._id,
      email: user.email,
      username: user.username,
    });
  } else {
    res.status(400);
    throw new Error("User not found");
  }
});

export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400);
    throw new Error("Please enter all fields");
  }

  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    const loggedUser = await User.findOne({ isLoggedIn: true,email:email });
    if (loggedUser) {
      res.status(400);
      throw new Error("This  user already logged in another browser");
    }
    await User.findOneAndUpdate({ _id: user._id,}, { isLoggedIn: true });
    res.status(201).json({
      success: true,
      _id: user._id,
      username: user.username,
      email: user.email,
      token: generateToken(user._id),
    });
  } else {
    res.status(400);
    throw new Error(`Invalid Email  or Password`);
  }
});


export const logoutUser = async (req, res) => {
  try {
   
    const uesr = await User.findOneAndUpdate({_id:req.query.id},{isLoggedIn:false})
    res.json({success:true})
    
  } catch (error) {
    res.status(400)
    throw new Error(error);
  }
}