"use strict";

describe("/companies POST", function() {
    var token;
    var user;

    before(function(done) {
        var username = "silent bob";
        var password = "clerks";

        test.post("/users", {
            form: {
                username: username,
                password: password
            }
        }, function(userObject) {
            user = userObject;

            login(username, password, function(accessToken) {
                token = accessToken;
                done();
            });
        });
    });

    it("should be able to create companies", function(done) {
        var name = "Microtech inc";
        var type = "EF";
        var organisationNumber = 1337;

        test.post("/companies", token, {
            form: {
                name: name,
                type: type,
                organisationNumber: organisationNumber
            }
        }, function(companyResponse) {
            expect(companyResponse.id).to.be.ok;
            expect(companyResponse.id).to.be.a("string");
            expect(companyResponse.name).to.equal(name);
            expect(companyResponse.type).to.equal(type);
            expect(companyResponse.organisationNumber).to.equal(organisationNumber);

            expect(companyResponse.admins).to.eql([user.id.toString()]);

            //Check so that user got it's companies field updated.
            test.get("/users/" + user.id, token, function(userResponse) {
                expect(userResponse.companies).to.eql([companyResponse.id.toString()]);
                done();
            });
        });
    });
});

describe("/companies/:id GET", function() {
    it("should be able to retrieve a company profile object by the given id", function(done) {
        login("silent bob", "clerks", true, function(token, user) {
            test.get("/companies/" + user.companies[0], token, function(company) {
                expect(company.name).to.equal("Microtech inc");
                expect(company.id).to.equal(user.companies[0]);
                expect(company.type).to.equal("EF");
                expect(company.organisationNumber).to.equal(1337);
                expect(company.admins).to.eql([user.id]);
                done();
            });
        });
    });
});
