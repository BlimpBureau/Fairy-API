"use strict";

var express = require("express");
var passport = require("passport");
var bodyParser = require("body-parser");
var db = require("./db.js");
var logging = require("./logging.js");

var app = express();

//parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

//parse application/json
app.use(bodyParser.json());

//parse application/vnd.api+json as json
app.use(bodyParser.json({ type: "application/vnd.api+json" }));

app.use(passport.initialize());

logging.init(app);

require("./routes/status.js")(app);
require("./routes/users.js")(app);
//require("./routes/auth-facebook.js")(app);
require("./routes/auth-local.js")(app);

db.connect(function(err) {
    if(err) {
        throw err;
    }

    app.listen(9999, function() {
        console.log("Listening on port 9999...");
    });
});