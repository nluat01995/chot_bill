var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var session = require("express-session");
var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");
const connectDB = require("./database/connectDB");
const cors = require("cors");
const open = require("open");

connectDB();
var app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(logger("dev"));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use(
  session({
    secret: "your_secret_key", // Key bí mật để mã hóa session ID
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 365 * 24 * 60 * 60 * 1000, // Thời gian sống của session (1 năm)
      secure: false, // Nếu true, chỉ gửi cookie qua HTTPS
      httpOnly: true, // Ngăn chặn các kịch bản nguy hiểm truy cập cookie
    },
  })
);
app.use("/", indexRouter);
app.use("/users", usersRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});
(function wakeup() {
  require("open")("https://chotbill6868-a755eac2da51.herokuapp.com/", (err) => {
    if (err) throw err;
    console.log("Woke up!");
    setTimeout(wakeup, 1740000); //29m
  });
})();

module.exports = app;
