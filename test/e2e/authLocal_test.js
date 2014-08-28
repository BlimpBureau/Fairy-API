"use strict";

describe("/auth/local POST", function() {
    it("should authenticate with username and password, to obtain an access_token", function(done) {
        test.post("/auth/local", {
            form: {
                username: "johndoe",
                password: "mylittlepony"
            }
        }, function(body) {
            expect(body.access_token).to.be.a("string");
            expect(body.access_token).to.be.ok;
            done();
        });
    });
});

