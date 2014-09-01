"use strict";

var mongoose = require("mongoose");
var mockgoose = require("mockgoose");

mockgoose(mongoose);

var User = require("../src/users/model.js");
var userController = require("../src/users/controller.js");

function validateHashedPassword(user, oldPassword) {
    expect(user.password).to.not.equal(oldPassword);
    expect(user.password).to.be.a("string");
    expect(user.password).to.be.ok;
}

function validateJohnDoe(user) {
    expect(user.username).to.equal("johndoe");
    validateHashedPassword(user, "mrmittens");
}

describe("User Model", function() {
    describe("save", function() {
        it("should hash (re)hash password on save", function(done) {
            var username = "janedoe";
            var password = "fluffs";

            var user = new User({
                username: username,
                password: password
            });

            user.save(function(err) {
                expect(err).to.be.falsy;

                expect(user.username).to.equal(username);
                validateHashedPassword(user, password);

                var oldHash = user.password;
                user.password = "newpass";

                user.save(function(err) {
                    expect(err).to.be.falsy;

                    expect(user.username).to.equal(username);
                    validateHashedPassword(user, oldHash);
                    done();
                });
            });
        });

        it("should create accessTokens array if not already existing", function() {
            var user = new User({
                username: "a",
                password: "b"
            });

            user.save(function(err) {
                expect(err).to.be.falsy;
                expect(user.accessTokens).to.be.empty;

                user.accessTokens.push("token");

                user.save(function(err) {
                    expect(err).to.be.falsy;
                    expect(user.accessTokens.toObject()).to.eql(["token"]);
                });
            });
        });
    });

    describe("generateAccessToken", function() {
        it("should generate access token and save it to accessTokens array of User model", function(done) {
            var user = new User({
                username: "a",
                password: "b"
            });

            user.save(function(err) {
                expect(err).to.be.falsy;

                user.generateAccessToken(20, function(err, token) {
                    expect(err).to.be.falsy;
                    expect(token).to.be.a("string");
                    expect(token).to.be.ok;
                    expect(token).to.have.length(20);

                    var firstToken = token;

                    user.generateAccessToken(256, function(err, token) {
                        expect(err).to.be.falsy;
                        expect(token).to.be.a("string");
                        expect(token).to.be.ok;
                        expect(token).to.have.length(256);

                        expect(user.accessTokens.toObject()).to.eql([token, firstToken]);

                        done();
                    });
                });
            });
        });
    });
});

describe("Users Controller", function() {
    describe("create", function() {
        it("should be able to create an user", function(done) {
            userController.create("johndoe", "mrmittens", function(err, user) {
                if(err) {
                    throw err;
                }

                validateJohnDoe(user);
                done();
            });
        });

        it("should not be able to create two users with the same name", function(done) {
            userController.create("johndoe", "different", function(err, user) {
                expect(err).to.be.ok;
                expect(user).to.not.be.ok;
                done();
            });
        });
    });

    describe("get", function() {
        it("should be able to get users by username", function(done) {
            userController.get("johndoe", function(err, user) {
                expect(err).to.be.falsy;
                validateJohnDoe(user);
                done();
            });
        });

        it("should behave when not finding users", function(done) {
            userController.get("snowman", function(err, user) {
                expect(err).to.be.falsy;
                expect(user).to.be.falsy;
                done();
            });
        });
    });
});
