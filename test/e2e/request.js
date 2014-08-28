var request = require("request");
var config = require("./config.js");
var _ = require("lodash");

//Make expect global.
expect = require("chai").expect;

//Global testing object.
test = {};

function requestRoute(type, route, callback) {
    request[type](config.baseUrl + route, function(err, res, body) {
        if(err) {
            throw err;
        }

        expect(res.statusCode).to.equal(200);

        callback(JSON.parse(body));
    });
}

test.post = _.partial(requestRoute, "post");
test.get = _.partial(requestRoute, "get");
