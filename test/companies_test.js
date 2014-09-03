"use strict";

var mockgoose = require("mockgoose");
var mongoose = require("mongoose");

mockgoose(mongoose);

var Company = require("../src/resources/companies/companies-model.js");
var companiesController = require("../src/resources/companies/companies-controller.js");

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
});

describe("Companies Controller", function() {
    beforeEach(function() {
        mockgoose.reset();
    });

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
                console.log("hej");

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
});
