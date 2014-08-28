"use strict";

var mongoose = require("mongoose");
var bcrypt = require("bcrypt-nodejs");

var UserSchema = new mongoose.Schema({
    username: {
        type: String,
        unique: true,
        required: true
    },
    password: {
        type: String,
        required: true
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

module.exports = exports = mongoose.model("User", UserSchema);
