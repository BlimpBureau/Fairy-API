"use strict";

var mongoose = require("mongoose");
var bcrypt = require("bcrypt-nodejs");
var accessToken = require("../../access-token.js");
var moment = require("moment");
var _ = require("lodash");
var utils = require("../../utils-model.js");

var TokenSchema = new mongoose.Schema({
    token: {
        type: String,
        required: true
    },
    expires: {
        type: Number,
        default: 0
    }
});

var UserSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        unique: true,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    accessTokens: {
        type: [TokenSchema],
        default: []
    },
    companies: {
        type: [mongoose.Schema.Types.ObjectId],
        default: []
    },
    verified: {
        type: Boolean,
        default: false
    },
    verificationTokens: {
        type: [TokenSchema],
        default: []
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

utils.setToObjectTransform(TokenSchema, function(token, ret) {
    delete ret._id;
    delete ret.__v;

    return ret;
});

utils.setToObjectTransform(UserSchema, function(user, ret) {
    delete ret._id;
    delete ret.__v;

    delete ret.password;

    ret.id = user._id.toString();

    ret.companies = _.map(user.companies, function(company) {
        return company.toString();
    });

    return ret;
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
    generateToken(this, length, expireDays, callback);
};

UserSchema.methods.validAccessToken = function(token, callback) {
    validToken(this.accessTokens, token, callback);
};

UserSchema.methods.isAdmin = function(companyId) {
    return ~_.indexOf(this.companies, companyId);
};

UserSchema.methods.addCompany = function(companyId, callback) {
    var that = this;

    if(this.isAdmin(companyId)) {
        return callback(new Error("Company ID already exists in user companies array."), this);
    }

    this.companies.push(companyId);

    this.save(function(err) {
        if(err) {
            return callback(err);
        }

        callback(null, that);
    });
};

function generateToken(user, length, expireDays, callback) {
    if(!callback) {
        callback = expireDays;
        expireDays = null;
    }

    if(!callback) {
        callback = length;
        length = null;
    }

    expireDays  = _.isNumber(expireDays) ? expireDays : 7;

    accessToken.generate(length, function(token) {
        var expires = moment().add(expireDays, "days").valueOf();
        var tokenObject = {
            "token": token,
            "expires": expires
        };

        user.accessTokens.unshift(tokenObject);
        user.save(function(err) {
            if(err) {
                return callback(err);
            }

            callback(null, tokenObject);
        });
    });
}

function validToken(tokens, token, callback) {
    var foundObject;

    _.forEach(tokens, function(tokenObject) {
        if(token === tokenObject.token) {
            foundObject = tokenObject;
            return false;
        }
    });

    if(foundObject) {
        if(!foundObject.expires || moment(foundObject.expires).valueOf() > moment().valueOf()) {
            return callback(true);
        } else {
            return callback(false, 2);
        }
    }

    callback(false, 1);
}

module.exports = exports = mongoose.model("User", UserSchema);
