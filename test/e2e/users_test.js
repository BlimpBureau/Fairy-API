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
            expect(data.id).to.be.ok;
            expect(data.id).to.be.a("string");

            done();
        });
    });
});

describe("/users/:username GET", function() {
    it("should retrieve profile of username. Should only be able to access own profile if authenticated", function(done) {
        login("jane", "sunshine", function(token) {
            test.get("/users/jane?access_token=" + token, function(body) {
                expect(body.username).to.equal("jane");
                expect(body.id).to.be.a("string");
                expect(body.id).to.be.ok;
                done();
            });
        });
    });
});
