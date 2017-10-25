'use strict';

var path = require('path');

// generate routes for static content delivery
var statics = ['css', 'img', 'js'];
var staticRoutes = [];
statics.forEach(function (type) {
  staticRoutes.push({
    method: 'GET',
    path: '/' + type + '/{path*}',
    handler: {
      directory: {
        path: path.join(__dirname, '..', 'public', type),
        listing: false,
        index: false
      }
    }
  });
});

var helpFile = path.join(__dirname, '..', 'public', 'help.html');

staticRoutes.push({
  method: 'GET',
  path: '/help',
  handler: function (request, reply) {
    reply.file(helpFile);
  }
});

module.exports = staticRoutes;
