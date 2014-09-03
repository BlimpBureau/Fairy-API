"use strict";

var Company = require("./companies-model.js");

exports.create = function(name, orgNumber, admin, callback) {
    var company;

    try {
        company = new Company({
            name: name,
            organisationNumber: orgNumber,
            admins: [admin]
        });
    } catch(e) {
        return callback(new Error("Invalid arguments"));
    }

    company.save(function(err) {
        if(err) {
            return callback({
                error: "internal_server_error"
            });
        }

        return callback(null, company);
    });
};
