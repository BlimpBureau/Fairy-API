"use strict";

var mongoose = require("mongoose");

var CompanySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    type: {
        type: String,
        required: true
    },
    organisationNumber: {
        type: Number,
        required: true,
        unique: true
    },
    admins: [mongoose.Schema.Types.ObjectId]
});

var Company = mongoose.model("Company", CompanySchema);

module.exports = exports = Company;

Company.schema.path("type").validate(function(value) {
    return /EF|HB|AB/.test(value);
}, "Invalid type");
