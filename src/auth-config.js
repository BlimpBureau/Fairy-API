"use strict";

var fb = exports.facebook = {};

fb.isSet = function() {
    return fb.getAppID() && fb.getAppSecret() && fb.getAppCallbackUrl();
};

fb.getAppID = function() {
    return process.env.FACEBOOK_APP_ID || "";
};

fb.getAppSecret = function() {
    return process.env.FACEBOOK_APP_SECRET || "";
};

fb.getAppCallbackUrl = function() {
    return process.env.FACEBOOK_APP_CALLBACK_URL || "";
};

fb.getHelp = function() {
    return "export FACEBOOK_APP_ID=<app id>; export FACEBOOK_APP_SECRET=<app secret>; export FACEBOOK_APP_CALLBACK_URL=<callback url>";
};

var local = exports.local = {};

local.getAccessTokenLength = function() {
    return process.env.LOCAL_ACCESS_TOKEN_LENGTH || 256;
};

local.getAccessTokenExpireDays = function() {
    return process.env.LOCAL_ACCESS_TOKEN_EXPIRE_DAYS || 7;
};
