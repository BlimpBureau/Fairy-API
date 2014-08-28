"use strict";

var express = require("express");
var bodyParser = require("body-parser");
var winston = require("winston");
var expressWinston = require("express-winston");
var Auth = require("./auth.js");
var usersController = require("./users/controller.js");
var db = require("./db.js");

var app = express();

//parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

//parse application/json
app.use(bodyParser.json());

//parse application/vnd.api+json as json
app.use(bodyParser.json({ type: "application/vnd.api+json" }));

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

var Status = require("./status/status.js");
var status = new Status(app);
status.init();

var auth = new Auth(app);
auth.init();
//auth.useFacebook();
auth.useLocal();

app.post("/users", function(req, res) {
    usersController.create(req.body.username, req.body.password, function(err, user) {
        if(err) {
            if(err.code === 1 || err.code === 2) {
                res.status(409).send(err);
            } else if(err.code === 3) {
                res.status(400).send(err);
            } else {
                console.error(err);
                res.status(500).send(err);
            }

            return;
        }

        res.status(201).send({
            username: user.username
        });
    });
});

db.connect(function(err) {
    if(err) {
        throw err;
    }

    app.listen(9999, function() {
        console.log("Listening on port 9999...");
    });
});