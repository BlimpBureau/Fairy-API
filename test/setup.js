/* jshint globalstrict: false */
/* globals expect: true, errcheck: true */

var chai = require("chai");
var sinonChai = require("sinon-chai");

chai.use(sinonChai);

expect = chai.expect;

errcheck = function(err) {
    "use strict";

    if(err) {
        throw err;
    }
};
