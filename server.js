'use strict';

var Hapi = require('hapi');
var clc = require('cli-color');
var ejs = require('./lib/ejs');
var moment = require('moment');
var path = require('path');

module.exports = function init(config){
  // server config
  var server = new Hapi.Server('localhost', config.port, {
    cors: true,
    debug: {
      request: ['error']
    },
    views: {
      isCached: false,
      path: path.join(__dirname, 'templates'),
      engines: {
        ejs: {
          module: ejs
        }
      }
    }
  });

  server.settings.app = config;

  // logging
  server.on('request', function (request, event) {
    var statics = ['css', 'img', 'js'];
    var log = true;
    if (event.data && event.data.url) {
      if (event.data.url === '/favicon.ico') {
        return;
      }
      for(var i = 0, il = statics.length; i < il; i++){
        if(event.data.url.substr(1, statics[i].length) === statics[i]){
          log = false;
          break;
        }
      }
      if(log) {
        console.log(clc.cyan('[LOTS] ' + moment().format('YYYY-MM-DD HH:mm:ss') + ' ' + event.data.url));
      }
    }
  });

  server.route(require('./routes/static'));
  server.route(require('./routes'));

  server.ext('onPreResponse', require('./server/onPreResponse'));

  server.start();

  console.log(clc.cyan('[page] server started on port', config.port));
};
