const createError = require("http-errors");
const express = require("express");
const path = require("path");

// import all routes
const usersRouter = require("./routes/user");
const cors = require("cors");

const app = express();

// create an error page
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

const port = 3000;
app.listen(port, () => console.log("Server is running on port " + port));

//routes
app.use(
  cors({
    origin: "http://localhost:3030",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  }),
);

app.use("/users", usersRouter);
// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

module.exports = app;
