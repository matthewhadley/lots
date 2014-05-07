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
      path: __dirname + '/templates',
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
      for(var i = 0, il = statics.length; i < il; i++){
        if(event.data.url.substr(1, statics[i].length) === statics[i]){
          log = false;
          break;
        }
      }
      if(log) {
        console.log(clc.cyan('[page] ' + moment().format("YYYY-MM-DD HH:mm:ss") + ' ' + event.data.url));
      }
    }
  });

  // generate routes for static content delivery
  var statics = ['css', 'img', 'js'];
  var staticRoutes = [];
  statics.forEach(function(type){
    staticRoutes.push({
      method: 'GET',
      path: '/' + type + '/{path*}',
      handler: {
        directory: {
          path: path.join(__dirname, 'public', type),
          listing: false,
          index: false
        }
      }
    });
  });
  server.route(staticRoutes);

  server.route(require('./routes/main.js'));

  server.ext('onPreResponse', require('./server/onPreResponse'));

  // server.ext('onRequest', require('./server/onRequest')(config));

  server.start();

  // console.log(clc.cyan('[page] server started on port', config.port));

  // app.configure(function(){
  //   app.set('port', config.port);
  //   app.set('views', path.join(__dirname, 'templates'));
  //   app.set('view engine', 'dust');
  //   app.set('view cache', true);
  //   app.engine('dust', hoffman.__express());
  //   app.use(express.favicon(path.join(__dirname, 'public/img/blanklots.png')));
  //   app.set('strict routing', true);
  //   app.use(express.static(path.join(__dirname, 'public')));
  //   app.use(app.router);
  //   app.use(express.errorHandler());
  // });

  // app.get('/view/*', routes.hifile);
  // app.get('/lots', routes.lots);
  // app.get('/help', routes.help);
  // app.get('*', routes.cache);

  // return app;
};









// start the server

