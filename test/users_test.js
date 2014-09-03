"use strict";

var mongoose = require("mongoose");
var mockgoose = require("mockgoose");
var moment = require("moment");
var _ = require("lodash");

mockgoose(mongoose);

var User = require("../src/users/model.js");
var usersController = require("../src/users/controller.js");

function errcheck(err) {
    if(err) {
        throw err;
    }
}

function createDummyUser(username, callback) {
    if(!callback) {
        callback = username;
        username = null;
    }

    var user = new User({
        username: username || "a",
        password: "b"
    });

    user.save(function(err) {
        errcheck(err);
        callback(user);
    });
}

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
    beforeEach(function() {
        mockgoose.reset("User");
    });

    describe("save", function() {
        it("should hash (re)hash password on save", function(done) {
            var username = "janedoe";
            var password = "fluffs";

            var user = new User({
                username: username,
                password: password
            });

            user.save(function(err) {
                errcheck(err);

                expect(user.username).to.equal(username);
                validateHashedPassword(user, password);

                var oldHash = user.password;
                user.password = "newpass";

                user.save(function(err) {
                    errcheck(err);

                    expect(user.username).to.equal(username);
                    validateHashedPassword(user, oldHash);
                    done();
                });
            });
        });
    });

    describe("generateAccessToken", function() {
        function validateTokenObject(object, length, expireDays) {
            expect(object.token).to.be.a("string");
            expect(object.token).to.be.ok;

            if(length) {
                expect(object.token).to.have.length(length);
            }

            expect(object.expires).to.be.ok;
            expect(object.expires).to.be.above(moment().valueOf());

            if(expireDays) {
                expect(moment(object.expires).format("YYYY-MM-DD")).to.be.equal(moment().add(expireDays, "days").format("YYYY-MM-DD"));
            }
        }

        it("should generate access token and save it to accessTokens array of User model", function(done) {
            createDummyUser(function(user) {
                user.generateAccessToken(function(err, tokenObject) {
                    errcheck(err);
                    validateTokenObject(tokenObject);

                    var firstToken = tokenObject;

                    var length = 256;
                    user.generateAccessToken(length, function(err, tokenObject) {
                        errcheck(err);
                        validateTokenObject(tokenObject, length);

                        var secondToken = tokenObject;

                        length = 10;
                        var expireDays = 3;
                        user.generateAccessToken(length, expireDays, function(err, tokenObject) {
                            errcheck(err);
                            validateTokenObject(tokenObject, length, expireDays);

                            expect(user.accessTokens.toObject()).to.eql([tokenObject, secondToken, firstToken]);

                            done();
                        });
                    });
                });
            });
        });
    });

    describe("validAccessToken", function() {
        it("should find access tokens that exists and make sure they have not expired", function(done) {
            createDummyUser(function(user) {
                user.validAccessToken("13123", function(valid, reason) {
                    expect(valid).to.equal(false);
                    expect(reason).to.equal(1);
                });

                user.generateAccessToken(function(err, tokenObject) {
                    errcheck(err);

                    user.validAccessToken(tokenObject.token, function(valid, reason) {
                        expect(valid).to.equal(true);
                        expect(reason).to.be.falsy;
                    });

                    user.generateAccessToken(20, 1, function(err, tokenObject) {
                        errcheck(err);

                        user.validAccessToken(tokenObject.token, function(valid, reason) {
                            expect(valid).to.equal(true);
                            expect(reason).to.be.falsy;

                            user.accessTokens[0].expires = moment().subtract(2, "days").valueOf();

                            user.validAccessToken(tokenObject.token, function(valid, reason) {
                                expect(valid).to.equal(false);
                                expect(reason).to.equal(2);
                                done();
                            });
                        });
                    });
                });
            });
        });
    });
});

describe("Users Controller", function() {
    beforeEach(_.partial(mockgoose.reset, "User"));

    describe("create", function() {
        it("should be able to create an user", function(done) {
            usersController.create("johndoe", "mrmittens", function(err, user) {
                if(err) {
                    throw err;
                }

                validateJohnDoe(user);
                done();
            });
        });

        it("should not be able to create two users with the same name", function(done) {
            createDummyUser("johndoe", function() {
                usersController.create("johndoe", "different", function(err, user) {
                    expect(err).to.be.ok;
                    expect(user).to.not.be.ok;
                    done();
                });
            });
        });
    });

    describe("findByUsername", function() {
        beforeEach(function(done) {
            createDummyUser("johndoe", function() {
                done();
            });
        });

        it("should be able to find users by username", function(done) {
            usersController.findByUsername("johndoe", function(err, user) {
                errcheck(err);
                validateJohnDoe(user);
                done();
            });
        });

        it("should behave when not finding users", function(done) {
            usersController.findByUsername("snowman", function(err, user) {
                errcheck(err);
                expect(user).to.be.falsy;
                done();
            });
        });
    });

    describe("findByAccessToken", function() {
        var johndoe;
        var snowman;

        beforeEach(function(done) {
            createDummyUser("snowman", function(user) {
                snowman = user;
                createDummyUser("johndoe", function(user) {
                    johndoe = user;
                    user.generateAccessToken(function() {
                        user.generateAccessToken(done);
                    });
                });
            });
        });

        it("should be able to find user by access token", function(done) {
            usersController.findByAccessToken(johndoe.accessTokens[0].token, function(err, user) {
                errcheck(err);
                expect(user.toObject()).to.eql(johndoe.toObject());

                usersController.findByAccessToken(johndoe.accessTokens[1].token, function(err, user) {
                    errcheck(err);
                    expect(user.toObject()).to.eql(johndoe.toObject());
                    done();
                });
            });
        });

        it("should behave when not finding users", function(done) {
            usersController.findByAccessToken("awdawdawd", function(err, user) {
                errcheck(err);
                expect(user).to.be.falsy;
                done();
            });
        });
    });
});
