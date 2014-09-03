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
        }, function(body) {
            expect(body.name).to.equal(name);
            expect(body.type).to.equal(type);
            expect(body.organisationNumber).to.equal(organisationNumber);

            expect(body.admins).to.eql([{
                username: user.username,
                id: user.id
            }]);
            done();
        });
    });
});
