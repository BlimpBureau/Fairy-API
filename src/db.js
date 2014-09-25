"use strict";

var mongoose = require("mongoose");
var config = require("./config.js");

var db = exports = module.exports = {};

db.connect = function(drop, callback) {
    if(!callback) {
        callback = drop;
        drop = false;
    }

    var database = "fairy";

    if(config.nodeEnv === "test") {
        console.log("Test environment detected.");
        database = "fairy-test";
    }

    mongoose.connect("mongodb://localhost:27017/" + database, function(err) {
        if(err) {
            return callback(err);
        }

        if(!db.isConnected()) {
            return callback(new Error("Invalid mongodb connection state: " + mongoose.connection.readyState));
        }

        console.log("Connected to database.");

        if(config.nodeEnv === "test") {
            console.log("Dropping database " + database + "...");
            db.drop(function(err) {
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

db.isConnected = function() {
    return mongoose.connection.readyState === 1;
};

db.drop = function(callback) {
    if(!db.isConnected()) {
        callback(new Error("Not connected to database."));
    }

    mongoose.connection.db.dropDatabase(callback);
};
