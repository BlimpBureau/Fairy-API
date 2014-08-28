"use strict";

module.exports = exports = Status;

function Status(app) {
    this.app = app;
}

Status.prototype.init = function() {
    this.app.get("/status", function(req, res) {
        res.send({
            "api": "up",
            "website": "down"
        });
    });
}
