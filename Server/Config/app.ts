// All imports to run the server
import express from "express";
import path from "path";
import cookieParser from "cookie-parser";
import logger from "morgan";

// All imports for Authentication
import session from "express-session";
import passport from "passport";
import passportLocal from "passport-local";

// modules for jwt support
import cors from "cors";
import passportJWT from "passport-jwt";

// define JWT aliases
let JWTStrategy = passportJWT.Strategy;
let ExtractJWT = passportJWT.ExtractJwt;

// Authentication object
let localStrategy = passportLocal.Strategy;
import User from "../Models/user";

// Database modules
import mongoose from "mongoose";
import db from "./db";

mongoose.connect(db.remoteURI);

// DB Connection Events
// Event 1: When connection is established
mongoose.connection.on("connected", function () {
  console.log(`Connected to MongoDB`);
  console.log(mongoose.connection.readyState);
});

// When connection has some error
mongoose.connection.on("error", function (err) {
  console.log(`Error in connecting ${err}`);
});

// When connection is disconnected
mongoose.connection.on("disconnected", function () {
  console.log(`Disconnected from MongoDB`);
});

import indexRouter from "../Routes/index";

let app = express();

// All middleware modules
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// Express Sessions
app.use(
  session({
    secret: db.authSecret,
    saveUninitialized: false,
    resave: false,
  })
);

// initialize passport
app.use(passport.initialize());
app.use(passport.session());

// implement an Auth Strategy
passport.use(User.createStrategy());

// serialize and deserialize user data
passport.serializeUser(User.serializeUser() as any);
passport.deserializeUser(User.deserializeUser());

// setup JWT Options
let jwtOptions = {
  jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
  secretOrKey: db.authSecret,
};

// setup JWT Strategy
let strategy = new JWTStrategy(jwtOptions, function (jwt_payload, done) {
  try {
    const user = User.findById(jwt_payload.id);
    if (user) {
      return done(null, user);
    }
    return done(null, false);
  } catch (error) {
    return done(error, false);
  }
});

passport.use(strategy);

app.use("/api", indexRouter);

export default app;
