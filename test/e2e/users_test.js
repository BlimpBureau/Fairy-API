"use strict";

describe("/users POST", function() {
    it("should be able to create users", function(done) {
        test.post("/users", {
            form: {
                username: "jane",
                password: "sunshine"
            }
        }, function(data) {
            expect(data.username).to.equal("jane");
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
        login("jane", "sunshine", function(token, id) {
            test.get("/users/" + id, token, function(body) {
                expect(body.username).to.equal("jane");
                expect(body.id).to.equal(id);
                done();
            });
        });
    });
});
