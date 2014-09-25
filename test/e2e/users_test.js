"use strict";

describe("/users POST", function() {
    beforeEach(test.databaseDrop);

    it("should be able to create users", function(done) {
        test.post("/users", {
            form: {
                firstName: "jane",
                lastName: "doe",
                email: "jane@doe.com",
                password: "sunshine"
            }
        }, function(data) {
            expect(data.firstName).to.equal("jane");
            expect(data.lastName).to.equal("doe");
            expect(data.email).to.equal("jane@doe.com");
            expect(data.password).to.be.falsy;
            expect(data.id).to.be.ok;
            expect(data.id).to.be.a("string");
            expect(data.companies).to.eql([]);

            done();
        });
    });
});

describe("/users/:id GET", function() {
    var user;
    var token;

    beforeEach(test.databaseDrop);
    beforeEach(function(done) {
        test.createUser("jane", "doe", "jane@doe.com", "sunshine", true, function(err, t, u) {
            token = t;
            user = u;
            done();
        });
    });

    it("should retrieve profile of user by id. Should only be able to access own profile if authenticated", function(done) {
        test.get("/users/" + user.id, token, function(body) {
            expect(body).to.eql(user);
            done();
        });
    });
});
