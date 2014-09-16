"use strict";

var User = require("./users-model.js");

exports.create = function(firstName, lastName, email, password, callback) {
    var user = new User({
        firstName: firstName,
        lastName: lastName,
        email: email,
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

exports.findByEmail = function(email, callback) {
    User.findOne({
        email: email
    }, callback);
};

exports.findByAccessToken = function(token, callback) {
    User.findOne({
        "accessTokens.token": token
    }, callback);
};

exports.findByIds = function(ids, callback) {
    User.find({
        _id: {
            $in: ids
        }
    }).exec(function(err, users) {
        if(err) {
            return callback(err);
        }

        callback(null, users);
    });
};

exports.findById = function(id, callback) {
    User.findOne({
        _id: id
    }).exec(callback);
};
