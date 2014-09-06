"use strict";

exports.setToObjectTransform = function(schema, transform) {
    schema.options.toObject = schema.options.toObject || {};
    schema.options.toObject.transform = transform;
};
