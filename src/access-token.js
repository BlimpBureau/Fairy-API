"use strict";

var crypto = require("crypto");

exports.generate = function(length, callback) {
    length = length || 256;

    crypto.randomBytes((length / 2) | 0, function(err, result) {
        if(err) {
            console.error("Failed to generate random bytes for access token with node crypto module. Using fallback to generate token.");

            result = uid(length);
        }

        callback(result.toString("hex"));
    });
};

//Below taken from https://github.com/jaredhanson/oauth2orize/blob/master/examples/all-grants/utils.js

/**
 * Return a unique identifier with the given `len`.
 *
 *     utils.uid(10);
 *     // => "FDaS435D2z"
 *
 * @param {Number} len
 * @return {String}
 * @api private
 */
function uid(len) {
    var buf = [];
    var chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    var charlen = chars.length;

    for(var i = 0; i < len; ++i) {
        buf.push(chars[getRandomInt(0, charlen - 1)]);
    }

    return buf.join("");
}

/**
 * Return a random int, used by `utils.uid()`
 *
 * @param {Number} min
 * @param {Number} max
 * @return {Number}
 * @api private
 */

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
