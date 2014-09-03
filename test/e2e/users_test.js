"use strict";

function login(username, password, callback) {
    test.post("/auth/local", {
        form: {
            username: username,
            password: password
        }
    }, function(res) {
        callback(res.access_token);
    });
}

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

describe("/users/:username GET", function() {
    it("should retrieve profile of username. Should only be able to access own profile if authenticated", function(done) {
        login("jane", "sunshine", function(token) {
            test.get("/users/jane?access_token=" + token, function(body) {
                expect(body.username).to.eql("jane");
                done();
            });
        });
    });
});
