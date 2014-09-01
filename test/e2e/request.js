"use strict";

var request = require("request");
var config = require("./config.js");
var _ = require("lodash");

exports.post = _.partial(requestRoute, "post");
exports.get = _.partial(requestRoute, "get");

function requestRoute(type, route, options, callback) {
    if(_.isFunction(options)) {
        callback = options;
        options = null;
    }

    options = options || {};
    options.uri = config.baseUrl + route;

    request[type](options, function(err, res, body) {
        if(err) {
            throw err;
        }

        if(res.statusCode < 200 || res.statusCode >= 300) {
            console.error(body);
        }

        expect(res.statusCode).to.be.within(200, 299);

        var data = JSON.parse(body);
        expect(data).to.be.an("object");

        callback(data);
    });
}
