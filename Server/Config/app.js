"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const morgan_1 = __importDefault(require("morgan"));
const express_session_1 = __importDefault(require("express-session"));
const passport_1 = __importDefault(require("passport"));
const passport_local_1 = __importDefault(require("passport-local"));
const passport_jwt_1 = __importDefault(require("passport-jwt"));
let JWTStrategy = passport_jwt_1.default.Strategy;
let ExtractJWT = passport_jwt_1.default.ExtractJwt;
let localStrategy = passport_local_1.default.Strategy;
const user_1 = __importDefault(require("../Models/user"));
const mongoose_1 = __importDefault(require("mongoose"));
const db_1 = __importDefault(require("./db"));
mongoose_1.default.connect(db_1.default.remoteURI);
mongoose_1.default.connection.on("connected", function () {
    console.log(`Connected to MongoDB`);
    console.log(mongoose_1.default.connection.readyState);
});
mongoose_1.default.connection.on("error", function (err) {
    console.log(`Error in connecting ${err}`);
});
mongoose_1.default.connection.on("disconnected", function () {
    console.log(`Disconnected from MongoDB`);
});
const index_1 = __importDefault(require("../Routes/index"));
let app = (0, express_1.default)();
app.use((0, morgan_1.default)("dev"));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: false }));
app.use((0, cookie_parser_1.default)());
app.use((0, express_session_1.default)({
    secret: db_1.default.authSecret,
    saveUninitialized: false,
    resave: false,
}));
app.use(passport_1.default.initialize());
app.use(passport_1.default.session());
passport_1.default.use(user_1.default.createStrategy());
passport_1.default.serializeUser(user_1.default.serializeUser());
passport_1.default.deserializeUser(user_1.default.deserializeUser());
let jwtOptions = {
    jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
    secretOrKey: db_1.default.authSecret,
};
let strategy = new JWTStrategy(jwtOptions, function (jwt_payload, done) {
    try {
        const user = user_1.default.findById(jwt_payload.id);
        if (user) {
            return done(null, user);
        }
        return done(null, false);
    }
    catch (error) {
        return done(error, false);
    }
});
passport_1.default.use(strategy);
app.use("/api", index_1.default);
exports.default = app;
//# sourceMappingURL=app.js.map