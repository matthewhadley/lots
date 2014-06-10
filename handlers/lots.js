'use strict';

var LOTS = require('../lib/lots');

exports.cache = function(request, reply) {
  var lots = LOTS(request.server.settings.app);
  lots.cached(function(err, data) {
    if (!err && data) {
      data.cached = true;
      return reply.view('lots', {
        lots: data
      });
    } else {
      lots.generate(function(err, data) {
        if (err) {
          reply.view('error');
        }
        reply.view('lots', {
          lots: data
        });
      });
    }
  });
};

exports.generate = function(request, reply) {
  var lots = LOTS(request.server.settings.app);
  lots.generate(function(err, data) {
    if (err) {
      return reply.view('error');
    }
    reply.view('lots', {
      lots: data
    });
    lots.log();
  });
};
