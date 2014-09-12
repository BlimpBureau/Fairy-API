"use strict";

var _ = require("lodash");
var passport = require("passport");

var error = exports.error = function(status, error, res, extras) {
    extras = extras || {};

    var response = {
        error: error
    };

    response = _.merge({
        error: error
    }, extras);

    res.status(status).send(response);
};

exports.error.notFound = _.partial(error, 404, "not_found");
exports.error.badRequest = _.partial(error, 400, "bad_request");
exports.error.serverError = _.partial(error, 500, "internal_server_error");
exports.error.notAuthorized = _.partial(error, 401, "not_authorized");

exports.tokenRequired = function() {
    return passport.authenticate("bearer", { session: false });
};
