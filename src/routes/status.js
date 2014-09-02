"use strict";

module.exports = function(app) {
    app.get("/status", function(req, res) {
        res.send({
            "api": "up",
            "website": "down"
        });
    });    
};
