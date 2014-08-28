"use strict";

var winston = require("winston");
var expressWinston = require("express-winston");
var config = require("./config.js");

exports.init = function(app) {
    if(config.nodeEnv === "development") {
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
    }

    //Between here express.router should be used if used.

    app.use(expressWinston.errorLogger({
        transports: [
            new winston.transports.Console({
                json: true,
                colorize: true
            })
        ]
    }));
};
