"use strict";

var express = require("express");
var bodyParser = require("body-parser");
var winston = require("winston");
var expressWinston = require("express-winston");
var Auth = require("./auth.js");

var app = express();

//parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

//parse application/json
app.use(bodyParser.json())

//parse application/vnd.api+json as json
app.use(bodyParser.json({ type: 'application/vnd.api+json' }))

app.use(expressWinston.logger({
    transports: [
        new winston.transports.Console({
            json: true,
            colorize: true
        })
    ],
    meta: true, // optional: control whether you want to log the meta data about the request (default to true)
    msg: "HTTP {{req.method}} {{req.url}}" // optional: customize the default logging message. E.g. "{{res.statusCode}} {{req.method}} {{res.responseTime}}ms {{req.url}}"
}));


var auth = new Auth(app);
auth.init();
//auth.useFacebook();
auth.useLocal();

app.listen(9999, function() {
    console.log("Listening on port 9999...");
});