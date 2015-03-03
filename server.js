'use strict';

var Hapi = require('hapi');
var chalk = require('chalk');
var ejs = require('./lib/ejs');
var moment = require('moment');

module.exports = function init(config) {

  var server = new Hapi.Server();
  server.connection({
    port: config.port
  });

  server.views({
    isCached: config.dev ? false : true,
    engines: {
      ejs: {
        module: ejs
      }
    },
    relativeTo: __dirname,
    path: 'templates'
  });

  server.settings.app = config;

  // logging
  server.on('request', function(request, event) {
    var statics = ['css', 'img', 'js'];
    var log = true;
    if (event.data && event.data.url) {
      if (event.data.url === '/favicon.ico') {
        return;
      }
      for (var i = 0, il = statics.length; i < il; i++) {
        if (event.data.url.substr(1, statics[i].length) === statics[i]) {
          log = false;
          break;
        }
      }
      if (log) {
        console.log(chalk.blue('[LOTS] ' + moment().format('YYYY-MM-DD HH:mm:ss') + ' ' + event.data.url));
      }
    }
  });

  server.route(require('./routes/static'));
  server.route(require('./routes'));

  // server.ext('onPreResponse', require('./server/onPreResponse'));

  server.start();

  console.log(chalk.blue('[LOTS] server started on port', config.port));
};
