"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeleteMovie = exports.UpdateMovie = exports.AddMovie = exports.DisplayMovieByID = exports.DisplayMovieList = exports.ProcessLogout = exports.ProcessLogin = exports.ProcessRegistration = void 0;
const passport_1 = __importDefault(require("passport"));
const mongoose_1 = __importDefault(require("mongoose"));
const user_1 = __importDefault(require("../Models/user"));
const movies_1 = __importDefault(require("../Models/movies"));
const index_1 = require("../Util/index");
function SanitizeArray(unsanitizedValue) {
    if (Array.isArray(unsanitizedValue)) {
        return unsanitizedValue.map((value) => value.trim());
    }
    else if (typeof unsanitizedValue === "string") {
        return unsanitizedValue.split(",").map((value) => value.trim());
    }
    else {
        return [];
    }
}
function ProcessRegistration(req, res, next) {
    let newUser = new user_1.default({
        username: req.body.username,
        emailAddress: req.body.EmailAddress,
        displayName: req.body.FirstName + " " + req.body.LastName,
    });
    user_1.default.register(newUser, req.body.password, (err) => {
        if (err instanceof mongoose_1.default.Error.ValidationError) {
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
        return res.json({ success: true, msg: "User Registered Successfully!" });
    });
}
exports.ProcessRegistration = ProcessRegistration;
function ProcessLogin(req, res, next) {
    passport_1.default.authenticate("local", (err, user, info) => {
        if (err) {
            console.error(err);
            return next(err);
        }
        if (!user) {
            return res.json({ success: false, msg: "ERROR: User Not Logged in." });
        }
        req.logIn(user, (err) => {
            if (err) {
                console.error(err);
                res.end(err);
            }
            const authToken = (0, index_1.GenerateToken)(user);
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
exports.ProcessLogin = ProcessLogin;
function ProcessLogout(req, res, next) {
    req.logout(() => {
        console.log("User Logged Out");
    });
    res.json({ success: true, msg: "User Logged out Successfully!" });
}
exports.ProcessLogout = ProcessLogout;
function DisplayMovieList(req, res, next) {
    movies_1.default.find({})
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
exports.DisplayMovieList = DisplayMovieList;
function DisplayMovieByID(req, res, next) {
    try {
        let id = req.params.id;
        movies_1.default.findById({ _id: id })
            .then(function (data) {
            if (data) {
                res.status(200).json({
                    success: true,
                    msg: "Movie Retrieved by ID Successfully",
                    data: data,
                });
            }
            else {
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
    }
    catch (err) {
        console.error(err);
        res
            .status(500)
            .json({ success: false, msg: "ERROR: Something Went Wrong", data: null });
    }
}
exports.DisplayMovieByID = DisplayMovieByID;
function AddMovie(req, res, next) {
    try {
        let genres = SanitizeArray(req.body.genres);
        let directors = SanitizeArray(req.body.directors);
        let writers = SanitizeArray(req.body.writers);
        let actors = SanitizeArray(req.body.actors);
        let movie = new movies_1.default({
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
        movies_1.default.create(movie)
            .then(function () {
            res.status(200).json({
                success: true,
                msg: "Movie Added Successfully",
                data: movie,
            });
        })
            .catch(function (err) {
            console.error(err);
            if (err instanceof mongoose_1.default.Error.ValidationError) {
                res.status(400).json({
                    success: false,
                    msg: "ERROR: Movie Not Added. All Fields are required",
                    data: null,
                });
            }
            else {
                res.status(400).json({
                    success: false,
                    msg: "ERROR: Movie Not Added.",
                    data: null,
                });
            }
        });
    }
    catch (err) {
        console.error(err);
        res
            .status(500)
            .json({ success: false, msg: "Something Went Wrong", data: null });
    }
}
exports.AddMovie = AddMovie;
function UpdateMovie(req, res, next) {
    try {
        let id = req.params.id;
        let genres = SanitizeArray(req.body.genres);
        let directors = SanitizeArray(req.body.directors);
        let writers = SanitizeArray(req.body.writers);
        let actors = SanitizeArray(req.body.actors);
        let movieToUpdate = new movies_1.default({
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
        movies_1.default.updateOne({ _id: id }, movieToUpdate)
            .then(function () {
            res.status(200).json({
                success: true,
                msg: "Movie Updated Successfully",
                data: movieToUpdate,
            });
        })
            .catch(function (err) {
            console.error(err);
            if (err instanceof mongoose_1.default.Error.ValidationError) {
                res.status(400).json({
                    success: false,
                    msg: "ERROR: Movie Not Updated. All Fields are required",
                    data: null,
                });
            }
            else {
                res.status(400).json({
                    success: false,
                    msg: "ERROR: Movie Not Updated.",
                    data: null,
                });
            }
        });
    }
    catch (err) {
        console.error(err);
        res
            .status(500)
            .json({ success: false, msg: "Something Went Wrong", data: null });
    }
}
exports.UpdateMovie = UpdateMovie;
function DeleteMovie(req, res, next) {
    try {
        let id = req.params.id;
        movies_1.default.deleteOne({ _id: id })
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
    }
    catch (err) {
        console.error(err);
        res
            .status(500)
            .json({ success: false, msg: "ERROR: Something Went Wrong", data: null });
    }
}
exports.DeleteMovie = DeleteMovie;
//# sourceMappingURL=movies.js.map