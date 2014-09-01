"use strict";

var mongoose = require("mongoose");
var bcrypt = require("bcrypt-nodejs");
var accessToken = require("../access-token.js");
var _ = require("lodash");

var UserSchema = new mongoose.Schema({
    username: {
        type: String,
        unique: true,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    accessTokens: {
        type: [String]
    }
});

//Execute before each user.save() call, so that password changes can be detected
//so the password can be rehashed and salted.
UserSchema.pre("save", function(callback) {
    var that = this;

    this.accessTokens = this.accessTokens || [];

    if(!that.isModified("password")) {
        return callback();
    }

    //Password has been changed so it needs to be rehashed and salted.
    bcrypt.genSalt(5, function(err, salt) {
        if(err) {
            return callback(err);
        }

        bcrypt.hash(that.password, salt, null, function(err, hash) {
            if(err) {
                return callback(err);
            }

            that.password = hash;
            callback();
        });
    });
});

UserSchema.methods.passwordMatches = function(password, callback) {
    bcrypt.compare(password, this.password, function(err, isMatch) {
        if(err) { return callback(err); }
        callback(null, isMatch);
    });
};

UserSchema.methods.generateAccessToken = function(length, callback) {
    if(!callback) {
        callback = length;
        length = null;
    }

    var that = this;

    accessToken.generate(length, function(token) {
        that.accessTokens.unshift(token);
        that.save(_.partialRight(callback, token));
    });
};

module.exports = exports = mongoose.model("User", UserSchema);
