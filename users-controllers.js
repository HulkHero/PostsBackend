const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require("mongoose")
var ObjectId = require('mongodb').ObjectId;
const HttpError = require('./http-error');
const Person = require('./models');
const Profile = require('./ProfileModel');
const fs = require('fs');


const getUsers = async (req, res, next) => {
  let users;

  try {
    users = await User.find({}, '-password');
  } catch (err) {
    const error = new HttpError(
      'Fetching users failed, please try again later.',
      500
    );
    return next(error);
  }
  res.json({ users: users.map(user => user.toObject({ getters: true })) });
};

const signup = async (req, res, next) => {
  const errors = validationResult(req);
  console.log("inside signup")
  if (!errors.isEmpty()) {
    return next(
      new HttpError('Invalid inputs passed, please check your data.', 422)
    );
  }
  console.log("hello")
  const { name, email, password } = req.body;
  console.log(name)
  // let existingUser;
  // try {
  //  existingUser = await User.findOne({ name : name });
  // console.log(existingUser);
  //} catch (err) {
  // const error = new HttpError(
  //  'Signing up failed, please try again later.',
  // 500
  //);
  // return next(error);
  //}

  //if (existingUser) {
  // const error = new HttpError(
  //  'User exists already, please login instead.',
  // 422
  //);
  // return next(error);
  //}

  let hashedPassword;
  try {
    hashedPassword = await bcrypt.hash(password, 12);
  } catch (err) {
    const error = new HttpError(
      'Could not create user, please try again.',
      500
    );
    return next(error);
  }

  const createdUser = new Person({
    _id: new mongoose.Types.ObjectId(),
    name: name,
    email: email,
    password: hashedPassword,


  });

  //  try {
  await createdUser.save();

  console.log(createdUser);
  console.log("error in profile")
  var newp = await new Profile({
    createrId: ObjectId(createdUser._id),
    Status: "None",
    imagename: "default",
    avatar: {
      data: fs.readFileSync('uploads/' + "default.jpg"),
      contentType: "image/png"
    }
  })

  await newp.save()
  console.log("adding profile id", newp._id)
  await Person.updateOne({ _id: createdUser._id }, {
    profile:
      newp._id
  }).exec()
  // } catch (err) {
  //  const error = new HttpError(
  //   'Signing up failed, please try again later.',
  //  500
  //);
  // return next(error);
  //}



  res
    .status(201)
    .json(createdUser);
};

const login = async (req, res, next) => {
  const { email, password } = req.body;
  console.log("inside login")
  let existingUser;

  try {
    existingUser = await Person.findOne({ email: email });
  } catch (err) {
    const error = new HttpError(
      'Logging in failed, please try again later.',
      500
    );
    return next(error);
  }
  console.log("inside login")
  if (!existingUser) {
    const error = new HttpError(
      'Invalid credentials, could not log you in.',
      403
    );
    return next(error);
  }
  console.log("inside login")
  let isValidPassword = false;
  try {
    isValidPassword = await bcrypt.compare(password, existingUser.password);
  } catch (err) {
    const error = new HttpError(
      'Could not log you in, please check your credentials and try again.',
      500
    );
    return next(error);
  }

  if (!isValidPassword) {
    const error = new HttpError(
      'Invalid credentials, could not log you in.',
      403
    );
    return next(error);
  }

  let token;
  try {
    token = jwt.sign(
      { userId: existingUser.id, email: existingUser.email },
      'supersecret_dont_share',
      { expiresIn: '1h' }
    );
  } catch (err) {
    const error = new HttpError(
      'Logging in failed, please try again later.',
      500
    );
    return next(error);
  }

  const avatar = await Profile.findOne({ createrId: existingUser._id }).select("avatar")
  console.log(avatar);
  res.locals.user = {
    userId: existingUser.id,
    email: existingUser.email,
    token: token,
    name: existingUser.name,
    avatar: avatar.avatar

  };

  console.log("login")
  req.headers.authorization = token;
  next();
};

exports.getUsers = getUsers;
exports.signup = signup;
exports.login = login;
