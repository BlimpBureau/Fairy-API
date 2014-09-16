"use strict";

var mongoose = require("mongoose");
var mockgoose = require("mockgoose");
var moment = require("moment");
var _ = require("lodash");

mockgoose(mongoose);

var User = require("../src/resources/users/users-model.js");
var usersController = require("../src/resources/users/users-controller.js");

function createDummyUser(firstName, lastName, email, callback) {
    if(!callback) {
        callback = email;
        email = null;
    }

    if(!callback) {
        callback = lastName;
        lastName = null;
    }

    if(!callback) {
        callback = firstName;
        firstName = null;
    }

    var user = new User({
        firstName: firstName || "joe",
        lastName: lastName || "smith",
        email: email || "joe.smith@compy.com",
        password: "easypeasy"
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
    expect(user.firstName).to.equal("john");
    expect(user.lastName).to.equal("doe");
    expect(user.email).to.equal("jodo@compy.com");
    validateHashedPassword(user, "mrmittens");
}

describe("User Model", function() {
    beforeEach(function() {
        mockgoose.reset("User");
    });

    describe("save", function() {
        it("should hash (re)hash password on save", function(done) {
            var firstName = "jane";
            var lastName = "doe";
            var email = "janedoe@some.com";
            var password = "fluffs";

            var user = new User({
                firstName: firstName,
                lastName: lastName,
                email: email,
                password: password
            });

            user.save(function(err) {
                errcheck(err);

                expect(user.firstName).to.equal(firstName);
                expect(user.lastName).to.equal(lastName);
                expect(user.email).to.equal(email);
                validateHashedPassword(user, password);

                var oldHash = user.password;
                user.password = "newpass";

                user.save(function(err) {
                    errcheck(err);

                    expect(user.firstName).to.equal(firstName);
                    expect(user.lastName).to.equal(lastName);
                    expect(user.email).to.equal(email);
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

    describe("isAdmin", function() {
        it("should return true if the user is admin of given company id", function() {
            createDummyUser(function(user) {
                var firstCompanyId = mongoose.Types.ObjectId();
                var secondCompanyId = mongoose.Types.ObjectId();

                user.companies.push(firstCompanyId);
                user.companies.push(secondCompanyId);

                expect(user.isAdmin(firstCompanyId)).to.be.ok;
                expect(user.isAdmin(secondCompanyId)).to.be.ok;
                expect(user.isAdmin(mongoose.Types.ObjectId())).to.be.falsy;
            });
        });
    });

    describe("addCompany", function() {
        it("should add company ids to the user companies array", function() {
            createDummyUser(function(user) {
                var firstCompanyId = mongoose.Types.ObjectId();
                var secondCompanyId = mongoose.Types.ObjectId();

                user.addCompany(firstCompanyId, function(err, user) {
                    errcheck(err);
                    expect(user.isAdmin(firstCompanyId)).to.be.ok;

                    user.addCompany(firstCompanyId, function(err, user) {
                        expect(err).to.be.ok;
                        expect(user.isAdmin(firstCompanyId)).to.be.ok;

                        user.addCompany(secondCompanyId, function(err, user) {
                            errcheck(err);
                            expect(user.isAdmin(firstCompanyId)).to.be.ok;
                            expect(user.isAdmin(secondCompanyId)).to.be.ok;
                        });
                    });
                });
            });
        });
    });

    describe("toObject", function() {
        it("should return an object with model information only", function(done) {
            var firstName = "jane";
            var lastName = "doe";
            var email = "janedoe@some.com";
            var password = "fluffs";

            var user = new User({
                firstName: firstName,
                lastName: lastName,
                email: email,
                password: password
            });

            expect(user.toObject()).to.eql({
                id: user.id.toString(),
                firstName: firstName,
                lastName: lastName,
                email: email,
                accessTokens: [],
                companies: []
            });

            user.addCompany(mongoose.Types.ObjectId(), function(err, user) {
                errcheck(err);

                user.generateAccessToken(20, function(err, tokenObject) {
                    errcheck(err);
                    expect(user.toObject()).to.eql({
                        id: user.id.toString(),
                        firstName: firstName,
                        lastName: lastName,
                        email: email,
                        accessTokens: [tokenObject],
                        companies: [user.companies[0].toString()]
                    });
                    done();
                });
            });
        });
    });
});

describe("Users Controller", function() {
    beforeEach(_.partial(mockgoose.reset, "User"));

    describe("create", function() {
        it("should be able to create an user", function(done) {
            usersController.create("john", "doe", "jodo@compy.com", "mrmittens", function(err, user) {
                if(err) {
                    throw err;
                }

                validateJohnDoe(user);
                done();
            });
        });

        it("should not be able to create two users with the same email", function(done) {
            createDummyUser("john", "doe", "jodo@compy.com", function() {
                usersController.create("john2", "doe2", "jodo@compy.com", "test", function(err, user) {
                    expect(err).to.be.ok;
                    expect(user).to.not.be.ok;
                    done();
                });
            });
        });
    });

    describe("findByEmail", function() {
        beforeEach(function(done) {
            createDummyUser("john", "doe", "jodo@compy.com", function() {
                done();
            });
        });

        it("should be able to find user by email", function(done) {
            usersController.findByEmail("jodo@compy.com", function(err, user) {
                errcheck(err);
                validateJohnDoe(user);
                done();
            });
        });

        it("should behave when not finding users", function(done) {
            usersController.findByEmail("snowyman@gmail.com", function(err, user) {
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
            createDummyUser("snow", "man", "snow@man.com", function(user) {
                snowman = user;
                createDummyUser("john", "doe", "jodo@compy.com", function(user) {
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

    describe("findByIds", function() {
        var johndoe;
        var snowman;

        beforeEach(function(done) {
            createDummyUser("snow", "man", "snow@man.com", function(user) {
                snowman = user;
                createDummyUser("john", "doe", "jodo@compy.com", function(user) {
                    johndoe = user;
                    user.generateAccessToken(function() {
                        user.generateAccessToken(done);
                    });
                });
            });
        });

        it("should be able to find users by given ids", function(done) {
            usersController.findByIds([johndoe.id, snowman.id], function(err, users) {
                errcheck(err);
                expect(users.length).to.equal(2);
                expect(users[0].equals(snowman));
                expect(users[1].equals(johndoe));
                done();
            });
        });
    });
});
