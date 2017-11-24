"use strict";
// Adding NodeJS modules
var fileStreamRotator = require("file-stream-rotator");
var express = require("express");
var fs = require("fs");
var path = require("path");
var logger = require("morgan");

var port = process.env.PORT || 7203;
var environment = process.env.NODE_ENV;

console.log("Starting Node");
console.log("PORT=" + port);
console.log("NODE_ENV=" + environment);

// Adding routers
//var cars = require("./api/cars");
//var companies = require("./api/companies");

// Initialize express
var app = express();
var logDirectory = path.join(__dirname, "../", "log");

// ensure log directory exists
fs.existsSync(logDirectory) || fs.mkdirSync(logDirectory);

// create a rotating write stream
var accessLogStream = fileStreamRotator.getStream({
  date_format: "YYYYMMDD",
  filename: path.join(logDirectory, "access-%DATE%.log"),
  frequency: "daily",
  verbose: false
});

// Adding logger
if (app.get("env") === "production") {
  // Production logger logs to a rotated file
  console.log(app.get("env"));
  app.use(
    logger("combined", {
      stream: accessLogStream
    })
  );
} else {
  // Development logger logs to console
  console.log(app.get("env"));
  app.use(logger("dev"));
}

// Setting API routes
//app.use("/api/cars", cars);
//app.use("/api/companies", companies);

switch (environment) {
  case "build":
    console.log("** BUILD **");
    app.use(express.static("./build/"));
    app.use("/*", express.static("./build/index.html"));
    break;
  default:
    console.log("** DEV **");
    app.use(express.static("./src/client/"));
    app.use(express.static("./"));
    app.use(express.static("./tmp"));
    app.use("/*", express.static("./src/client/index.html"));
    break;
}

app.listen(port, function() {
  console.log("Express server listening on port " + port);
  console.log(
    "env = " +
      app.get("env") +
      "\n__dirname = " +
      __dirname +
      "\nprocess.cwd = " +
      process.cwd()
  );
});
