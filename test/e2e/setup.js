/* jshint globalstrict: false */
/* global expect: true, test: true, login: true */

//Make expect global.
expect = require("chai").expect;

//Global testing object.
test = require("./request.js");

login = function(username, password, callback) {
    "use strict";

    test.post("/auth/local", {
        form: {
            username: username,
            password: password
        }
    }, function(res) {
        callback(res.access_token);
    });
};
