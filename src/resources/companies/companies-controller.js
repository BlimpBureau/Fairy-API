"use strict";

var Company = require("./companies-model.js");

exports.create = function(name, orgNumber, type, admin, callback) {
    var company;

    company = new Company({
        name: name,
        organisationNumber: orgNumber,
        type: type,
        admins: [admin]
    });

    company.save(function(err) {
        if(err) {
            return callback(err);
        }

        return callback(null, company);
    });
};
