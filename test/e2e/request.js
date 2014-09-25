"use strict";

var request = require("request");
var config = require("./config.js");
var _ = require("lodash");

exports.post = _.partial(requestRoute, "post");
exports.get = _.partial(requestRoute, "get");

function requestRoute(type, route, token, options, callback) {
    if(!_.isFunction(callback)) {
        if(_.isFunction(options)) {
            callback = options;

            if(!_.isString(token)) {
                options = token;
                token = null;
            } else {
                options = null;
            }
        } else {
            callback = token;
            token = null;
            options = null;
        }
    }

    token = token || false;
    options = options || {};
    options.uri = config.baseUrl + route;

    if(token) {
        options.uri += "?access_token=" + token;
    }

    request[type](options, function(err, res, body) {
        if(err) {
            throw err;
        }

        if(res.statusCode < 200 || res.statusCode >= 300) {
            console.error("Body: " + body, options);
        }

        expect(res.statusCode).to.be.within(200, 299);

        var data = JSON.parse(body);
        expect(data).to.be.an("object");

        callback(data);
    });
}
