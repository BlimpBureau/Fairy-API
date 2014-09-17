"use strict";

var User = require("./users-model.js");
var _ = require("lodash");

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

exports.findByAccessToken =         _.partial(findByToken, "accessTokens");
exports.findByVerificationToken =   _.partial(findByToken, "verificationTokens");

function findByToken(type, token, callback) {
    var field = type + ".token";

    var findObject = {};
    findObject[field] = token;

    User.findOne(findObject, callback);
}
