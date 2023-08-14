"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
let router = express_1.default.Router();
const passport_1 = __importDefault(require("passport"));
const movies_1 = require("../Controllers/movies");
router.get("/list", function (req, res, next) {
    (0, movies_1.DisplayMovieList)(req, res, next);
});
router.get("/find/:id", function (req, res, next) {
    (0, movies_1.DisplayMovieByID)(req, res, next);
});
router.post("/add", passport_1.default.authenticate("jwt", { session: false }), function (req, res, next) {
    (0, movies_1.AddMovie)(req, res, next);
});
router.put("/update/:id", passport_1.default.authenticate("jwt", { session: false }), function (req, res, next) {
    (0, movies_1.UpdateMovie)(req, res, next);
});
router.delete("/delete/:id", passport_1.default.authenticate("jwt", { session: false }), function (req, res, next) {
    (0, movies_1.DeleteMovie)(req, res, next);
});
router.post("/register", function (req, res, next) {
    (0, movies_1.ProcessRegistration)(req, res, next);
});
router.post("/login", function (req, res, next) {
    (0, movies_1.ProcessLogin)(req, res, next);
});
router.get("/logout", function (req, res, next) {
    (0, movies_1.ProcessLogout)(req, res, next);
});
exports.default = router;
//# sourceMappingURL=index.js.map