/* jshint globalstrict: false */
/* global expect: true, test: true, _: true */

_ = require("lodash");

var db = require("../../src/db.js");

//Make expect global.
expect = require("chai").expect;

//Global testing object.
test = require("./request.js");

test.login = function(email, password, getProfile, callback) {
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

test.databaseDrop = function(callback) {
    "use strict";

    if(!db.isConnected()) {
        db.connect(function(err) {
            if(err) {
                return callback(err);
            }

            db.drop(callback);
        });
    } else {
        db.drop(callback);
    }
};

test.createUser = function(firstName, lastName, email, password, login, callback) {
    if(!callback) {
        callback = login;
        login = null;
    }

    login = login || false;

    callback = _.partial(callback, null);

    test.post("/users", {
        form: {
            firstName: firstName,
            lastName: lastName,
            email: email,
            password: password
        }
    }, function(user) {
        if(login) {
            return test.login(email, password, true, callback);
        }

        callback(user);
    });
};

test.getUser = function(id, token, callback) {
    test.get("/users/" + id, token, callback);
};

test.createCompany = function(name, type, orgNumber, token, callback) {
    test.post("/companies", token, {
        form: {
            name: name,
            type: type,
            organisationNumber: orgNumber
        }
    }, _.partial(callback, null));
};
