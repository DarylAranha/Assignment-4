import { Request, Response, NextFunction } from "express";
import passport from "passport";
import mongoose from "mongoose";

import User from "../Models/user";
import Movie from "../Models/movies";

import { GenerateToken } from "../Util/index";

/**
 * File: Controllers/movies.ts
 * Author: Daryl Aranha
 * ID: 200498080
 * Date: July 23, 2023
 *
 * Sanitizes the string by splitting it into array of strings
 * @param  {[string]} unsanitizedArry String seperated with comma
 *
 * @returns {[string]}  Returns Array of stings
 *
 */
function SanitizeArray(unsanitizedValue: string | string[]): string[] {
  if (Array.isArray(unsanitizedValue)) {
    return unsanitizedValue.map((value) => value.trim());
  } else if (typeof unsanitizedValue === "string") {
    return unsanitizedValue.split(",").map((value) => value.trim());
  } else {
    return [];
  }
}

/**
 * File: Controllers/movies.ts
 * Author: Daryl Aranha
 * ID: 200498080
 * Date: July 23, 2023
 *
 * Creates a new user using passport
 * @param  {[Request]} req Contains request parameters
 * @param  {[Response]} res Contains response parameter
 * @param  {[NextFunction]} next Contains middleware functionality
 *
 */
export function ProcessRegistration(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // instantiate a new user object
  let newUser = new User({
    username: req.body.username,
    emailAddress: req.body.EmailAddress,
    displayName: req.body.FirstName + " " + req.body.LastName,
  });

  User.register(newUser, req.body.password, (err) => {
    if (err instanceof mongoose.Error.ValidationError) {
      console.error("All Fields Are Required");
      return res.json({
        success: false,
        msg: "ERROR: User Not Registered. All Fields Are Required",
      });
    }

    if (err) {
      console.error("Error: Inserting New User");
      if (err.name == "UserExistsError") {
        console.error("Error: User Already Exists");
      }
      return res.json({
        success: false,
        msg: "User not Registered Successfully!",
      });
    }
    // if we had a front-end (Angular, React or a Mobile UI)...
    return res.json({ success: true, msg: "User Registered Successfully!" });
  });
}

/**
 * File: Controllers/movies.ts
 * Author: Daryl Aranha
 * ID: 200498080
 * Date: July 23, 2023
 *
 * login functionality
 * @param  {[Request]} req Contains request parameters
 * @param  {[Response]} res Contains response parameter
 * @param  {[NextFunction]} next Contains middleware functionality
 *
 */
export function ProcessLogin(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  passport.authenticate("local", (err: any, user: any, info: any) => {
    // are there server errors?
    if (err) {
      console.error(err);
      return next(err);
    }

    // are the login errors?
    if (!user) {
      return res.json({ success: false, msg: "ERROR: User Not Logged in." });
    }

    req.logIn(user, (err) => {
      // are there db errors?
      if (err) {
        console.error(err);
        res.end(err);
      }

      const authToken = GenerateToken(user);

      return res.json({
        success: true,
        msg: "User Logged In Successfully!",
        user: {
          id: user._id,
          displayName: user.displayName,
          username: user.username,
          emailAddress: user.emailAddress,
        },
        token: authToken,
      });
    });
    return;
  })(req, res, next);
}

/**
 * File: Controllers/movies.ts
 * Author: Daryl Aranha
 * ID: 200498080
 * Date: July 23, 2023
 *
 * logout functionality
 * @param  {[Request]} req Contains request parameters
 * @param  {[Response]} res Contains response parameter
 * @param  {[NextFunction]} next Contains middleware functionality
 *
 */
export function ProcessLogout(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  req.logout(() => {
    console.log("User Logged Out");
  });

  // if we had a front-end (Angular, React or Mobile UI)...
  res.json({ success: true, msg: "User Logged out Successfully!" });
}

/**
 * File: Controllers/movies.ts
 * Author: Daryl Aranha
 * ID: 200498080
 * Date: July 23, 2023
 *
 * Find list of all movies in the database
 * @param  {[Request]} req Contains request parameters
 * @param  {[Response]} res Contains response parameter
 * @param  {[NextFunction]} next Contains middleware functionality
 *
 */
export function DisplayMovieList(
  req: Request,
  res: Response,
  next: NextFunction
) {
  // Find the list of all the movies
  Movie.find({})
    .then(function (data) {
      res.status(200).json({
        success: true,
        msg: "Movie List Displayed Successfully",
        data: data,
      });
    })
    .catch(function (err) {
      console.error(err);
      res.status(500).json({
        success: false,
        msg: "ERROR: Something Went Wrong",
        data: null,
      });
    });
}

/**
 * File: Controllers/moives.ts
 * Author: Daryl Aranha
 * ID: 200498080
 * Date: July 23, 2023
 *
 * Finds the movies based on movie ID
 * @param  {[Request]} req Contains request parameters
 * @param  {[Response]} res Contains response parameter
 * @param  {[NextFunction]} next Contains middleware functionality
 *
 */
export function DisplayMovieByID(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    let id = req.params.id;
    Movie.findById({ _id: id })
      .then(function (data) {
        if (data) {
          res.status(200).json({
            success: true,
            msg: "Movie Retrieved by ID Successfully",
            data: data,
          });
        } else {
          res
            .status(404)
            .json({ success: false, msg: "Movie ID Not Found", data: data });
        }
      })
      .catch(function (err) {
        console.error(err);
        res.status(400).json({
          success: false,
          msg: "ERROR: Movie ID not formatted correctly",
          data: null,
        });
      });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ success: false, msg: "ERROR: Something Went Wrong", data: null });
  }
}

/**
 * File: Controllers/movies.ts
 * Author: Daryl Aranha
 * ID: 200498080
 * Date: July 23, 2023
 *
 * Adds new movie to the database
 * @param  {[Request]} req Contains request parameters
 * @param  {[Response]} res Contains response parameter
 * @param  {[NextFunction]} next Contains middleware functionality
 *
 */
export function AddMovie(req: Request, res: Response, next: NextFunction) {
  try {
    let genres = SanitizeArray(req.body.genres);
    let directors = SanitizeArray(req.body.directors);
    let writers = SanitizeArray(req.body.writers);
    let actors = SanitizeArray(req.body.actors);

    let movie = new Movie({
      movieID: req.body.movieID,
      title: req.body.title,
      studio: req.body.studio,
      genres: genres,
      directors: directors,
      writers: writers,
      actors: actors,
      length: req.body.length,
      year: req.body.year,
      shortDescription: req.body.shortDescription,
      mpaRating: req.body.mpaRating,
      criticsRating: req.body.criticsRating,
    });

    Movie.create(movie)
      .then(function () {
        res.status(200).json({
          success: true,
          msg: "Movie Added Successfully",
          data: movie,
        });
      })
      .catch(function (err) {
        console.error(err);
        if (err instanceof mongoose.Error.ValidationError) {
          res.status(400).json({
            success: false,
            msg: "ERROR: Movie Not Added. All Fields are required",
            data: null,
          });
        } else {
          res.status(400).json({
            success: false,
            msg: "ERROR: Movie Not Added.",
            data: null,
          });
        }
      });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ success: false, msg: "Something Went Wrong", data: null });
  }
}

/**
 * File: Controllers/movies.ts
 * Author: Daryl Aranha
 * ID: 200498080
 * Date: July 23, 2023
 *
 * Updates the movie based on movie ID
 * @param  {[Request]} req Contains request parameters
 * @param  {[Response]} res Contains response parameter
 * @param  {[NextFunction]} next Contains middleware functionality
 *
 */
export function UpdateMovie(req: Request, res: Response, next: NextFunction) {
  try {
    let id = req.params.id;
    let genres = SanitizeArray(req.body.genres);
    let directors = SanitizeArray(req.body.directors);
    let writers = SanitizeArray(req.body.writers);
    let actors = SanitizeArray(req.body.actors);

    let movieToUpdate = new Movie({
      _id: id,
      movieID: req.body.movieID,
      title: req.body.title,
      studio: req.body.studio,
      genres: genres,
      directors: directors,
      writers: writers,
      actors: actors,
      length: req.body.length,
      year: req.body.year,
      shortDescription: req.body.shortDescription,
      mpaRating: req.body.mpaRating,
      criticsRating: req.body.criticsRating,
    });

    Movie.updateOne({ _id: id }, movieToUpdate)
      .then(function () {
        res.status(200).json({
          success: true,
          msg: "Movie Updated Successfully",
          data: movieToUpdate,
        });
      })
      .catch(function (err) {
        console.error(err);
        if (err instanceof mongoose.Error.ValidationError) {
          res.status(400).json({
            success: false,
            msg: "ERROR: Movie Not Updated. All Fields are required",
            data: null,
          });
        } else {
          res.status(400).json({
            success: false,
            msg: "ERROR: Movie Not Updated.",
            data: null,
          });
        }
      });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ success: false, msg: "Something Went Wrong", data: null });
  }
}

/**
 * File: Controllers/movies.ts
 * Author: Daryl Aranha
 * ID: 200498080
 * Date: July 23, 2023
 *
 * Deletes the movies based on movie ID
 * @param  {[Request]} req Contains request parameters
 * @param  {[Response]} res Contains response parameter
 * @param  {[NextFunction]} next Contains middleware functionality
 *
 */
export function DeleteMovie(req: Request, res: Response, next: NextFunction) {
  try {
    let id = req.params.id;

    Movie.deleteOne({ _id: id })
      .then(function () {
        res
          .status(200)
          .json({ success: true, msg: "Movie Deleted Successfully", data: id });
      })
      .catch(function (err) {
        console.error(err);
        res.status(400).json({
          success: false,
          msg: "ERROR: Movie ID not formatted correctly",
          data: null,
        });
      });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ success: false, msg: "ERROR: Something Went Wrong", data: null });
  }
}
