/* jshint globalstrict: false */
/* global expect: true, test: true, login: true */

//Make expect global.
expect = require("chai").expect;

//Global testing object.
test = require("./request.js");

login = function(email, password, getProfile, callback) {
    "use strict";

    if(!callback) {
        callback = getProfile;
        getProfile = false;
    }

    test.post("/auth/local", {
        form: {
            email: email,
            password: password
        }
    }, function(res) {
        if(getProfile) {
            return test.get("/users/" + res.user_id, res.access_token, function(user) {
                callback(res.access_token, user);
            });
        }

        callback(res.access_token, res.user_id);
    });
};
