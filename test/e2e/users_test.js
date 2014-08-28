"use strict";

describe("/users POST", function() {
    it("should be able to create users", function(done) {
        test.post("/users", {
            form: {
                username: "jane",
                password: "sunshine"   
            }
        }, function(data) {
            expect(data).to.eql({
                username: "jane"
            });

            done();
        });
    });
});
