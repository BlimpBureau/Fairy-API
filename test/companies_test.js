"use strict";

var mockgoose = require("mockgoose");
var mongoose = require("mongoose");

mockgoose(mongoose);

var Company = require("../src/resources/companies/companies-model.js");
var companiesController = require("../src/resources/companies/companies-controller.js");

function create(name, orgNumber, id, callback) {
    var type = "EF";
    companiesController.create(name, orgNumber, type, id, function(err, company) {
        errcheck(err);
        expect(company.name).to.equal(name);
        expect(company.organisationNumber).to.equal(orgNumber);
        expect(company.type).to.equal(type);
        expect(company.admins.toObject()).to.eql([id]);
        callback(company);
    });
}

describe("Company model", function() {
    it("should construct a company model", function() {
        var company = new Company({
            name: "test",
            organisationNumber: 131,
            type: "HB"
        });

        expect(company.name).to.equal("test");
        expect(company.organisationNumber).to.equal(131);
        expect(company.type).to.equal("HB");
    });

    it("constructor should validate type", function() {
        expect(function() {
            /*jshint nonew: false */
            new Company({
                name: "Test",
                organisationNumber: 131,
                type: "AD"
            });
        }).to.throwError;
    });

    describe("isUserAdmin", function() {
        it("should return true if the given user id is an admin of the company", function() {
            var firstUserId = mongoose.Types.ObjectId();
            var secondUserId = mongoose.Types.ObjectId();

            var company = new Company({
                name: "test",
                organisationNumber: 131,
                type: "HB",
                admins: [firstUserId, secondUserId]
            });

            expect(company.isUserAdmin(firstUserId)).to.equal(true);
            expect(company.isUserAdmin(secondUserId)).to.equal(true);
            expect(company.isUserAdmin(mongoose.Types.ObjectId())).to.equal(false);
        });
    });

    describe("toObject", function() {
        it("should return an object with model information only", function() {
            var firstUserId = mongoose.Types.ObjectId();
            var secondUserId = mongoose.Types.ObjectId();

            var company = new Company({
                name: "test",
                organisationNumber: 131,
                type: "HB",
                admins: [firstUserId, secondUserId]
            });

            expect(company.toObject()).to.eql({
                id: company.id.toString(),
                name: company.name,
                organisationNumber: company.organisationNumber,
                type: company.type,
                admins: [firstUserId.toString(), secondUserId.toString()]
            });
        });
    });
});

describe("Companies Controller", function() {
    beforeEach(function() {
        mockgoose.reset();
    });

    describe("create", function() {
        it("should be able to create a company", function(done) {
            create("Macrohard inc", 1337, mongoose.Types.ObjectId(), function() {
                create("Test", 4444, mongoose.Types.ObjectId(), function() {
                    done();
                });
            });
        });

        it("should not allow to duplicates of name or organisation number", function(done) {
            create("Macrohard inc", 1337, mongoose.Types.ObjectId(), function() {
                companiesController.create("Test", 1337, "EF", mongoose.Types.ObjectId(), function(err, company) {
                    expect(err).to.be.ok;
                    expect(company).to.be.falsy;

                    companiesController.create("Macrohard inc", 4124, "EF", mongoose.Types.ObjectId(), function() {
                        expect(err).to.be.ok;
                        expect(company).to.be.falsy;
                        done();
                    });
                });
            });
        });
    });

    describe("findById", function() {
        it("should find company by id", function(done) {
            create("Macrohard inc", 1337, mongoose.Types.ObjectId(), function(firstCompany) {
                create("Test", 4444, mongoose.Types.ObjectId(), function(secondCompany) {
                    companiesController.findById(firstCompany.id, function(err, company) {
                        errcheck(err);
                        expect(company).to.be.ok;
                        expect(firstCompany.toObject()).to.eql(company.toObject());

                        companiesController.findById(secondCompany.id, function(err, company) {
                            errcheck(err);
                            expect(secondCompany.toObject()).to.eql(company.toObject());

                            companiesController.findById(mongoose.Types.ObjectId(), function(err, company) {
                                expect(err);
                                expect(company).to.be.falsy;
                                done();
                            });
                        });
                    });
                });
            });
        });
    });
});
