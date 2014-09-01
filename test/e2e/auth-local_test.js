"use strict";

var moment = require("moment");

describe("/auth/local POST", function() {
    it("should authenticate with username and password, to obtain an access_token", function(done) {
        test.post("/users", {
            form: {
                username: "johndoe",
                password: "mylittlepony"   
            }
        }, function() {
            test.post("/auth/local", {
                form: {
                    username: "johndoe",
                    password: "mylittlepony"
                }
            }, function(body) {
                expect(body.access_token).to.be.a("string");
                expect(body.access_token).to.be.ok;
                expect(body.access_token_expires).to.be.ok;
                expect(body.access_token_expires).to.be.a("number");
                expect(moment(body.access_token_expires).valueOf()).to.be.above(moment().valueOf());
                done();
            });    
        });
    });
});

