/**
 * @author Robin Duda
 *
 * Tests for the webserver.
 */

require('./../bin/frontend/webserver');
var params = require('./../bin/params');
var http = require('http');
var assert = require('assert');


describe('webserver', function () {

    describe('/index', function () {
        it('Should return the index page without errors.', function () {

            http.request({host: 'localhost', path: '/', port: params.webserver.port}, function (response) {
                var data = "";

                response.on('data', function (chunk) {
                    data += chunk;
                });

                response.on('end', function () {
                    assert.equal(response.statusCode, 200);
                });
            }).end();

        });
    });

});