/**
 * @author Robin Duda
 *
 * Parses command line parameters.
 */


webserver = process.argv[2] == 'webserver';

module.exports = {
    webserver: {
        port: process.argv[3]
    }
};