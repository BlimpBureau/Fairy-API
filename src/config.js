"use strict";

var _ = require("lodash");

exports.nodeEnv = getArgv("-e") || getEnv("NODE_ENV") || "development";

function getArgv(string) {
    var index = _.findIndex(process.argv, function(arg) {
        return arg === string;
    });

    if(index === -1) {
        return null;
    }

    return process.argv[index + 1];
}

function getEnv(string) {
    return process.env[string];
}
