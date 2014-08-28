"use strict";

var facebookAppID = process.env.FACEBOOK_APP_ID || "";
var facebookAppSecret = process.env.FACEBOOK_APP_SECRET || "";
var facebookAppCallbackUrl = process.env.FACEBOOK_APP_CALLBACK_URL || "";

exports.isFacebookSet = function() {
    return facebookAppID && facebookAppSecret && facebookAppCallbackUrl;
};

exports.getFacebookAppID = function() {
    return facebookAppID;
};

exports.getFacebookAppSecret = function() {
    return facebookAppSecret;
};

exports.getFacebookAppCallbackUrl = function() {
    return facebookAppCallbackUrl;
};

exports.getFacebookHelp = function() {
    return "export FACEBOOK_APP_ID=<app id>; export FACEBOOK_APP_SECRET=<app secret>; export FACEBOOK_APP_CALLBACK_URL=<callback url>";
};
