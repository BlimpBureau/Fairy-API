"use strict";

var mongoose = require("mongoose");
var bcrypt = require("bcrypt-nodejs");
var accessToken = require("../../access-token.js");
var moment = require("moment");
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
        type: [{
            _id: false,
            token: String,
            expires: Number
        }],
        default: []
    }
});

//Execute before each user.save() call, so that password changes can be detected
//so the password can be rehashed and salted.
UserSchema.pre("save", function(callback) {
    var that = this;

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
        if(err) {
            return callback(err);
        }

        callback(null, isMatch);
    });
};

UserSchema.methods.generateAccessToken = function(length, expireDays, callback) {
    if(!callback) {
        callback = expireDays;
        expireDays = null;
    }

    if(!callback) {
        callback = length;
        length = null;
    }

    expireDays = expireDays || 7;

    var that = this;

    accessToken.generate(length, function(token) {
        var expires = moment().add(expireDays, "days").valueOf();
        var tokenObject = {
            "token": token,
            "expires": expires
        };

        that.accessTokens.unshift(tokenObject);
        that.save(function(err) {
            if(err) {
                return callback(err);
            }

            callback(null, tokenObject);
        });
    });
};

UserSchema.methods.validAccessToken = function(token, callback) {
    var foundObject;

    _.forEach(this.accessTokens, function(tokenObject) {
        if(token === tokenObject.token) {
            foundObject = tokenObject;
            return false;
        }
    });

    if(foundObject) {
        if(moment(foundObject.expires).valueOf() > moment().valueOf()) {
            return callback(true);
        } else {
            return callback(false, 2);
        }
    }

    callback(false, 1);
};

module.exports = exports = mongoose.model("User", UserSchema);