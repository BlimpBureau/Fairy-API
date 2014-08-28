"use strict";

var mongoose = require("mongoose");
var mockgoose = require("mockgoose");

mockgoose(mongoose);

var userController = require("../src/users/controller.js");

describe("Users Controller", function() {
    it("should be able to create an user", function(done) {
        userController.create("johndoe", "mrmittens", function(err, user) {
            if(err) {
                throw err;
            }

            expect(user.username).to.equal("johndoe");
            expect(user.password).to.not.equal("mrmittens");
            expect(user.password).to.be.a("string");
            expect(user.password).to.be.ok;
            done();
        });
    });

    it("should not be able to create two users with the same name", function() {
        userController.create("johndoe", "different", function(err, user) {
            expect(err).to.be.ok;
            expect(user).to.not.be.ok;
        });
    });
});
