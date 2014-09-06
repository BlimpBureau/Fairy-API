"use strict";

var mongoose = require("mongoose");
var _ = require("lodash");

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

CompanySchema.methods.isUserAdmin = function(userId) {
    return !!~_.findIndex(this.admins, function(adminId) {
        return adminId.equals(userId);
    });
};

CompanySchema.options.toObject = CompanySchema.options.toObject || {};
CompanySchema.options.toObject.transform = function(company, ret) {
    delete ret._id;
    ret.id = company._id.toString();

    ret.admins = _.map(company.admins, function(admin) {
        return admin.toString();
    });

    return ret;
};

var Company = mongoose.model("Company", CompanySchema);

module.exports = exports = Company;

Company.schema.path("type").validate(function(value) {
    return /EF|HB|AB/.test(value);
}, "Invalid type");
