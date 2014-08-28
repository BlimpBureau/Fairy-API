describe("/status GET", function() {
    it("should respond with status object", function(done) {
        test.get("/status", function(body) {
            if(body) {
                expect(body.api).to.equal("up");
                expect(body.website).to.satisfy(function(val) {
                    return val === "up" || val === "down";
                });
                done();
            }
        });
    });
});
