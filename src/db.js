"use strict";

var mongoose = require("mongoose");
var config = require("./config.js");

exports.connect = function(callback) {
    var database = "fairy";

    if(config.nodeEnv === "test") {
        console.log("Test environment detected.");
        database = "fairy-test";
    }

    mongoose.connect("mongodb://localhost:27017/" + database, function(err) {
        if(err) {
            return callback(err);
        }

        if(mongoose.connection.readyState !== 1) {
            return callback(new Error("Invalid mongodb connection state."));
        }

        console.log("Connected to database.");

        if(config.nodeEnv === "test") {
            console.log("Dropping database " + database + "...");
            mongoose.connection.db.dropDatabase(function(err) {
                if(err) {
                    return callback(err);
                }

                console.log("Database dropped successfully.");
                callback();
            });
        } else {
            callback();
        }
    });
};
