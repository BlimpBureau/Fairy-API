"use strict";

function createBobAndCompany(callback) {
    test.createUser("silent", "bob", "bob@clerks.com", "clerks", true, function(err, accessToken, userResponse) {
        var token = accessToken;

        var name = "Microtech inc";
        var type = "EF";
        var organisationNumber = 1337;
        test.createCompany(name, type, organisationNumber, token, function(err, companyResponse) {
            var company = companyResponse;

            test.getUser(userResponse.id, token, function(userResponse) {
                var user = userResponse;
                callback(user, token, company);
            });
        });
    });
}

describe("/companies POST", function() {
    var token;
    var user;

    beforeEach(test.databaseDrop);
    beforeEach(function(done) {
        var firstName = "silent";
        var lastName = "bob";
        var email = "bob@clerks.com";
        var password = "clerks";

        test.createUser(firstName, lastName, email, password, true, function(err, accessToken, userResponse) {
            user = userResponse;
            token = accessToken;
            done();
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
    var user;
    var token;
    var company;

    beforeEach(test.databaseDrop);
    beforeEach(function(done) {
        createBobAndCompany(function(u, t, c) {
            user = u;
            token = t;
            company = c;
            done();
        });
    });
    

    it("should be able to retrieve a company profile object by the given id", function(done) {
        test.get("/companies/" + company.id, token, function(companyResponse) {
            expect(companyResponse).to.eql(company);
            done();
        });
    });
});

describe("/companies/:id/admins POST", function(done) {
    var bob;
    var john;
    var bobToken;
    var johnToken;
    var company;

    beforeEach(test.databaseDrop);
    beforeEach(function(done) {
        test.createUser("john", "doe", "john@doe.com", "mrmittens", true, function(err, token, user) {
            john = user;
            johnToken = token;
            done();
        });
    });
    beforeEach(function(done) {
        createBobAndCompany(function(u, t, c) {
            bob = u;
            bobToken = t;
            company = c;
            done();
        });
    });

    it("should be able to add admins to the company", function(done) {
        test.post("/companies/" + company.id + "/admins", bobToken, {
            form: {
                id: john.id
            }
        }, function(companyResponse) {
            expect(companyResponse.admins).to.eql([bob.id, john.id]);
            test.getUser(john.id, johnToken, function(john) {
                expect(john.companies).to.eql([companyResponse.id]);
                done();
            });
        });
    });
});
