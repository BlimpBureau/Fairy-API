"use strict";

describe("/users POST", function() {
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
    it("should retrieve profile of user by id. Should only be able to access own profile if authenticated", function(done) {
        login("jane@doe.com", "sunshine", function(token, id) {
            test.get("/users/" + id, token, function(body) {
                expect(body.firstName).to.equal("jane");
                expect(body.lastName).to.equal("doe");
                expect(body.email).to.equal("jane@doe.com");
                expect(body.id).to.equal(id);
                done();
            });
        });
    });
});
