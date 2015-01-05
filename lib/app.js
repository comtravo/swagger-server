'use strict';

module.exports = App;

var express = require('express');
var http = require('http');
var _ = require('lodash');
var util = require('./util');

/**
 * Extends an Express application
 * @constructor
 * @extends e.Express
 */
function App() {}


/**
 * Initializes the App
 * @private
 */
App.prototype.__init = function() {
    var self = this;

    /**
     * The Express application
     * @type {e.Express}
     * @private
     */
    self.__express = express();

    // Expose select Express methods on SwaggerServer
    ['enable', 'disable', 'enabled', 'disabled', 'set'].forEach(function(method) {
        self[method] = self.__express[method].bind(self.__express);
    });

    // Default settings
    self.enable('watch files');
    self.enable('use stubs');
    self.enable('CORS');
};


/**
 * Starts listening for connections.  This method is identical Node's {@link http.Server#listen},
 * except that the port number is optional.  If no port number is given, then the port number in
 * the Swagger API will be used.
 *
 * @param   {number}    [port]
 * @param   {string}    [hostname]
 * @param   {number}    [backlog]
 * @param   {function}  [callback]
 * @returns {http.Server}
 */
App.prototype.listen = function(port, hostname, backlog, callback) {
    var self = this;
    var args = _.isNumber(port) ? _.rest(arguments, 1) : _.rest(arguments, 0);

    var httpServer = http.createServer(self);

    // Wait until parsing is done
    self.__whenParsed(function(api, metadata) {
        if (!_.isNumber(port)) {
            // No port number was provided, so get it from the Swagger API
            var host = api ? api.host || '' : '';
            var hostMatches = host.match(/[^:]+(?:\:(\d+))?$/); // ['hostname', 'port']
            if (hostMatches && hostMatches.length === 2) {
                port = parseInt(hostMatches[1]);
            }
        }

        util.debug('Starting HTTP server');
        httpServer.listen.apply(httpServer, [port].concat(args));
    });

    return httpServer;
};


/**
 * Alias of {@link App#listen}.
 * @type {Function}
 * @returns {App}
 */
App.prototype.start = App.prototype.listen;