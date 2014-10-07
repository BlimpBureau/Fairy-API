"use strict";

var mongoose = require("mongoose");
var _ = require("lodash");
var utils = require("../../utils-model.js");

var CompanySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    type: {
        type: String,
        required: true
    },
    organisationNumber: {
        type: Number,
        required: true
    },
    admins: [mongoose.Schema.Types.ObjectId]
});

CompanySchema.methods.isUserAdmin = function(userId) {
    return !!~_.findIndex(this.admins, function(adminId) {
        return adminId.equals(userId);
    });
};

CompanySchema.methods.addAdmin = function(userId, callback) {
    var that = this;

    if(this.isUserAdmin(userId)) {
        return callback(new Error("Id already admin"), that);
    }

    this.admins.push(userId);
    this.save(function(err) {
        callback(err, err ? null : that);
    });
};

utils.setToObjectTransform(CompanySchema, function(company, ret) {
    delete ret._id;
    ret.id = company._id.toString();

    ret.admins = _.map(company.admins, function(admin) {
        return admin.toString();
    });

    return ret;
});

var Company = mongoose.model("Company", CompanySchema);

module.exports = exports = Company;

Company.schema.path("type").validate(function(value) {
    return /EF|HB|AB/.test(value);
}, "Invalid type");
