"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
let movieSchema = new mongoose_1.Schema({
    movieID: String,
    title: String,
    studio: String,
    genres: [String],
    directors: [String],
    writers: [String],
    actors: [String],
    year: Number,
    length: Number,
    shortDescription: String,
    mpaRating: String,
    criticsRating: Number,
    posterLink: String
});
let Movie = (0, mongoose_1.model)('Movie', movieSchema);
exports.default = Movie;
//# sourceMappingURL=movies.js.map