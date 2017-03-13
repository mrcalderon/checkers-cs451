// var request = require("request");
// var app = require("../app.js");
// var base_url = "http://localhost:3000/";
//
// describe("Checkers Server", function() {
//   describe("GET /", function() {
//     it("returns status code 200", function(done) {
//       request.get(base_url, function(error, response, body) {
//         expect(response.statusCode).toBe(200);
//         app.closeServer();
//         done();
//       });
//     });
//   });
// });

var Color = require('../color.js');

describe("Test the Color object", function() {
    var color = new Color(255, 255, 255);

    it('to verify that it can return a color.', function() {
        expect(color.getCurrent()).toContain(255);
    });
});
