var express = require('express'),
    routes = require('./routes'),
    path = require('path'),
    hoffman = require('hoffman');

var app = express();

module.exports = function init(config){
  app.configure(function(){
    app.set('port', config.port);
    app.set('views', path.join(__dirname, 'templates'));
    app.set('view engine', 'dust');
    app.set('view cache', true);
    app.engine('dust', hoffman.__express());
    app.use(express.favicon(path.join(__dirname, 'public/img/blanklots.png')));
    app.set('strict routing', true);
    app.use(express.static(path.join(__dirname, 'public')));
    app.use(app.router);
    app.use(express.errorHandler());
  });

  app.get('/view/*', routes.hifile);
  app.get('/lots', routes.lots);
  app.get('/help', routes.help);
  app.get('*', routes.cache);

  return app;
};
