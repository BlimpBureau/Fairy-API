"use strict";

var Company = require("../src/resources/companies/companies-model.js");

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
