"use strict";

var User = require("./model.js");

exports.create = function(username, password, callback) {
    var user = new User({
        username: username,
        password: password
    });

    user.save(function(err) {
        if(err) {
            if(err.name === "MongoError" && err.code === 11000) {
                //Trying to insert duplicate in mongodb.
                var error = new Error("Username already exists.");
                error.code = 3;
                callback(error);
            } else {
                callback(err);
            }

            return;
        }

        callback(null, user);
    });
};
